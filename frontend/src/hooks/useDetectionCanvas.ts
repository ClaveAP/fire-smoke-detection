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
      const strokeColor = isFire ? "#ff5722" : "#38bdf8";
      const fillColor = isFire ? "rgba(255, 87, 34, 0.14)" : "rgba(56, 189, 248, 0.12)";
      const tagBg = isFire ? "#ff5722" : "#0284c7";

      ctx.fillStyle = fillColor;
      ctx.fillRect(x, y, w, h);

      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 2;
      if (!isFire) {
        ctx.setLineDash([6, 4]);
      } else {
        ctx.setLineDash([]);
      }
      ctx.strokeRect(x, y, w, h);
      ctx.setLineDash([]);

      const cornerLength = Math.min(14, w / 4, h / 4);
      ctx.strokeStyle = "#ffffff";
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
        const prefix = isFire ? "FIRE [THERMAL]" : "SMOKE [PLUME]";
        const labelText = `${prefix} ${(box.confidence * 100).toFixed(1)}%`;
        ctx.font = "bold 11px ui-monospace, monospace";
        const textMetrics = ctx.measureText(labelText);
        const tagWidth = textMetrics.width + 14;
        const tagHeight = 20;
        const tagY = Math.max(0, y - tagHeight - 2);

        ctx.fillStyle = tagBg;
        ctx.fillRect(x, tagY, tagWidth, tagHeight);

        ctx.fillStyle = "#ffffff";
        ctx.textBaseline = "middle";
        ctx.fillText(labelText, x + 7, tagY + tagHeight / 2);

        const coordText = `X:${nx.toFixed(2)} Y:${ny.toFixed(2)}`;
        const coordMetrics = ctx.measureText(coordText);
        const coordW = coordMetrics.width + 10;
        const coordH = 16;
        const coordY = Math.min(height - coordH, y + h + 2);

        ctx.fillStyle = "rgba(6, 14, 32, 0.88)";
        ctx.fillRect(x, coordY, coordW, coordH);
        ctx.fillStyle = isFire ? "#ffb5a0" : "#38bdf8";
        ctx.font = "600 10px ui-monospace, monospace";
        ctx.fillText(coordText, x + 5, coordY + coordH / 2);
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
