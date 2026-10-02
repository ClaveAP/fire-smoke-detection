"use client";

import { useEffect } from "react";
import { useCameraFeeds } from "@/hooks/useCameraFeeds";
import { useAlarmSound } from "@/hooks/useAlarmSound";
import { HeaderNav } from "@/components/common/HeaderNav";
import { AlertBanner } from "@/components/common/AlertBanner";
import { CameraGrid } from "@/components/command-center/CameraGrid";
import { LiveIncidentFeed } from "@/components/command-center/LiveIncidentFeed";

export default function CommandCenterPage() {
  const {
    feeds,
    activeFeedId,
    selectFeed,
    globalStatus,
    incidents,
    webcamStream,
    toggleWebcam,
    acknowledgeIncident,
  } = useCameraFeeds();

  const { isMuted, toggleMute, playAlert, stopAlarm } = useAlarmSound();

  // Trigger audio alert when global status escalates
  useEffect(() => {
    if (globalStatus === "critical") {
      playAlert("critical");
    } else if (globalStatus === "warning") {
      playAlert("warning");
    } else {
      stopAlarm();
    }
  }, [globalStatus, playAlert, stopAlarm]);

  const activeIncidentsCount = incidents.filter((i) => i.status === "active").length;

  return (
    <div className="min-h-screen bg-[#0B111E] text-slate-100 flex flex-col font-sans">
      <HeaderNav isMuted={isMuted} onToggleMute={toggleMute} />

      <AlertBanner status={globalStatus} activeCount={activeIncidentsCount} />

      <main className="flex-1 p-4 lg:p-6 flex flex-col lg:flex-row gap-6">
        {/* Main Surveillance Matrix */}
        <div className="flex-1 min-w-0">
          <CameraGrid
            feeds={feeds}
            activeFeedId={activeFeedId}
            onSelectFeed={selectFeed}
            onToggleWebcam={toggleWebcam}
            webcamStream={webcamStream}
          />
        </div>

        {/* Live Incident Stream Sidebar */}
        <aside className="w-full lg:w-80 shrink-0">
          <LiveIncidentFeed
            incidents={incidents}
            onAcknowledge={acknowledgeIncident}
          />
        </aside>
      </main>
    </div>
  );
}
