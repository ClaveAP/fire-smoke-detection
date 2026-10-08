"""
Classical computer-vision fire & smoke detector (no trained weights required).

Fire: pixels must satisfy combined RGB / HSV / YCbCr flame-color rules
(Chen 2004, Celik 2009). Connected regions are then scored by size, saturation,
and whether they contain a bright incandescent core.

Smoke: low-chroma, mid-brightness pixels with soft (low-gradient) texture.
Regions are scored by softness, internal turbulence, and proximity above a fire
region. In streaming mode an optional motion mask boosts moving plumes and
suppresses static grey surfaces.

This engine is a dependency-free baseline; drop a YOLO ``best.pt`` into
``backend/weights/`` for production-grade accuracy.
"""
from typing import List, Optional

import cv2
import numpy as np

from .base import Detection, clamp_bbox, non_max_suppression

WORK_SIZE = 640


def _resize(image: np.ndarray) -> np.ndarray:
    h, w = image.shape[:2]
    scale = WORK_SIZE / max(h, w)
    if scale >= 1:
        return image
    return cv2.resize(image, (int(w * scale), int(h * scale)), interpolation=cv2.INTER_AREA)


class HeuristicDetector:
    name = "heuristic-opencv"

    def __init__(self, confidence_threshold: float = 0.4, iou_threshold: float = 0.45, max_per_class: int = 5):
        self.confidence_threshold = confidence_threshold
        self.iou_threshold = iou_threshold
        self.max_per_class = max_per_class

    # ------------------------------------------------------------------ masks
    @staticmethod
    def fire_mask(img: np.ndarray) -> np.ndarray:
        b, g, r = [c.astype(np.int16) for c in cv2.split(img)]
        hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
        h, s, v = [c.astype(np.int16) for c in cv2.split(hsv)]
        ycc = cv2.cvtColor(img, cv2.COLOR_BGR2YCrCb)
        y, cr, cb = [c.astype(np.int16) for c in cv2.split(ycc)]

        rgb_rule = (r >= 190) & (r >= g) & (g >= b) & ((r - b) >= 80)
        hsv_rule = ((h <= 35) | (h >= 170)) & (s >= 90) & (v >= 190)
        ycc_rule = (y >= cb) & (cr >= cb) & (np.abs(cr - cb) >= 40) & (y >= float(y.mean()))
        mask = (rgb_rule & hsv_rule & ycc_rule).astype(np.uint8) * 255

        # Include the near-white incandescent core that sits inside flame-colored pixels.
        core = ((v >= 240) & (r >= 230) & (r >= b)).astype(np.uint8) * 255
        grown = cv2.dilate(mask, np.ones((9, 9), np.uint8))
        mask = cv2.bitwise_or(mask, cv2.bitwise_and(core, grown))

        mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, np.ones((3, 3), np.uint8))
        mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, np.ones((7, 7), np.uint8))
        return mask

    @staticmethod
    def smoke_mask(img: np.ndarray) -> np.ndarray:
        # Work on a lightly smoothed image: smoke is a low-frequency phenomenon.
        smooth = cv2.GaussianBlur(img, (7, 7), 0)
        b, g, r = [c.astype(np.int16) for c in cv2.split(smooth)]
        maxc = np.maximum(np.maximum(r, g), b)
        minc = np.minimum(np.minimum(r, g), b)
        sat = cv2.cvtColor(smooth, cv2.COLOR_BGR2HSV)[..., 1]

        # Grey / blue-grey: low absolute chroma and moderate saturation (smoke scatters all wavelengths).
        greyish = ((maxc - minc) <= 60) & (sat <= 150)
        # Not fire-colored: smoke is never strongly red-dominant.
        not_warm = ~((r - b) > 40)
        brightness = (maxc >= 75) & (maxc <= 245)
        # Brighter than the scene's large-scale background (a veil over darker content).
        # Large-sigma blur computed at 1/8 scale: same low-frequency result, ~50x cheaper.
        h, w = maxc.shape
        tiny = cv2.resize(maxc.astype(np.uint8), (max(1, w // 8), max(1, h // 8)), interpolation=cv2.INTER_AREA)
        tiny = cv2.GaussianBlur(tiny, (0, 0), sigmaX=5, borderType=cv2.BORDER_REFLECT)
        scene_bg = cv2.resize(tiny, (w, h), interpolation=cv2.INTER_LINEAR).astype(np.int16)
        veil = maxc >= np.minimum(scene_bg + 10, 200)
        mask = (greyish & not_warm & brightness & veil).astype(np.uint8) * 255

        mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, np.ones((5, 5), np.uint8))
        mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, np.ones((15, 15), np.uint8))
        return mask

    # ---------------------------------------------------------------- regions
    def _fire_regions(self, img: np.ndarray, mask: np.ndarray) -> List[Detection]:
        H, W = mask.shape
        hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
        n, labels, stats, _ = cv2.connectedComponentsWithStats(mask, connectivity=8)
        out: List[Detection] = []
        for i in range(1, n):
            x, y, w, h, area = stats[i]
            area_frac = area / float(H * W)
            if area_frac < 0.0008 or area_frac > 0.6:
                continue
            region = labels[y:y + h, x:x + w] == i
            s_vals = hsv[y:y + h, x:x + w, 1][region]
            v_vals = hsv[y:y + h, x:x + w, 2][region]
            core_ratio = float((v_vals >= 245).mean())
            fill = area / float(w * h)

            conf = (
                0.45
                + 0.20 * min(1.0, area_frac / 0.01)
                + 0.15 * min(1.0, core_ratio / 0.25)
                + 0.10 * float(s_vals.mean()) / 255.0
                + 0.08 * min(1.0, fill / 0.5)
            )
            # Pad slightly so the box covers flame tips softened by the morphology.
            pad_x, pad_y = w * 0.08, h * 0.08
            out.append(Detection(
                "fire",
                float(round(min(conf, 0.97), 3)),
                clamp_bbox((x - pad_x) / W, (y - pad_y) / H, (w + 2 * pad_x) / W, (h + 2 * pad_y) / H),
            ))
        return out

    def _smoke_regions(
        self,
        img: np.ndarray,
        mask: np.ndarray,
        fire: List[Detection],
        motion_mask: Optional[np.ndarray],
    ) -> List[Detection]:
        H, W = mask.shape
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        edges = cv2.Canny(gray, 60, 160)
        laplacian = np.abs(cv2.Laplacian(gray, cv2.CV_32F, ksize=3))
        n, labels, stats, _ = cv2.connectedComponentsWithStats(mask, connectivity=8)
        out: List[Detection] = []
        for i in range(1, n):
            x, y, w, h, area = stats[i]
            area_frac = area / float(H * W)
            if area_frac < 0.01 or area_frac > 0.65:
                continue
            region = labels[y:y + h, x:x + w] == i
            texture = float(gray[y:y + h, x:x + w][region].astype(np.float32).std())
            edge_density = float((edges[y:y + h, x:x + w][region] > 0).mean())
            sharpness = float(laplacian[y:y + h, x:x + w][region].mean())
            # Flat walls (no turbulence) and crisp structures (floors, shelves, machinery) are not smoke.
            if texture < 6 or edge_density > 0.18 or sharpness > 46:
                continue

            softness = 1.0 - min(1.0, max(0.0, sharpness - 20) / 30.0)
            turbulence = min(1.0, texture / 25.0)
            conf = 0.30 + 0.20 * softness + 0.15 * turbulence + 0.10 * min(1.0, area_frac / 0.08)

            box = clamp_bbox(x / W, y / H, w / W, h / H)
            if any(_smoke_near_fire(box, f.bbox) for f in fire):
                conf += 0.15
            if motion_mask is not None:
                moving = float((motion_mask[y:y + h, x:x + w][region] > 0).mean())
                conf += 0.15 if moving >= 0.1 else -0.15

            out.append(Detection("smoke", float(round(min(conf, 0.95), 3)), box))
        return out

    # ------------------------------------------------------------------- API
    def detect(self, image: np.ndarray, motion_mask: Optional[np.ndarray] = None) -> List[Detection]:
        img = _resize(image)
        if motion_mask is not None and motion_mask.shape[:2] != img.shape[:2]:
            motion_mask = cv2.resize(motion_mask, (img.shape[1], img.shape[0]), interpolation=cv2.INTER_NEAREST)

        fmask = self.fire_mask(img)
        fire = self._fire_regions(img, fmask)

        smask = self.smoke_mask(img)
        smask[cv2.dilate(fmask, np.ones((15, 15), np.uint8)) > 0] = 0  # fire glow is not smoke
        smoke = self._smoke_regions(img, smask, fire, motion_mask)

        results: List[Detection] = []
        for group in (fire, smoke):
            kept = [d for d in group if d.confidence >= self.confidence_threshold]
            kept = non_max_suppression(kept, self.iou_threshold)
            results.extend(sorted(kept, key=lambda d: d.confidence, reverse=True)[: self.max_per_class])
        return results


def _smoke_near_fire(smoke: tuple, fire: tuple) -> bool:
    """Smoke rises: true if the smoke box overlaps the fire box horizontally and sits at/above it."""
    sx1, sy1, sw, sh = smoke
    fx1, fy1, fw, fh = fire
    h_overlap = min(sx1 + sw, fx1 + fw) - max(sx1, fx1)
    return h_overlap > 0 and sy1 <= fy1 + fh * 0.5
