"use client";

import { useRef, useEffect } from "react";
import { BoundingBox } from "@/types/detection";
import { useDetectionCanvas } from "@/hooks/useDetectionCanvas";

interface DetectionCanvasProps {
  detections: BoundingBox[];
  className?: string;
  minConfidence?: number;
  showFire?: boolean;
  showSmoke?: boolean;
  mediaRef?: React.RefObject<HTMLVideoElement | HTMLImageElement | null>;
}

export function DetectionCanvas({
  detections,
  className = "",
  minConfidence = 0.2,
  showFire = true,
  showSmoke = true,
  mediaRef,
}: DetectionCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const { drawDetections } = useDetectionCanvas({
    canvasRef,
    detections,
    mediaRef,
    options: {
      minConfidence,
      renderLabels: true,
      showFire,
      showSmoke,
    },
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const updateSize = () => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        if (canvas.width !== rect.width || canvas.height !== rect.height) {
          canvas.width = rect.width;
          canvas.height = rect.height;
          drawDetections();
        }
      }
    };

    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(canvas);

    return () => observer.disconnect();
  }, [drawDetections]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 pointer-events-none w-full h-full z-10 ${className}`}
    />
  );
}
