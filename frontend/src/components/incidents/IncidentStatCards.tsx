import styles from "./Incidents.module.css";

interface IncidentStatCardsProps {
  activeCount: number;
  fireCount: number;
  smokeCount: number;
  dualCount: number;
  resolvedCount: number;
}

export function IncidentStatCards({
  activeCount,
  fireCount,
  smokeCount,
  dualCount,
  resolvedCount,
}: IncidentStatCardsProps) {
  const items = [
    { label: "Alarm aktif", value: activeCount, detail: `${dualCount} kejadian api + asap`, primary: true },
    { label: "Deteksi api", value: fireCount, detail: "Dari seluruh rekaman" },
    { label: "Deteksi asap", value: smokeCount, detail: "Termasuk deteksi gabungan" },
    { label: "Selesai & aman", value: resolvedCount, detail: "Sudah ditangani" },
  ];

  return (
    <section className={styles.stats} aria-label="Ringkasan insiden">
      {items.map((item) => (
        <article key={item.label} className={`${styles.stat} ${item.primary ? styles.statPrimary : ""}`}>
          <span className={styles.statLabel}>{item.label}</span>
          <b className={styles.statValue}>{String(item.value).padStart(2, "0")}</b>
          <small className={styles.statDetail}>{item.detail}</small>
        </article>
      ))}
    </section>
  );
}
