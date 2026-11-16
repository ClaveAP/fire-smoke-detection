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
    <section className="grid grid-cols-1 min-[440px]:grid-cols-2 lg:grid-cols-4 gap-3" aria-label="Ringkasan insiden">
      {items.map((item) => (
        <article key={item.label} data-primary-gradient={item.primary ? "true" : undefined} className={`flex min-h-[112px] flex-col justify-center gap-2 rounded-[17px] border px-5 py-4 ${item.primary ? "border-[#c83f32] bg-[#c83f32] text-white" : "border-[#eeede9] bg-white text-[#292b27]"}`}>
          <span className={`text-xs ${item.primary ? "text-white" : "text-[#777971]"}`}>{item.label}</span>
          <b className={`text-[28px] font-medium leading-none tracking-[-.055em] tabular-nums ${item.primary ? "text-white" : ""}`}>{item.value}</b>
          <small className={`text-[10px] ${item.primary ? "text-white" : "text-[#969790]"}`}>{item.detail}</small>
        </article>
      ))}
    </section>
  );
}
