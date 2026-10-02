"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { CameraFeed, CameraStatus, IncidentRecord } from "@/types/detection";
import {
  INITIAL_CAMERA_FEEDS,
  INITIAL_INCIDENT_RECORDS,
  simulateBoxJitter,
} from "@/services/mockDetection";

export function useCameraFeeds() {
  const [feeds, setFeeds] = useState<CameraFeed[]>(INITIAL_CAMERA_FEEDS);
  const [activeFeedId, setActiveFeedId] = useState<string | null>(null);
  const [incidents, setIncidents] = useState<IncidentRecord[]>(INITIAL_INCIDENT_RECORDS);
  const [webcamFeedId, setWebcamFeedId] = useState<string | null>(null);
  const [webcamStream, setWebcamStream] = useState<MediaStream | null>(null);

  // Derive global system severity status
  const globalStatus: CameraStatus = useMemo(() => {
    if (feeds.some((f) => f.status === "critical")) return "critical";
    if (feeds.some((f) => f.status === "warning")) return "warning";
    return "safe";
  }, [feeds]);

  // Periodic simulated vision tick to emulate real-time inference stream
  useEffect(() => {
    const timer = setInterval(() => {
      setFeeds((prevFeeds) =>
        prevFeeds.map((feed) => {
          if (feed.detections.length > 0) {
            return {
              ...feed,
              detections: simulateBoxJitter(feed.detections),
              latencyMs: Math.max(8, Math.min(24, (feed.latencyMs || 12) + Math.floor((Math.random() - 0.5) * 4))),
            };
          }
          return feed;
        })
      );
    }, 1500);

    return () => clearInterval(timer);
  }, []);

  const selectFeed = useCallback((feedId: string | null) => {
    setActiveFeedId(feedId);
  }, []);

  const toggleWebcam = useCallback(
    async (cameraId: string) => {
      if (webcamFeedId === cameraId) {
        // Stop current webcam
        if (webcamStream) {
          webcamStream.getTracks().forEach((track) => track.stop());
        }
        setWebcamStream(null);
        setWebcamFeedId(null);
        setFeeds((prev) =>
          prev.map((f) => (f.id === cameraId ? { ...f, isWebcam: false } : f))
        );
      } else {
        try {
          if (webcamStream) {
            webcamStream.getTracks().forEach((track) => track.stop());
          }
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { width: 1280, height: 720 },
          });
          setWebcamStream(stream);
          setWebcamFeedId(cameraId);
          setFeeds((prev) =>
            prev.map((f) =>
              f.id === cameraId ? { ...f, isWebcam: true } : { ...f, isWebcam: false }
            )
          );
        } catch (err) {
          console.error("Failed to access webcam:", err);
        }
      }
    },
    [webcamFeedId, webcamStream]
  );

  const acknowledgeIncident = useCallback((incidentId: string) => {
    setIncidents((prev) =>
      prev.map((inc) =>
        inc.id === incidentId
          ? {
              ...inc,
              status: inc.status === "active" ? "investigating" : "resolved",
            }
          : inc
      )
    );
  }, []);

  // Cleanup webcam stream on unmount
  useEffect(() => {
    return () => {
      if (webcamStream) {
        webcamStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [webcamStream]);

  return {
    feeds,
    activeFeedId,
    selectFeed,
    globalStatus,
    incidents,
    webcamFeedId,
    webcamStream,
    toggleWebcam,
    acknowledgeIncident,
  };
}
