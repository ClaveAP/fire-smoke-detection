"use client";

import { useEffect, useCallback } from "react";
import { BoundingBox, DetectionFilterOptions } from "@/types/detection";

interface UseDetectionCanvasProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  detections: BoundingBox[];
  options?: Partial<DetectionFilterOptions> & {
    renderLabels?: boolean;
  };
}

export function useDetectionCanvas({
  canvasRef,
  detections,
  options = {},
}: UseDetectionCanvasProps) {
  const {
    minConfidence = 0.2,
    showFire = true,
    showSmoke = true,
    renderLabels = true,
  } = options;

  const drawDetections = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    const filtered = detections.filter((box) => {
      if (box.confidence < minConfidence) return false;
      if (box.label === "fire" && !showFire) return false;
      if (box.label === "smoke" && !showSmoke) return false;
      return true;
    });

    for (const box of filtered) {
      const [nx, ny, nw, nh] = box.bbox;
      const x = nx * width;
      const y = ny * height;
      const w = nw * width;
      const h = nh * height;

      const isFire = box.label === "fire";
      const strokeColor = isFire ? "#EF4444" : "#F59E0B";
      const fillColor = isFire ? "rgba(239, 68, 68, 0.12)" : "rgba(245, 158, 11, 0.12)";
      const tagBg = isFire ? "#DC2626" : "#D97706";

      ctx.fillStyle = fillColor;
      ctx.fillRect(x, y, w, h);

      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, w, h);

      // Corner target markers
      const cornerLength = Math.min(12, w / 4, h / 4);
      ctx.strokeStyle = "#FFFFFF";
      ctx.lineWidth = 2.5;

      ctx.beginPath();
      ctx.moveTo(x, y + cornerLength);
      ctx.lineTo(x, y);
      ctx.lineTo(x + cornerLength, y);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(x + w - cornerLength, y);
      ctx.lineTo(x + w, y);
      ctx.lineTo(x + w, y + cornerLength);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(x, y + h - cornerLength);
      ctx.lineTo(x, y + h);
      ctx.lineTo(x + cornerLength, y + h);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(x + w - cornerLength, y + h);
      ctx.lineTo(x + w, y + h);
      ctx.lineTo(x + w, y + h - cornerLength);
      ctx.stroke();

      if (renderLabels) {
        const labelText = `${box.label.toUpperCase()} ${(box.confidence * 100).toFixed(0)}%`;
        ctx.font = "bold 11px ui-monospace, monospace";
        const textMetrics = ctx.measureText(labelText);
        const tagWidth = textMetrics.width + 12;
        const tagHeight = 18;
        const tagY = Math.max(0, y - tagHeight);

        ctx.fillStyle = tagBg;
        ctx.fillRect(x, tagY, tagWidth, tagHeight);

        ctx.fillStyle = "#FFFFFF";
        ctx.textBaseline = "middle";
        ctx.fillText(labelText, x + 6, tagY + tagHeight / 2);
      }
    }
  }, [canvasRef, detections, minConfidence, showFire, showSmoke, renderLabels]);

  useEffect(() => {
    const render = () => {
      drawDetections();
    };
    const animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [drawDetections]);

  return { drawDetections };
}
