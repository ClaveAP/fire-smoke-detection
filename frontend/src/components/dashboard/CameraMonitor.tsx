"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, ArrowsOut, Bell, BellRinging, Camera, Check, CircleNotch, Laptop, MapPin, Plus, ShieldCheck, VideoCamera, Warning } from "@phosphor-icons/react";
import { HeaderNav } from "@/components/common/HeaderNav";
import { useAuth } from "@/context/AuthContext";
import { DetectionCanvas } from "@/components/command-center/DetectionCanvas";
import { useCameraStream } from "@/hooks/useCameraStream";
import { detectionAdapter } from "@/services/detectionAdapter";
import { INITIAL_INCIDENT_RECORDS } from "@/services/mockDetection";
import { ConnectCameraDialog } from "@/components/incidents/ConnectCameraDialog";
import ScannerPage from "@/components/live-scan/ScannerPage";
import { useAlarmSound } from "@/hooks/useAlarmSound";
import type { BackendHealth, CameraFeed, IncidentRecord, StreamFramePacket } from "@/types/detection";
import styles from "./CameraMonitor.module.css";

function MonitorImage({ camera, fallback, onPacket }: { camera?: CameraFeed; fallback?: IncidentRecord; onPacket: (packet: StreamFramePacket | null) => void }) {
  const { state, packet, snapshotSrc, boxes, isLive } = useCameraStream({ cameraId: camera?.streamUrl ? camera.id : null });
  const imageRef = useRef<HTMLImageElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const [fullscreen, setFullscreen] = useState(false);
  const [snapshotMessage, setSnapshotMessage] = useState("");
  const image = isLive ? snapshotSrc : fallback?.snapshotUrl;
  const status = packet?.status ?? camera?.status ?? "safe";
  useEffect(() => onPacket(packet), [onPacket, packet]);
  useEffect(() => {
    const update = () => setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", update);
    return () => document.removeEventListener("fullscreenchange", update);
  }, []);
  const toggleFullscreen = () => {
    if (document.fullscreenElement) void document.exitFullscreen().catch(() => {});
    else void stageRef.current?.requestFullscreen().catch(() => {});
  };
  const takeSnapshot = () => {
    const target = imageRef.current;
    if (!target) return;
    try {
      const canvas = document.createElement("canvas");
      canvas.width = target.naturalWidth;
      canvas.height = target.naturalHeight;
      canvas.getContext("2d")?.drawImage(target, 0, 0);
      canvas.toBlob((blob) => {
        if (!blob) {
          if (snapshotSrc) window.open(snapshotSrc, "_blank", "noopener,noreferrer");
          setSnapshotMessage("Snapshot dibuka di tab baru");
          window.setTimeout(() => setSnapshotMessage(""), 2200);
          return;
        }
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `aegis-${camera?.id ?? "kamera"}-${Date.now()}.jpg`;
        link.click();
        URL.revokeObjectURL(url);
        setSnapshotMessage("Snapshot tersimpan");
        window.setTimeout(() => setSnapshotMessage(""), 2200);
      }, "image/jpeg", 0.92);
    } catch {
      if (snapshotSrc) window.open(snapshotSrc, "_blank", "noopener,noreferrer");
      setSnapshotMessage("Snapshot dibuka di tab baru");
      window.setTimeout(() => setSnapshotMessage(""), 2200);
    }
  };
  return <>
    <div ref={stageRef} className={styles.stage}>
      {image ? <>
        {/* eslint-disable-next-line @next/next/no-img-element */}<img ref={imageRef} src={image} alt={camera ? `Feed ${camera.name}` : `Pratinjau ${fallback?.cameraName ?? "kamera"}`} />
        {isLive && <DetectionCanvas detections={boxes} mediaRef={imageRef} />}
      </> : <div className={styles.waiting}><VideoCamera size={34} weight="light" /><b>{state === "connecting" ? "Menghubungkan CCTV" : "Belum ada frame kamera"}</b><span>{camera?.name ?? "Pilih kamera yang memiliki stream aktif."}</span></div>}
      <span className={`${styles.livePill} ${isLive ? styles.live : styles.idle}`}><i />{isLive ? "LIVE" : fallback ? "DEMO SNAPSHOT" : state === "connecting" ? "MENGHUBUNGKAN" : "STANDBY"}</span>
      <span className={`${styles.hazard} ${status === "safe" ? styles.hazardSafe : styles.hazardAlert}`}>{status === "safe" ? <Check size={13} weight="bold" /> : <Warning size={13} weight="fill" />}{status === "safe" ? "AMAN" : status === "critical" ? "KRITIS" : "WASPADA"}</span>
      {isLive && <span className={styles.streamDetails}>{packet?.fps} FPS <i /> {packet?.latencyMs} ms</span>}
      <div className={styles.viewActions}><button type="button" onClick={takeSnapshot} aria-label="Ambil snapshot" title="Ambil snapshot"><Camera size={16} /></button><button type="button" onClick={toggleFullscreen} aria-label={fullscreen ? "Keluar layar penuh" : "Layar penuh"} title={fullscreen ? "Keluar layar penuh" : "Layar penuh"}><ArrowsOut size={16} /></button></div>
      {snapshotMessage && <span className={styles.snapshotMessage}>{snapshotMessage}</span>}
    </div>
    {camera && <div className={styles.imageCaption}><span><b>{camera.name}</b><small><MapPin size={13} />{camera.location}</small></span><span>{camera.resolution ?? "Resolusi sumber"}</span></div>}
  </>;
}

export function CameraMonitor() {
  const { user } = useAuth();
  const official = Boolean(user && !user.id.startsWith("usr-"));
  const [cameras, setCameras] = useState<CameraFeed[]>([]);
  const [incidents, setIncidents] = useState<IncidentRecord[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [health, setHealth] = useState<BackendHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "alert">("all");
  const [source, setSource] = useState<"cctv" | "device">("cctv");
  const [connectOpen, setConnectOpen] = useState(false);
  const [alarmActive, setAlarmActive] = useState(false);
  const [latestPacket, setLatestPacket] = useState<StreamFramePacket | null>(null);
  const [alarmMessage, setAlarmMessage] = useState("");
  const fireFramesRef = useRef(0);
  const clearFramesRef = useRef(0);
  const silencedRef = useRef(false);
  const alarmRef = useRef(false);
  const { playAlert, stopAlarm } = useAlarmSound();

  const refresh = useCallback(async () => {
    const [health, feeds, events] = await Promise.all([
      detectionAdapter.getHealth(),
      detectionAdapter.getCameras(),
      detectionAdapter.getIncidentRecords(official),
    ]);
    setHealth(health);
    setCameras(feeds);
    setIncidents(events);
    setSelectedId((current) => current || feeds.find((camera) => camera.streamUrl)?.id || feeds[0]?.id || "");
    setLoading(false);
  }, [official]);

  useEffect(() => {
    void refresh();
    const timer = window.setInterval(() => void refresh(), 20000);
    return () => window.clearInterval(timer);
  }, [refresh]);

  const handleCameraConnected = useCallback((camera: CameraFeed) => {
    setCameras((current) => [...current.filter((item) => item.id !== camera.id), camera]);
    setSelectedId(camera.id);
    setFilter("all");
  }, []);
  const onPacket = useCallback((packet: StreamFramePacket | null) => setLatestPacket(packet), []);
  const triggerAlarm = useCallback((automatic = false) => {
    alarmRef.current = true;
    silencedRef.current = false;
    setAlarmActive(true);
    playAlert("critical", true);
    setAlarmMessage(automatic ? "Api melewati ambang 80% — alarm otomatis berbunyi." : "Alarm darurat aktif.");
    window.setTimeout(() => setAlarmMessage(""), 4000);
  }, [playAlert]);
  const toggleAlarm = useCallback(() => {
    if (alarmRef.current) {
      alarmRef.current = false;
      silencedRef.current = true;
      setAlarmActive(false);
      stopAlarm();
      setAlarmMessage("Alarm darurat dimatikan.");
    } else triggerAlarm();
    window.setTimeout(() => setAlarmMessage(""), 3000);
  }, [stopAlarm, triggerAlarm]);
  useEffect(() => {
    if (!latestPacket) { fireFramesRef.current = 0; clearFramesRef.current = 0; return; }
    const fire = latestPacket.detections.reduce((highest, item) => item.label === "fire" ? Math.max(highest, item.confidence) : highest, 0);
    if (fire >= 0.8) {
      fireFramesRef.current += 1;
      clearFramesRef.current = 0;
      if (fireFramesRef.current >= 2 && !alarmRef.current && !silencedRef.current) triggerAlarm(true);
    } else {
      fireFramesRef.current = 0;
      clearFramesRef.current += 1;
      if (clearFramesRef.current >= 5) silencedRef.current = false;
    }
  }, [latestPacket, triggerAlarm]);

  const demo = cameras.length === 0;
  const feeds: CameraFeed[] = useMemo(() => demo ? INITIAL_INCIDENT_RECORDS.slice(0, 4).map((incident) => ({
    id: incident.cameraId, name: incident.cameraName, location: incident.zone ?? "Zona pemantauan",
    status: incident.status === "active" ? "critical" : "warning", detections: incident.detections ?? [], fps: 0,
  })) : cameras, [cameras, demo]);
  const filtered = feeds.filter((camera) => filter === "all" || camera.status !== "safe");
  const selected = filtered.find((camera) => camera.id === selectedId) ?? filtered[0];
  const selectedIncident = incidents.find((item) => item.cameraId === selected?.id) ?? (demo ? INITIAL_INCIDENT_RECORDS.find((item) => item.cameraId === selected?.id) : undefined);
  const incidentsActive = incidents.filter((incident) => incident.status !== "resolved").length;
  const healthy = Boolean(health);
  const attentionCount = feeds.filter((camera) => camera.status !== "safe").length;
  const chooseFilter = (next: "all" | "alert") => {
    setFilter(next);
    const first = feeds.find((camera) => next === "all" || camera.status !== "safe");
    if (first) setSelectedId(first.id);
  };

  return <div className={styles.page}>
    <HeaderNav />
    <main className={styles.workspace}>
      <div className={styles.pageHeader}>
        <h1>Pantauan kamera</h1>
        <p>Pantau seluruh feed CCTV dan kamera perangkat secara langsung untuk deteksi api dan asap.</p>
      </div>
      <section className={styles.monitorPanel} aria-label="Pantauan kamera">
      <div className={styles.panelHeading}><div className={styles.panelTitle}><div><h2>{source === "device" ? "Kamera perangkat" : "Tampilan feed"}</h2><p>{source === "device" ? "Live scan dari kamera perangkat" : "Pratinjau tampilan feed"}</p></div><span>{source === "device" ? "Kamera perangkat" : `${filtered.length} ditampilkan`}</span><div className={styles.sourceSwitch} role="group" aria-label="Pilih sumber kamera"><button type="button" aria-pressed={source === "cctv"} className={source === "cctv" ? styles.sourceActive : ""} onClick={() => setSource("cctv")}>CCTV terdaftar</button><button type="button" aria-pressed={source === "device"} className={source === "device" ? styles.sourceActive : ""} onClick={() => setSource("device")}><Laptop size={14} />Kamera perangkat</button></div></div>{source === "cctv" && <div className={styles.panelActions}><span className={styles.connection}><i className={healthy ? styles.online : ""} />{healthy ? "Backend tersambung" : loading ? "Memeriksa koneksi" : "Backend offline"}</span><button type="button" className={styles.connectAction} onClick={() => setConnectOpen(true)}><Plus size={15} weight="bold" />Hubungkan CCTV</button><div className={styles.scopeTabs} role="group" aria-label="Filter kamera"><button type="button" aria-pressed={filter === "all"} className={filter === "all" ? styles.scopeActive : ""} onClick={() => chooseFilter("all")}>Semua <b>{feeds.length}</b></button><button type="button" aria-pressed={filter === "alert"} className={filter === "alert" ? styles.scopeActive : ""} onClick={() => chooseFilter("alert")}>Perlu perhatian <b>{attentionCount}</b></button></div></div>}</div>
      {source === "device" ? <ScannerPage embedded initialSource="device" /> : <section className={styles.monitorGrid}>
        <div className={styles.primary}>
          {selected ? <MonitorImage key={selected.id} camera={selected} fallback={selectedIncident} onPacket={onPacket} /> : <div className={styles.empty}><VideoCamera size={30} /><b>Belum ada kamera</b><span>Hubungkan kamera CCTV ke backend untuk melihat stream di sini.</span></div>}
          <section className={styles.scanResults} aria-live="polite"><div className={styles.resultsHeading}><div><span className={styles.resultsEyebrow}>HASIL LIVE SCAN</span><h2>{(latestPacket?.detections.length ?? selectedIncident?.detections?.length ?? 0)} objek bahaya terdeteksi di kamera ini</h2></div><span className={`${styles.scanStatus} ${latestPacket ? styles.scanLive : ""}`}><i />{latestPacket ? "Live scan aktif" : demo ? "Data contoh" : "Menunggu deteksi"}</span></div>{selectedIncident?.status === "active" || latestPacket?.incidentId ? <><p>Insiden <b>{latestPacket?.incidentId ?? selectedIncident?.id ?? "—"}</b> aktif. Memerlukan penanganan segera oleh tim safety shift 1.</p><Link href="/incidents">Buka detail insiden <ArrowUpRight size={14} /></Link></> : <p>{latestPacket?.detections.length ? "Deteksi sedang dipantau oleh sistem." : "Belum ada insiden aktif pada feed ini."}</p>}</section>
          <div className={styles.alarmBar}><span><b>{alarmActive ? "Alarm darurat aktif" : "Alarm keselamatan"}</b><small>{alarmMessage || "Alarm otomatis aktif saat keyakinan deteksi api melewati 80%."}</small></span><button type="button" onClick={toggleAlarm} aria-pressed={alarmActive} className={alarmActive ? styles.alarmActive : styles.alarmIdle}>{alarmActive ? <BellRinging size={17} /> : <Bell size={17} />}{alarmActive ? "Matikan Alarm Darurat" : "Bunyikan Alarm Darurat"}</button></div>
        </div>
        <aside className={styles.rail}>
          <div className={styles.railHeading}><h2>Daftar kamera</h2><span>Pilih feed untuk ditinjau</span></div>
          <div className={styles.feedList}>{filtered.map((camera) => {
            const active = camera.id === selected?.id;
            const event = incidents.find((item) => item.cameraId === camera.id) ?? (demo ? INITIAL_INCIDENT_RECORDS.find((item) => item.cameraId === camera.id) : undefined);
            return <button type="button" key={camera.id} onClick={() => setSelectedId(camera.id)} className={`${styles.feedRow} ${active ? styles.feedRowActive : ""}`} aria-pressed={active}>
              <span className={styles.feedPreview}>{event?.snapshotUrl && /* eslint-disable-next-line @next/next/no-img-element */ <img src={event.snapshotUrl} alt="" />}<span className={`${styles.miniStatus} ${camera.status === "safe" ? styles.badgeSafe : styles.badgeAlert}`}><i />{camera.status === "safe" ? "Aman" : camera.status === "critical" ? "Kritis" : "Waspada"}</span></span>
              <span className={styles.feedName}><b>{camera.name}</b><small><MapPin size={11} />{camera.location}</small><small>{event ? `${event.type === "fire" ? "Deteksi api" : "Deteksi asap"}` : camera.status === "safe" ? "Kondisi aman" : "Perlu perhatian"}</small></span>
              {active && <span className={styles.selectedLabel}>Dipilih</span>}
            </button>;
          })}</div>
          {!feeds.length && <p className={styles.feedEmpty}>{loading ? <CircleNotch size={15} /> : <ShieldCheck size={16} />}{loading ? "Memuat kamera…" : "Kamera belum tersedia"}</p>}
          <Link className={styles.incidentLink} href="/incidents">Lihat {incidentsActive} insiden aktif <ArrowUpRight size={14} /></Link>
        </aside>
      </section>}
      {demo && source === "cctv" && <p className={styles.demoNotice}>Data contoh ditampilkan untuk pratinjau. Kamera aktual muncul setelah backend terhubung.</p>}
      </section>
    </main>
    <ConnectCameraDialog open={connectOpen} onClose={() => setConnectOpen(false)} onConnected={handleCameraConnected} />
  </div>;
}
