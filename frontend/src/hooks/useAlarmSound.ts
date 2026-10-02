"use client";

import { useState, useRef, useEffect, useCallback } from "react";

export type AlarmSeverity = "warning" | "critical";

export function useAlarmSound() {
  const [isMuted, setIsMuted] = useState<boolean>(true); // Default muted to respect browser autoplay policy
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const initAudio = useCallback(() => {
    if (!audioCtxRef.current) {
      const AudioCtxClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        audioCtxRef.current = new AudioCtxClass();
      }
    }
    if (audioCtxRef.current && audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume();
    }
  }, []);

  const stopAlarm = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (oscillatorRef.current) {
      try {
        oscillatorRef.current.stop();
        oscillatorRef.current.disconnect();
      } catch {
        // Ignore errors if already stopped
      }
      oscillatorRef.current = null;
    }
    if (gainNodeRef.current) {
      gainNodeRef.current.disconnect();
      gainNodeRef.current = null;
    }
  }, []);

  const playBeep = useCallback((freq: number, durationMs: number = 200, type: OscillatorType = "sine") => {
    if (!audioCtxRef.current) return;
    try {
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      // Smooth attack and decay envelope
      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.15, ctx.currentTime + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + durationMs / 1000);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + durationMs / 1000);
    } catch {
      // Audio playback failsafe
    }
  }, []);

  const playAlert = useCallback(
    (severity: AlarmSeverity) => {
      if (isMuted) return;
      initAudio();
      stopAlarm();

      if (severity === "critical") {
        // Alternating high-urgency tone (880Hz / 660Hz)
        let toggle = false;
        playBeep(880, 240, "sawtooth");
        intervalRef.current = setInterval(() => {
          toggle = !toggle;
          playBeep(toggle ? 880 : 660, 240, "sawtooth");
        }, 320);
      } else {
        // Warning single pulse (540Hz)
        playBeep(540, 200, "triangle");
        intervalRef.current = setInterval(() => {
          playBeep(540, 200, "triangle");
        }, 1200);
      }
    },
    [isMuted, initAudio, stopAlarm, playBeep]
  );

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      if (next) {
        stopAlarm();
      } else {
        initAudio();
      }
      return next;
    });
  }, [initAudio, stopAlarm]);

  useEffect(() => {
    return () => {
      stopAlarm();
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, [stopAlarm]);

  return {
    isMuted,
    toggleMute,
    playAlert,
    stopAlarm,
  };
}
