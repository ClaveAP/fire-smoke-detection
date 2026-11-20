"use client";

import { useCallback, useEffect, useMemo, useState, type CSSProperties } from "react";

import Link from "next/link";
import {
  ArrowUpRight,
  CheckCircle,
  MagnifyingGlass,
  MapPin,
  VideoCamera,
  Warning,
} from "@phosphor-icons/react";
import { WorkspaceShell } from "@/components/dashboard/WorkspaceShell";
import { DetectionCanvas } from "@/components/command-center/DetectionCanvas";
import { SpecularButton } from "@/components/common/SpecularButton";
import { useAuth } from "@/context/AuthContext";
import { useCameraStream } from "@/hooks/useCameraStream";
import { detectionAdapter } from "@/services/detectionAdapter";
import type { BackendHealth, CameraFeed, IncidentRecord } from "@/types/detection";
import styles from "./Dashboard.module.css";

type FeedStat = { live: boolean; latency: number | null };

const indonesianDays = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
const timeLabel = (value: string) =>
  new Intl.DateTimeFormat("id-ID", { hour: "2-digit", minute: "2-digit" }).format(new Date(value));

function CameraTile({
  camera,
  incident,
  selected,
  featured,
  onSelect,
  onStat,
}: {
  camera: CameraFeed;
  incident?: IncidentRecord;
  selected: boolean;
  featured?: boolean;
  onSelect: () => void;
  onStat: (id: string, stat: FeedStat) => void;
}) {
  const { state, packet, snapshotSrc, boxes, isLive } = useCameraStream({
    cameraId: camera.streamUrl ? camera.id : null,
  });
  const [imageError, setImageError] = useState(false);
  const image = isLive ? snapshotSrc : incident?.snapshotUrl;
  const detections = isLive ? boxes : incident?.detections ?? camera.detections;
  const status = packet?.status ?? camera.status;
  const confidence = packet?.detections?.[0]?.confidence ?? incident?.confidence;
  // Status only means something once a frame was actually analyzed.
  const hasStatusData = isLive || Boolean(incident) || camera.detections.length > 0;
  const statusLabel = !hasStatusData
    ? "Belum ada data"
    : status === "safe"
      ? "Aman"
      : status === "critical"
        ? "Kritis"
        : "Perlu perhatian";

  useEffect(
    () => onStat(camera.id, { live: isLive, latency: isLive ? packet?.latencyMs ?? null : null }),
    [camera.id, isLive, onStat, packet?.latencyMs],
  );
  useEffect(() => setImageError(false), [image]);

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-label={`Pilih ${camera.name}, ${statusLabel}`}
      aria-pressed={selected}
      className={`${styles.cameraTile} ${selected ? styles.selected : ""} ${featured ? styles.featured : ""}`}
    >
      <span className={styles.cameraImage}>
        {image && !imageError ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={image} alt={`Feed ${camera.name}`} onError={() => setImageError(true)} />
            {isLive && <DetectionCanvas detections={detections} />}
          </>
        ) : (
          <span className={styles.noFrame}>
            <VideoCamera size={featured ? 36 : 22} />
            <b>{state === "connecting" ? "Menghubungkan CCTV" : "Belum ada frame"}</b>
          </span>
        )}
        <span className={styles.cameraTop}>
          <b>{camera.id} · {camera.location}</b>
          <i className={isLive ? styles.live : ""}>
            <span />{isLive ? "LIVE" : "STANDBY"}
          </i>
        </span>
        {hasStatusData && status !== "safe" && (
          <span className={styles.hazard}>
            <Warning size={13} weight="fill" />
            {status === "critical" ? "KRITIS" : "WASPADA"}
          </span>
        )}
        {incident && (
          <span className={styles.confidence}>
            {incident.type === "fire" ? "Api" : "Asap"} terdeteksi · {Math.round((confidence ?? 0) * 100)}%
          </span>
        )}
        {isLive && <span className={styles.latency}>{packet?.fps ?? camera.fps} FPS · {packet?.latencyMs} ms</span>}
      </span>
      <span className={styles.cameraCaption}>
        <span className={styles.cameraTitle}>
          <b>{camera.name}</b>
          {selected && <i>Dipilih</i>}
        </span>
        <small><MapPin size={11} />{camera.location}</small>
        {!featured && (
          <small className={!hasStatusData ? styles.pendingCopy : status === "safe" ? styles.safeCopy : styles.alertCopy}>
            {statusLabel} <i>·</i> {incident
              ? incident.type === "fire" ? "Deteksi api" : "Deteksi asap"
              : isLive ? "Feed aktif" : "Menunggu feed"}
          </small>
        )}
      </span>
    </button>
  );
}

export function DashboardClient() {
  const { user } = useAuth();
  const [health, setHealth] = useState<BackendHealth | null>(null);
  const [cameras, setCameras] = useState<CameraFeed[]>([]);
  const [incidents, setIncidents] = useState<IncidentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState("");
  const [query, setQuery] = useState("");
  const [feedStats, setFeedStats] = useState<Record<string, FeedStat>>({});
  const [cameraScope, setCameraScope] = useState<"all" | "attention">("all");
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => setNow(new Date()), []);

  useEffect(() => {
    let alive = true;
    const refresh = async () => {
      try {
        const [nextHealth, nextCameras, nextIncidents] = await Promise.all([
          detectionAdapter.getHealth(),
          detectionAdapter.getCameras(),
          detectionAdapter.getIncidentRecords(),
        ]);
        if (alive) {
          setHealth(nextHealth);
          setCameras(nextCameras);
          setIncidents([...nextIncidents].sort((a, b) => +new Date(b.timestamp) - +new Date(a.timestamp)));
        }
      } finally {
        if (alive) setLoading(false);
      }
    };
    void refresh();
    const timer = window.setInterval(() => void refresh(), 15000);
    return () => {
      alive = false;
      window.clearInterval(timer);
    };
  }, []);

  const allCameras: CameraFeed[] = cameras;
  const cameraIncidents: IncidentRecord[] = incidents;
  const matchingCameras = allCameras.filter((camera) =>
    `${camera.name} ${camera.location} ${camera.id}`.toLowerCase().includes(query.toLowerCase()),
  );
  const attentionCameras = matchingCameras.filter((camera) => camera.status !== "safe");
  const visibleCameras = (cameraScope === "attention" ? attentionCameras : matchingCameras).slice(0, 4);
  const featured = visibleCameras.find((camera) => camera.id === selectedId) ?? visibleCameras[0];
  const reportableIncidents = incidents;
  const activeIncidents = reportableIncidents.filter((item) => item.status !== "resolved");
  const monitored = visibleCameras.filter((camera) => Boolean(camera.streamUrl)).length;
  const liveCount = Object.values(feedStats).filter((item) => item.live).length;
  const latencyValues = visibleCameras
    .map((camera) => feedStats[camera.id]?.live ? feedStats[camera.id].latency : camera.latencyMs ?? null)
    .filter((n): n is number => n !== null && Number.isFinite(n));
  const averageLatency = latencyValues.length
    ? Math.round(latencyValues.reduce((a, b) => a + b, 0) / latencyValues.length)
    : null;
  // A camera only has a real condition once a frame was analyzed; never count placeholders as safe.
  const analyzedCameras = cameras.filter(
    (camera) => camera.detections.length > 0 || incidents.some((item) => item.cameraId === camera.id),
  );
  const analyzedLocations = [...new Set(analyzedCameras.map((camera) => camera.location).filter(Boolean))];
  const safeAreas = analyzedLocations.filter((location) =>
    analyzedCameras
      .filter((camera) => camera.location === location)
      .every((camera) => camera.status === "safe"),
  ).length;
  const week = useMemo(
    () => Array.from({ length: 7 }, (_, index) => {
      const date = new Date();
      date.setHours(0, 0, 0, 0);
      date.setDate(date.getDate() - (6 - index));
      const count = reportableIncidents.filter((incident) => {
        const at = new Date(incident.timestamp);
        return at.getFullYear() === date.getFullYear()
          && at.getMonth() === date.getMonth()
          && at.getDate() === date.getDate();
      }).length;
      return { day: indonesianDays[date.getDay()], count };
    }),
    [reportableIncidents],
  );
  const weekMax = Math.max(1, ...week.map((d) => d.count));
  const setFeedStat = useCallback(
    (id: string, stat: FeedStat) => setFeedStats((current) =>
      current[id]?.live === stat.live && current[id]?.latency === stat.latency
        ? current
        : { ...current, [id]: stat },
    ),
    [],
  );
  const backendUp = Boolean(health && !["offline", "error"].includes(health.status.toLowerCase()));
  const priority = activeIncidents[0];
  const date = now
    ? new Intl.DateTimeFormat("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(now)
    : "";
  const greeting = !now
    ? "Selamat datang"
    : now.getHours() < 11
      ? "Selamat pagi"
      : now.getHours() < 15
        ? "Selamat siang"
        : now.getHours() < 18
          ? "Selamat sore"
          : "Selamat malam";
  const displayName = user?.name?.trim().split(" ")[0] || "";

  return (
    <WorkspaceShell dataUI="fire-monitoring-dashboard">
        <header className={styles.masthead}>
          <div className={styles.titleBlock}>
            <h1>Ringkasan Operasi.</h1>
            <p>
              {greeting}{displayName ? `, ${displayName}` : ""}. Pantau kondisi area dan tanggapi deteksi dari satu layar.
            </p>
          </div>
          <div className={styles.mastheadSide}>
            <span className={styles.date}>{date || "Memuat waktu operasi"}</span>
            <span className={`${styles.monitoring} ${backendUp ? styles.monitoringOn : ""}`}>
              <i />{backendUp ? "Monitoring aktif" : "Menunggu koneksi"}
            </span>
          </div>
        </header>

        <div className={styles.toolbar}>
          <label className={styles.search}>
            <MagnifyingGlass size={16} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Cari kamera atau area"
              aria-label="Cari kamera atau area"
            />
          </label>
          <SpecularButton
            href="/live-scan"
            size="lg"
            radius={999}
            tint="#140c0a"
            tintOpacity={0.88}
            blur={12}
            textColor="#ffffff"
            lineColor="#ff6b3d"
            baseColor="#3a1910"
            intensity={1.35}
            shineSize={14}
            shineFade={40}
            thickness={1.4}
            speed={0.45}
            followMouse
            proximity={320}
            autoAnimate={false}
            className={styles.liveScanButton}
          >
            <VideoCamera weight="duotone" size={16} />
            <span>Buka Live Scan</span>
          </SpecularButton>
        </div>

        <section className={styles.metrics} aria-label="Ringkasan pemantauan">
          <article>
            <span className={styles.metricLabel}>Kamera online</span>
            <strong>{monitored ? `${liveCount} / ${monitored}` : "—"}</strong>
            <small>{monitored ? `${Math.round(liveCount / monitored * 100)}% dari feed berkonfigurasi` : "Belum ada feed CCTV"}</small>
          </article>
          <article>
            <span className={styles.metricLabel}>Insiden aktif</span>
            <strong>{activeIncidents.length.toString().padStart(2, "0")}</strong>
            <small>{incidents.filter((item) => item.status === "investigating").length} perlu diverifikasi</small>
          </article>
          <article>
            <span className={styles.metricLabel}>Area aman</span>
            <strong>{analyzedLocations.length ? `${safeAreas.toString().padStart(2, "0")} / ${analyzedLocations.length.toString().padStart(2, "0")}` : "—"}</strong>
            <small>{analyzedLocations.length ? "Dari area yang sudah dianalisis" : "Belum ada area dianalisis"}</small>
          </article>
          <article>
            <span className={styles.metricLabel}>Respons kamera</span>
            <strong>{averageLatency === null ? "—" : <>{(averageLatency / 1000).toFixed(1)}<em>s</em></>}</strong>
            <small>{averageLatency === null ? "Menunggu data stream" : "Rata-rata latensi frame"}</small>
          </article>
        </section>

        <section className={styles.mainGrid} aria-label="Area kerja pemantauan">
          <article className={styles.cameraSection}>
            <div className={styles.cameraHeading}>
              <div className={styles.sectionHeading}>
                <div>
                  <h2>Pantauan kamera</h2>
                  <p>{cameras.length ? `${cameras.length} kamera terdaftar` : "Belum ada kamera terdaftar"}</p>
                </div>
                <span className={styles.cameraCount}>{visibleCameras.length.toString().padStart(2, "0")} feed</span>
              </div>
              <div className={styles.cameraFilters} role="group" aria-label="Filter daftar kamera">
                <button
                  type="button"
                  aria-pressed={cameraScope === "all"}
                  className={cameraScope === "all" ? styles.cameraFilterActive : ""}
                  onClick={() => {
                    setCameraScope("all");
                    if (matchingCameras[0]) setSelectedId(matchingCameras[0].id);
                  }}
                >
                  Semua <b>{matchingCameras.length}</b>
                </button>
                <button
                  type="button"
                  aria-pressed={cameraScope === "attention"}
                  className={cameraScope === "attention" ? styles.cameraFilterActive : ""}
                  onClick={() => {
                    setCameraScope("attention");
                    if (attentionCameras[0]) setSelectedId(attentionCameras[0].id);
                  }}
                >
                  Perlu perhatian <b>{attentionCameras.length}</b>
                </button>
              </div>
            </div>

            {featured ? (
              <div className={styles.cameraDisplay}>
                <CameraTile
                  camera={featured}
                  incident={cameraIncidents.find((item) => item.cameraId === featured.id)}
                  selected
                  featured
                  onSelect={() => setSelectedId(featured.id)}
                  onStat={setFeedStat}
                />
                <div className={styles.cameraPicker}>
                  <div className={styles.pickerHeading}>
                    <b>Daftar kamera</b>
                    <span>Pilih feed untuk ditinjau</span>
                  </div>
                  <div className={styles.cameraStrip}>
                    {visibleCameras.map((camera) => (
                      <CameraTile
                        key={camera.id}
                        camera={camera}
                        incident={cameraIncidents.find((item) => item.cameraId === camera.id)}
                        selected={camera.id === featured.id}
                        onSelect={() => setSelectedId(camera.id)}
                        onStat={setFeedStat}
                      />
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className={styles.empty}>
                <VideoCamera size={28} />
                <b>{loading
                  ? "Memuat kamera…"
                  : cameras.length === 0
                    ? "Belum ada kamera terdaftar"
                    : cameraScope === "attention" && matchingCameras.length
                      ? "Semua kamera dalam kondisi aman"
                      : "Kamera tidak ditemukan"}</b>
                <span>{loading
                  ? "Menghubungkan daftar kamera."
                  : cameras.length === 0
                    ? "Hubungkan CCTV ber-streamUrl lewat Live Scan, atau aktifkan kamera perangkat."
                    : cameraScope === "attention"
                      ? "Tidak ada feed yang memerlukan pemeriksaan saat ini."
                      : "Coba ubah kata kunci pencarian."}</span>
              </div>
            )}
          </article>

          <aside className={styles.activityPanel}>
            <div className={styles.sectionHeading}>
              <div>
                <h2>Aktivitas terbaru</h2>
                <p>Deteksi yang perlu perhatian operator</p>
              </div>
              <Link href="/incidents">Lihat semua <ArrowUpRight size={14} /></Link>
            </div>
            <div className={styles.tableHead}>
              <span>Area / kamera</span><span>Deteksi</span><span>Status</span>
            </div>
            <div className={styles.activityRows}>
              {cameraIncidents.slice(0, 4).map((item) => (
                <Link key={item.id} href="/incidents" className={styles.activityRow}>
                  <span>
                    <b>{item.zone || item.cameraName}</b>
                    <small>{item.cameraId} · {timeLabel(item.timestamp)}</small>
                  </span>
                  <span>
                    {item.type === "fire" ? "Api" : "Asap"}
                    {item.secondaryType ? ` + ${item.secondaryType === "fire" ? "api" : "asap"}` : ""}
                  </span>
                  <i className={item.status === "resolved" ? styles.stateSafe : styles.stateAlert}>
                    {item.status === "active" ? "Baru" : item.status === "investigating" ? "Tinjau" : "Selesai"}
                  </i>
                </Link>
              ))}
            </div>
            {!cameraIncidents.length && (
              <div className={styles.activityEmpty}><CheckCircle size={18} />Belum ada aktivitas deteksi.</div>
            )}
            <div className={styles.priority}>
              <small>Respons prioritas</small>
              {priority ? (
                <>
                  <b>Verifikasi {priority.zone || priority.cameraName}</b>
                  <span>
                    {priority.type === "fire" ? "Api" : "Asap"}
                    {priority.secondaryType ? ` dan ${priority.secondaryType === "fire" ? "api" : "asap"}` : " terdeteksi"}
                    {" · "}{Math.round(priority.confidence * 100)}% keyakinan
                  </span>
                  <Link href="/incidents">Buka detail insiden <ArrowUpRight size={14} /></Link>
                </>
              ) : (
                <><b>Tidak ada insiden aktif</b><span>Aktivitas baru akan muncul di sini.</span></>
              )}
            </div>
          </aside>
        </section>

        <section className={styles.bottomGrid}>
          <article className={styles.chartPanel}>
            <div className={styles.sectionHeading}>
              <div>
                <h2>Frekuensi deteksi</h2>
                <p>Aktivitas selama tujuh hari terakhir</p>
              </div>
              <strong className={styles.chartTotal}>
                {week.reduce((sum, item) => sum + item.count, 0)} <small>insiden</small>
              </strong>
            </div>
            <div className={styles.chart}>
              {week.map((item, index) => (
                <div key={`${item.day}-${index}`}>
                  <b>{item.count}</b>
                  <span title={`${item.count} insiden`}>
                    <i style={{ height: `${item.count ? Math.max(7, item.count / weekMax * 100) : 0}%` }} />
                  </span>
                  <small>{item.day}</small>
                </div>
              ))}
            </div>
          </article>

          <article className={styles.connectionPanel}>
            <div className={styles.sectionHeading}>
              <div>
                <h2>Status koneksi</h2>
                <p>Ketersediaan perangkat terhubung</p>
              </div>
              <span className={`${styles.connectionStatus} ${backendUp ? styles.good : ""}`}>
                <i />{backendUp ? "Baik" : "Offline"}
              </span>
            </div>
            <div className={styles.connectionData}>
              <div
                className={styles.ring}
                style={{ "--progress": `${monitored ? liveCount / monitored * 100 : 0}%` } as CSSProperties}
                aria-label={monitored ? `${Math.round(liveCount / monitored * 100)} persen kamera online` : "Belum ada kamera online"}
              >
                <b>{monitored ? `${Math.round(liveCount / monitored * 100)}%` : "—"}</b>
              </div>
              <div>
                <b>{backendUp ? "Jaringan stabil" : "Backend belum terhubung"}</b>
                <small>{monitored
                  ? `${liveCount} streaming · ${Math.max(0, monitored - liveCount)} offline`
                  : "Belum ada feed stream terdaftar"}</small>
              </div>
            </div>
          </article>
        </section>

        <footer className={styles.footer}>
          <span>AegisFlame / Pemantauan keselamatan</span>
          <span>Data diperbarui otomatis setiap 15 detik</span>
        </footer>
    </WorkspaceShell>
  );
}
