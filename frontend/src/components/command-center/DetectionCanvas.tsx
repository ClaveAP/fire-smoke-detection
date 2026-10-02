"use client";

import { useRef, useEffect } from "react";
import { BoundingBox } from "@/types/detection";
import { useDetectionCanvas } from "@/hooks/useDetectionCanvas";

interface DetectionCanvasProps {
  detections: BoundingBox[];
  className?: string;
  minConfidence?: number;
}

export function DetectionCanvas({
  detections,
  className = "",
  minConfidence = 0.2,
}: DetectionCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useDetectionCanvas({
    canvasRef,
    detections,
    options: {
      minConfidence,
      renderLabels: true,
      showFire: true,
      showSmoke: true,
    },
  });

  // Responsive canvas resolution matching container size
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const updateSize = () => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        canvas.width = rect.width;
        canvas.height = rect.height;
      }
    };

    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(canvas);

    return () => observer.disconnect();
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 pointer-events-none w-full h-full z-10 ${className}`}
    />
  );
}
