"use client";

import { useState, useCallback, useMemo, useRef } from "react";
import { WorkspaceShell } from "@/components/dashboard/WorkspaceShell";
import { WorkspacePageHeader } from "@/components/dashboard/WorkspacePageHeader";
import { MediaUploader } from "@/components/inspector/MediaUploader";
import { PlaybackControls } from "@/components/inspector/PlaybackControls";
import { DetectionTable } from "@/components/inspector/DetectionTable";
import { InspectorPreviewCanvas } from "@/components/inspector/InspectorPreviewCanvas";
import { BoundingBox, IncidentRecord, VideoFrameDetection } from "@/types/detection";
import { detectionAdapter } from "@/services/detectionAdapter";
import { InspectorSamplePreset } from "@/services/inspectorPresets";
import workspaceStyles from "@/components/dashboard/WorkspacePage.module.css";
import styles from "@/components/inspector/Inspector.module.css";

/**
 * Grab the frame at `timeMs` from a local video so the incident log has real evidence
 * instead of an empty preview. Returns "" when the browser cannot decode that frame.
 */
async function captureVideoSnapshot(src: string, timeMs: number): Promise<string> {
  return new Promise((resolve) => {
    const video = document.createElement("video");
    let settled = false;
    const finish = (value: string) => {
      if (settled) return;
      settled = true;
      video.removeAttribute("src");
      video.load();
      resolve(value);
    };
    const draw = () => {
      try {
        const width = video.videoWidth;
        const height = video.videoHeight;
        if (!width || !height) {
          finish("");
          return;
        }
        const scale = Math.min(1, 960 / width);
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(width * scale);
        canvas.height = Math.round(height * scale);
        canvas.getContext("2d")?.drawImage(video, 0, 0, canvas.width, canvas.height);
        finish(canvas.toDataURL("image/jpeg", 0.8));
      } catch {
        finish("");
      }
    };
    video.muted = true;
    video.playsInline = true;
    video.preload = "auto";
    video.addEventListener("error", () => finish(""));
    video.addEventListener("loadeddata", () => {
      const target = Math.min(
        Math.max(0, timeMs / 1000),
        Math.max(0, (video.duration || 0) - 0.05)
      );
      if (target <= 0.01) {
        draw();
        return;
      }
      try {
        video.currentTime = target;
      } catch {
        draw();
      }
    });
    video.addEventListener("seeked", draw);
    window.setTimeout(() => finish(""), 6000);
    video.src = src;
  });
}

export default function MediaInspectorPage() {
  const [activePresetId, setActivePresetId] = useState<string | undefined>(
    undefined
  );
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [sampleTitle, setSampleTitle] = useState<string>("Belum ada media");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [detections, setDetections] = useState<BoundingBox[]>([]);
  const [inferenceTimeMs, setInferenceTimeMs] = useState<number>(0);
  const [engineName, setEngineName] = useState<string>("");
  const [confidence, setConfidence] = useState<number>(0.20);
  const [showFire, setShowFire] = useState<boolean>(true);
  const [showSmoke, setShowSmoke] = useState<boolean>(true);

  // Video playback states
  const [isVideo, setIsVideo] = useState<boolean>(false);
  const [videoFrames, setVideoFrames] = useState<VideoFrameDetection[]>([]);
  const [videoDurationMs, setVideoDurationMs] = useState<number>(0);
  const [currentTimeMs, setCurrentTimeMs] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const handleTogglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
    } else {
      video.play().catch(() => {});
      setIsPlaying(true);
    }
  }, [isPlaying]);

  const handleSeek = useCallback(
    (timeMs: number) => {
      const video = videoRef.current;
      if (!video) return;
      video.currentTime = timeMs / 1000;
      setCurrentTimeMs(timeMs);
      if (videoFrames.length > 0) {
        let closest = videoFrames[0];
        let minDiff = Math.abs(closest.timestampMs - timeMs);
        for (let i = 1; i < videoFrames.length; i++) {
          const diff = Math.abs(videoFrames[i].timestampMs - timeMs);
          if (diff < minDiff) {
            minDiff = diff;
            closest = videoFrames[i];
          }
        }
        setDetections(closest.boxes);
      }
    },
    [videoFrames]
  );

  const handleTimeUpdate = useCallback(
    (timeMs: number) => {
      setCurrentTimeMs(timeMs);
      if (videoFrames.length > 0) {
        let closest = videoFrames[0];
        let minDiff = Math.abs(closest.timestampMs - timeMs);
        for (let i = 1; i < videoFrames.length; i++) {
          const diff = Math.abs(videoFrames[i].timestampMs - timeMs);
          if (diff < minDiff) {
            minDiff = diff;
            closest = videoFrames[i];
          }
        }
        setDetections(closest.boxes);
      }
    },
    [videoFrames]
  );

  const handleMediaSelect = useCallback(
    async (file: File | null, preset?: InspectorSamplePreset) => {
      if (!file && !preset) return;

      setIsProcessing(true);
      setIsPlaying(false);
      setCurrentTimeMs(0);
      setAnalysisError(null);

      const isVideoFile = Boolean(
        file &&
          (file.type.startsWith("video/") ||
            /\.(mp4|webm|ogg|mov|avi|mkv)$/i.test(file.name))
      );
      setIsVideo(isVideoFile);

      let localPreviewUrl: string | null = null;
      if (preset) {
        setActivePresetId(preset.id);
        setSampleTitle(preset.title);
        setPreviewUrl(preset.previewUrl);
        setVideoFrames([]);
        setVideoDurationMs(0);
        setInferenceTimeMs(0);
        localPreviewUrl = preset.previewUrl;
      } else if (file) {
        setActivePresetId(undefined);
        setSampleTitle(file.name);
        localPreviewUrl = URL.createObjectURL(file);
        setPreviewUrl(localPreviewUrl);
      }

      try {
        if (preset) {
          // Sample media carries hand-drawn annotations — show them as-is, no engine call.
          setIsVideo(false);
          setVideoFrames([]);
          setVideoDurationMs(0);
          setInferenceTimeMs(0);
          setEngineName("");
          setDetections(preset.boxes);
        } else if (file) {
          if (isVideoFile) {
            // Video analysis via backend /detect/video
            const res = await detectionAdapter.detectVideo(file);
            setVideoFrames(res.frames);
            setVideoDurationMs(res.durationMs);
            setInferenceTimeMs(res.inferenceTimeMs);
            setEngineName(res.engine ?? "");

            // Set initial boxes from first frame with detections
            const frameWithBoxes = res.frames.find((f) => f.boxes.length > 0);
            setDetections(frameWithBoxes?.boxes || (res.frames[0]?.boxes ?? []));

            // Record incident if fire or smoke detected in video summary
            const hasFire = res.summary.fire && res.summary.fire.frames > 0;
            const hasSmoke = res.summary.smoke && res.summary.smoke.frames > 0;
            if (!preset && (hasFire || hasSmoke)) {
              const now = Date.now();
              const primaryType = hasFire ? "fire" : "smoke";
              const secondaryType = hasFire && hasSmoke ? "smoke" : undefined;
              const peakConf = Math.max(
                res.summary.fire?.peakConfidence || 0,
                res.summary.smoke?.peakConfidence || 0
              );
              // Evidence frame: the sampled frame whose boxes are stored below.
              const snapshot = localPreviewUrl
                ? await captureVideoSnapshot(
                    localPreviewUrl,
                    frameWithBoxes?.timestampMs ?? 0
                  )
                : "";

              let activeOperator: IncidentRecord["operator"] = undefined;
              if (typeof window !== "undefined") {
                try {
                  const rawUser = window.localStorage.getItem("aegisflame_auth_user");
                  if (rawUser) {
                    const u = JSON.parse(rawUser);
                    activeOperator = {
                      id: u.id,
                      name: u.name,
                      email: u.email,
                      role: u.role,
                      roleTitle: u.roleTitle,
                      avatar: u.avatar,
                    };
                  }
                } catch {
                  // Ignore storage error
                }
              }

              detectionAdapter.recordIncident({
                id: `inc-${String(now).slice(-4)}`,
                timestamp: new Date(now).toISOString(),
                cameraId: "MEDIA-LAB",
                cameraName: `Media Lab // Video ${file.name}`,
                zone: "Pengujian Video MP4",
                type: primaryType,
                secondaryType: secondaryType,
                confidence: peakConf,
                smokeConfidence: res.summary.smoke?.peakConfidence,
                status: "active",
                snapshotUrl: snapshot || undefined,
                operator: activeOperator,
                notes: `Analisis video "${file.name}" selesai: durasi ${(res.durationMs / 1000).toFixed(1)}s, ${res.frames.length} frame diproses dalam ${res.inferenceTimeMs}ms.`,
                detections: frameWithBoxes?.boxes || [],
              });
            }
          } else {
            // Image analysis via backend /detect/image
            setVideoFrames([]);
            setVideoDurationMs(0);
            const res = await detectionAdapter.detectImage(file);
            setDetections(res.boxes);
            setInferenceTimeMs(res.inferenceTimeMs);
            setEngineName(res.engine ?? "");

            // Automatically log custom uploaded media detections into Incident Log
            if (!preset && res.boxes.length > 0) {
              const fireBox = res.boxes.find((b) => b.label === "fire");
              const smokeBox = res.boxes.find((b) => b.label === "smoke");
              const primaryBox = fireBox || smokeBox || res.boxes[0];
              const now = Date.now();

              // Convert image file to Data URL for persistent localStorage preview
              const snapshotDataUrl = await new Promise<string>((resolve) => {
                if (!file.type.startsWith("image/")) {
                  resolve("");
                  return;
                }
                const reader = new FileReader();
                reader.onload = () =>
                  resolve(typeof reader.result === "string" ? reader.result : "");
                reader.onerror = () => resolve("");
                reader.readAsDataURL(file);
              });

              let activeOperator: IncidentRecord["operator"] = undefined;
              if (typeof window !== "undefined") {
                try {
                  const rawUser = window.localStorage.getItem("aegisflame_auth_user");
                  if (rawUser) {
                    const u = JSON.parse(rawUser);
                    activeOperator = {
                      id: u.id,
                      name: u.name,
                      email: u.email,
                      role: u.role,
                      roleTitle: u.roleTitle,
                      avatar: u.avatar,
                    };
                  }
                } catch {
                  // Ignore storage error
                }
              }

              detectionAdapter.recordIncident({
                id: `inc-${String(now).slice(-4)}`,
                timestamp: new Date(now).toISOString(),
                cameraId: "MEDIA-LAB",
                cameraName: `Media Lab // ${file.name}`,
                zone: "Pengujian File Upload",
                type: primaryBox.label,
                secondaryType: fireBox && smokeBox ? "smoke" : undefined,
                confidence: primaryBox.confidence,
                smokeConfidence: smokeBox?.confidence,
                status: "active",
                snapshotUrl: snapshotDataUrl || localPreviewUrl || undefined,
                operator: activeOperator,
                notes: `Hasil uji deteksi file "${file.name}" di Media Lab (${res.boxes.length} objek terdeteksi dalam ${res.inferenceTimeMs} ms).`,
                detections: res.boxes,
              });
            }
          }
        }
      } catch (err) {
        console.error("Inference failed:", err);
        setDetections([]);
        setInferenceTimeMs(0);
        setVideoFrames([]);
        setAnalysisError(
          err instanceof Error
            ? err.message
            : "Analisis gagal dijalankan pada mesin deteksi."
        );
      } finally {
        setIsProcessing(false);
      }
    },
    []
  );

  const thresholdDetections = useMemo(
    () => detections.filter((box) => box.confidence >= confidence),
    [detections, confidence]
  );

  const hazardMarkers = useMemo(() => {
    if (!isVideo || videoFrames.length === 0) return [];
    return videoFrames
      .filter((f) => f.boxes.some((b) => b.confidence >= confidence))
      .map((f) => f.timestampMs);
  }, [isVideo, videoFrames, confidence]);

  const fireCount = useMemo(
    () => thresholdDetections.filter((box) => box.label === "fire").length,
    [thresholdDetections]
  );

  const smokeCount = useMemo(
    () => thresholdDetections.filter((box) => box.label === "smoke").length,
    [thresholdDetections]
  );

  const filteredDetections = useMemo(() => {
    return thresholdDetections.filter((box) => {
      if (box.label === "fire" && !showFire) return false;
      if (box.label === "smoke" && !showSmoke) return false;
      return true;
    });
  }, [thresholdDetections, showFire, showSmoke]);

  const usesHeuristic = engineName.startsWith("heuristic");
  const engineLabel = engineName
    ? usesHeuristic
      ? "Heuristic OpenCV"
      : `YOLO · ${engineName.split("/").pop() || engineName}`
    : "";

  return (
    <WorkspaceShell dataUI="inspector">
      <div className={workspaceStyles.content}>
        <WorkspacePageHeader
          title="Media Inspector"
          description="Uji gambar atau rekaman video, tinjau setiap objek, dan sesuaikan sensitivitas deteksi tanpa meninggalkan workspace."
          aside={
            <div
              className={workspaceStyles.status}
              data-online={!isProcessing}
            >
              <i />
              <span>
                {isProcessing
                  ? "Analisis berjalan"
                  : isVideo
                    ? "Video siap ditinjau"
                    : "Gambar siap ditinjau"}
              </span>
              <span className={workspaceStyles.count}>
                {inferenceTimeMs ? `${inferenceTimeMs.toFixed(1)} ms` : "—"}
              </span>
              {engineLabel && <span className={workspaceStyles.count}>{engineLabel}</span>}
            </div>
          }
        />

        {usesHeuristic && (
          <p className={styles.engineWarning} role="status">
            <b>Detektor YOLO belum aktif.</b> Hasil di bawah memakai detektor warna OpenCV, sehingga api/asap pada
            rekaman nyata sering lolos. Buka <code>/api/v1/health</code> di backend untuk melihat alasannya
            (<code>engineNote</code>).
          </p>
        )}

        <div className={styles.workspace}>
          <div className={styles.stage}>
            <InspectorPreviewCanvas
              sampleTitle={sampleTitle}
              previewUrl={previewUrl}
              detections={thresholdDetections}
              confidence={confidence}
              showFire={showFire}
              showSmoke={showSmoke}
              isVideo={isVideo}
              videoDurationMs={videoDurationMs}
              currentTimeMs={currentTimeMs}
              isPlaying={isPlaying}
              onTogglePlay={handleTogglePlay}
              onSeek={handleSeek}
              onTimeUpdate={handleTimeUpdate}
              videoRef={videoRef}
              hazardMarkers={hazardMarkers}
              isProcessing={isProcessing}
            />
          </div>

          <aside className={styles.controls} aria-label="Kontrol analisis media">
            <MediaUploader
              onMediaSelect={handleMediaSelect}
              isProcessing={isProcessing}
              activePresetId={activePresetId}
            />

            <PlaybackControls
              confidence={confidence}
              onConfidenceChange={setConfidence}
              showFire={showFire}
              onToggleFire={() => setShowFire(!showFire)}
              showSmoke={showSmoke}
              onToggleSmoke={() => setShowSmoke(!showSmoke)}
              filteredCount={filteredDetections.length}
              fireCount={fireCount}
              smokeCount={smokeCount}
            />
          </aside>

          <div className={styles.results}>
            <DetectionTable
              boxes={filteredDetections}
              inferenceTimeMs={inferenceTimeMs}
            />
          </div>
        </div>

        <footer className={workspaceStyles.footer}>
          <span>Preview tetap gelap agar bounding box terbaca di semua tema.</span>
          <span>{filteredDetections.length} objek ditampilkan pada hasil analisis.</span>
        </footer>
      </div>
    </WorkspaceShell>
  );
}
