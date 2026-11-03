"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { detectionAdapter } from "@/services/detectionAdapter";
import { CameraStreamClient } from "@/services/streamClient";
import { BoundingBox, CameraStatus, ConnectionState, StreamFramePacket } from "@/types/detection";

/** Packets older than this are dropped from the HUD: the stream stalled even though the socket is open. */
const STALE_PACKET_MS = 4000;

interface UseCameraStreamOptions {
  cameraId: string | null;
  onIncident?: (packet: StreamFramePacket) => void;
  onCritical?: (packet: StreamFramePacket) => void;
  onRecover?: () => void;
}

/**
 * Live detection feed from ``WS /api/v1/ws/cctv/{camera_id}``.
 *
 * Works for both modes the backend supports: server-pull (camera has a ``streamUrl``) and
 * client-push (browser webcam sending frames through ``pushFrame``). Box coordinates are
 * returned exactly as the server measured them; mirroring is a view concern.
 */
export function useCameraStream({
  cameraId,
  onIncident,
  onCritical,
  onRecover,
}: UseCameraStreamOptions) {
  const [state, setState] = useState<ConnectionState>("idle");
  const [detail, setDetail] = useState<string | undefined>(undefined);
  const [packet, setPacket] = useState<StreamFramePacket | null>(null);

  const clientRef = useRef<CameraStreamClient | null>(null);
  const lastIncidentRef = useRef<string | null>(null);
  const lastStatusRef = useRef<CameraStatus>("safe");
  const receivedAtRef = useRef(0);
  const handlersRef = useRef({ onIncident, onCritical, onRecover });

  useEffect(() => {
    handlersRef.current = { onIncident, onCritical, onRecover };
  }, [onIncident, onCritical, onRecover]);

  const handlePacket = useCallback((next: StreamFramePacket) => {
    receivedAtRef.current = Date.now();
    setPacket(next);

    if (next.incidentId && next.incidentId !== lastIncidentRef.current) {
      lastIncidentRef.current = next.incidentId;
      handlersRef.current.onIncident?.(next);
    }
    if (next.status === "critical" && lastStatusRef.current !== "critical") {
      handlersRef.current.onCritical?.(next);
    } else if (next.status !== "critical" && lastStatusRef.current === "critical") {
      handlersRef.current.onRecover?.();
    }
    lastStatusRef.current = next.status;
  }, []);

  useEffect(() => {
    if (!cameraId) return;

    lastIncidentRef.current = null;
    lastStatusRef.current = "safe";
    const client = new CameraStreamClient(detectionAdapter.baseUrl, {
      onPacket: handlePacket,
      onStateChange: (next, message) => {
        setState(next);
        setDetail(message);
        if (next !== "open") setPacket(null);
      },
    });
    clientRef.current = client;
    client.connect(cameraId);

    return () => {
      clientRef.current = null;
      client.close();
      setPacket(null);
      setState("idle");
      setDetail(undefined);
    };
  }, [cameraId, handlePacket]);

  useEffect(() => {
    if (!packet) return;
    const timer = window.setInterval(() => {
      if (Date.now() - receivedAtRef.current > STALE_PACKET_MS) setPacket(null);
    }, 1000);
    return () => window.clearInterval(timer);
  }, [packet]);

  const boxes = useMemo<BoundingBox[]>(() => packet?.detections ?? [], [packet]);

  const snapshotSrc = useMemo(
    () => (packet ? detectionAdapter.snapshotUrl(packet.cameraId, packet.timestamp) : ""),
    [packet]
  );

  const pushFrame = useCallback((frame: Blob | ArrayBuffer) => {
    return clientRef.current?.pushFrame(frame) ?? false;
  }, []);

  return {
    state,
    detail,
    packet,
    boxes,
    snapshotSrc,
    pushFrame,
    isLive: Boolean(packet) && state === "open",
    status: packet?.status ?? "safe",
  };
}
