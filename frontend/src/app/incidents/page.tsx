"use client";

import {
  useState,
  useMemo,
  useCallback,
  useEffect,
  useRef,
  useSyncExternalStore,
} from "react";
import { HeaderNav } from "@/components/common/HeaderNav";
import { IncidentFilters } from "@/components/incidents/IncidentFilters";
import { IncidentStatCards } from "@/components/incidents/IncidentStatCards";
import { IncidentTable } from "@/components/incidents/IncidentTable";
import { SnapshotModal } from "@/components/incidents/SnapshotModal";
import { IncidentRecord } from "@/types/detection";
import { INITIAL_INCIDENT_RECORDS } from "@/services/mockDetection";
import { detectionAdapter } from "@/services/detectionAdapter";
import { getSupabase, supabase } from "@/lib/supabase";
import {
  DownloadSimple,
  LockKey,
  ShieldWarning,
  FileXls,
  FileCsv,
  CaretDown,
} from "@phosphor-icons/react";
import { useAuth } from "@/context/AuthContext";
import { GoogleLogo } from "@/components/auth/AuthModal";

const emptySubscribe = () => () => {};

export default function IncidentsPage() {
  const isClient = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const { user, openAuthModal } = useAuth();
  const isOfficialUser = Boolean(user && !user.id.startsWith("usr-"));
  const [incidents, setIncidents] = useState<IncidentRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [inspectingIncident, setInspectingIncident] = useState<IncidentRecord | null>(null);
  const [isExportOpen, setIsExportOpen] = useState<boolean>(false);
  const exportMenuRef = useRef<HTMLDivElement | null>(null);

  const fetchIncidents = useCallback(async () => {
    setIsLoading(true);
    const records = await detectionAdapter.getIncidentRecords(isOfficialUser);
    setIncidents(records);
    setIsLoading(false);
  }, [isOfficialUser]);

  useEffect(() => {
    fetchIncidents();
  }, [fetchIncidents]);

  // Realtime synchronization with Supabase Database for official users
  useEffect(() => {
    if (!isOfficialUser) return;
    const client = getSupabase() || supabase;
    if (!client) return;

    const channel = client
      .channel("incidents-realtime-listener")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "incidents" },
        () => {
          detectionAdapter.getIncidentRecords(true).then((records) => {
            setIncidents(records);
          });
        }
      )
      .subscribe();

    return () => {
      client.removeChannel(channel);
    };
  }, [isOfficialUser]);

  // Close export dropdown when clicking outside
  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      if (
        exportMenuRef.current &&
        !exportMenuRef.current.contains(e.target as Node)
      ) {
        setIsExportOpen(false);
      }
    };
    if (isExportOpen) {
      document.addEventListener("mousedown", handleDocumentClick);
    }
    return () => document.removeEventListener("mousedown", handleDocumentClick);
  }, [isExportOpen]);

  const filtered = useMemo(() => {
    return incidents.filter((item) => {
      if (typeFilter === "dual" && item.secondaryType !== "smoke") return false;
      if (typeFilter === "fire" && item.type !== "fire") return false;
      if (typeFilter === "smoke" && item.type !== "smoke" && item.secondaryType !== "smoke") {
        return false;
      }
      if (statusFilter !== "all" && item.status !== statusFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const match =
          item.id.toLowerCase().includes(q) ||
          item.cameraId.toLowerCase().includes(q) ||
          item.cameraName.toLowerCase().includes(q) ||
          (item.notes && item.notes.toLowerCase().includes(q));
        if (!match) return false;
      }
      return true;
    });
  }, [incidents, search, typeFilter, statusFilter]);

  const fireCount = incidents.filter((i) => i.type === "fire").length;
  const smokeCount = incidents.filter(
    (i) => i.type === "smoke" || i.secondaryType === "smoke"
  ).length;
  const dualCount = incidents.filter(
    (i) => i.type === "fire" && i.secondaryType === "smoke"
  ).length;
  const activeCount = incidents.filter((i) => i.status === "active").length;
  const resolvedCount = incidents.filter((i) => i.status === "resolved").length;

  const resetFilters = useCallback(() => {
    setSearch("");
    setTypeFilter("all");
    setStatusFilter("all");
  }, []);

  const handleUpdateStatus = useCallback(
    async (incidentId: string, status: IncidentRecord["status"]) => {
      setIncidents((prev) =>
        prev.map((item) =>
          item.id === incidentId ? { ...item, status } : item
        )
      );
      setInspectingIncident((prev) =>
        prev && prev.id === incidentId ? { ...prev, status } : prev
      );
      await detectionAdapter.updateIncidentStatus(incidentId, status);
    },
    []
  );

  const handleDeleteIncident = useCallback(async (incidentId: string) => {
    setIncidents((prev) => prev.filter((item) => item.id !== incidentId));
    setInspectingIncident(null);
    await detectionAdapter.deleteIncident(incidentId);
  }, []);

  /**
   * Helper: Format datetime readable in Indonesian format (e.g. 04/11/2026, 09:39 WIB)
   */
  const formatDateTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return (
        d.toLocaleString("id-ID", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }).replace(/\//g, "-") + " WIB"
      );
    } catch {
      return isoString;
    }
  };

  /**
   * Export 1: Formatted Microsoft Excel Worksheet (.xls)
   * Opens in Microsoft Excel with gorgeous borders, colors, and auto-spaced columns
   */
  const exportToExcel = useCallback(() => {
    setIsExportOpen(false);
    const dateFormatted = new Date().toLocaleDateString("id-ID", {
      dateStyle: "full",
    });
    const filenameDate = new Date().toISOString().slice(0, 10);

    const rowsHtml = filtered
      .map((i, index) => {
        const isFire = i.type === "fire";
        const hasDual = i.secondaryType === "smoke";
        const statusLabel =
          i.status === "active"
            ? "AKTIF"
            : i.status === "investigating"
            ? "INVESTIGASI"
            : "SELESAI";
        const statusStyle =
          i.status === "active"
            ? "background-color: #fee2e2; color: #991b1b; font-weight: bold; text-align: center;"
            : i.status === "investigating"
            ? "background-color: #fef3c7; color: #92400e; font-weight: bold; text-align: center;"
            : "background-color: #dcfce7; color: #166534; font-weight: bold; text-align: center;";
        const bgRow = index % 2 === 0 ? "#ffffff" : "#f8fafc";

        return `
          <tr style="background-color: ${bgRow};">
            <td style="font-family: Consolas, monospace; font-weight: bold; text-align: center;">${i.id.toUpperCase()}</td>
            <td>${formatDateTime(i.timestamp)}</td>
            <td style="font-family: Consolas, monospace;">${i.cameraId}</td>
            <td>${i.cameraName}</td>
            <td>${i.operator ? `${i.operator.name} (${i.operator.role})` : "Sistem Otomatis"}</td>
            <td style="font-weight: bold; color: ${isFire ? "#dc2626" : "#0284c7"}; text-align: center;">${isFire ? "API (FIRE)" : "ASAP (SMOKE)"}</td>
            <td style="text-align: center;">${hasDual ? "ASAP PEKAT" : "-"}</td>
            <td style="text-align: right; font-family: Consolas, monospace;">${(i.confidence * 100).toFixed(1)}%</td>
            <td style="text-align: right; font-family: Consolas, monospace;">${i.temperatureC ? `+${i.temperatureC}°C` : "-"}</td>
            <td style="text-align: right; font-family: Consolas, monospace;">${i.smokeDensityDbm ? `${i.smokeDensityDbm.toFixed(1)} dB/m` : "-"}</td>
            <td style="${statusStyle}">${statusLabel}</td>
            <td>${(i.notes || "").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</td>
          </tr>
        `;
      })
      .join("");

    const excelTemplate = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="utf-8">
        <!--[if gte mso 9]>
        <xml>
          <x:ExcelWorkbook>
            <x:ExcelWorksheets>
              <x:ExcelWorksheet>
                <x:Name>Riwayat Insiden</x:Name>
                <x:WorksheetOptions>
                  <x:DisplayGridlines/>
                </x:WorksheetOptions>
              </x:ExcelWorksheet>
            </x:ExcelWorksheets>
          </x:ExcelWorkbook>
        </xml>
        <![endif]-->
        <style>
          body { font-family: "Segoe UI", Calibri, Arial, sans-serif; font-size: 10pt; color: #0f172a; }
          table { border-collapse: collapse; width: 100%; }
          th { background-color: #0f172a; color: #ffffff; font-weight: bold; padding: 10px 12px; border: 1px solid #334155; font-size: 10pt; }
          td { padding: 8px 10px; border: 1px solid #cbd5e1; font-size: 9.5pt; vertical-align: middle; }
          .header-title { font-size: 14pt; font-weight: bold; color: #0f172a; padding: 10px 0 4px 0; }
          .header-meta { font-size: 9.5pt; color: #64748b; padding-bottom: 12px; }
        </style>
      </head>
      <body>
        <div class="header-title">AEGISFLAME — LAPORAN AUDIT INSIDEN K3 &amp; SISTEM KEAMANAN</div>
        <div class="header-meta">Dicetak pada: ${dateFormatted} | Total Rekaman: ${filtered.length} Insiden Terverifikasi</div>
        <table>
          <thead>
            <tr>
              <th>ID Insiden</th>
              <th>Waktu Kejadian (WIB)</th>
              <th>Kode Kamera</th>
              <th>Lokasi / Nama Kamera</th>
              <th>Petugas Jaga</th>
              <th>Bahaya Utama</th>
              <th>Bahaya Tambahan</th>
              <th>Akurasi Deteksi</th>
              <th>Estimasi Suhu</th>
              <th>Kepekatan Asap</th>
              <th>Status Penanganan</th>
              <th>Catatan Investigasi</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>
      </body>
      </html>
    `;

    const blob = new Blob([excelTemplate], {
      type: "application/vnd.ms-excel;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `aegisflame-laporan-insiden-${filenameDate}.xls`;
    link.click();
    URL.revokeObjectURL(url);
  }, [filtered]);

  /**
   * Export 2: Clean CSV with UTF-8 BOM
   * @param delimiter Semicolon ';' for Excel compatibility (Indonesian/Mac), or Comma ',' for standard
   */
  const exportToCsv = useCallback(
    (delimiter: ";" | ",") => {
      setIsExportOpen(false);
      const filenameDate = new Date().toISOString().slice(0, 10);
      const headers = [
        "ID Insiden",
        "Waktu Kejadian (WIB)",
        "Kode Kamera",
        "Lokasi / Nama Kamera",
        "Petugas Jaga",
        "Bahaya Utama",
        "Bahaya Tambahan",
        "Akurasi Deteksi (%)",
        "Estimasi Suhu (°C)",
        "Kepekatan Asap (dB/m)",
        "Status Penanganan",
        "Catatan Investigasi",
      ];

      const rows = filtered.map((i) => {
        const isFire = i.type === "fire";
        const hasDual = i.secondaryType === "smoke";
        const statusLabel =
          i.status === "active"
            ? "Aktif"
            : i.status === "investigating"
            ? "Investigasi"
            : "Selesai";

        // Clean notes: eliminate internal delimiters or newlines that could break Excel rows
        const cleanedNotes = (i.notes || "")
          .replace(new RegExp(delimiter, "g"), " — ")
          .replace(/[\r\n]+/g, " ")
          .replace(/"/g, '""');

        const cleanCamera = (i.cameraName || "").replace(/"/g, '""');
        const cleanOperator = (
          i.operator ? `${i.operator.name} (${i.operator.role})` : "Sistem Otomatis"
        ).replace(/"/g, '""');

        return [
          i.id.toUpperCase(),
          formatDateTime(i.timestamp),
          i.cameraId,
          `"${cleanCamera}"`,
          `"${cleanOperator}"`,
          isFire ? "Api (Fire)" : "Asap (Smoke)",
          hasDual ? "Asap Pekat" : "-",
          (i.confidence * 100).toFixed(1) + "%",
          i.temperatureC ? `+${i.temperatureC}°C` : "-",
          i.smokeDensityDbm ? `${i.smokeDensityDbm.toFixed(1)} dB/m` : "-",
          statusLabel,
          `"${cleanedNotes}"`,
        ];
      });

      // Prepend UTF-8 BOM (\uFEFF) so Excel on Windows/Mac opens degrees (°C) and symbols cleanly
      const bom = "\uFEFF";
      const directive = delimiter === "," ? "sep=,\r\n" : "";
      const csvContent =
        bom +
        directive +
        [headers.join(delimiter), ...rows.map((r) => r.join(delimiter))].join(
          "\r\n"
        );

      const blob = new Blob([csvContent], {
        type: "text/csv;charset=utf-8;",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `aegisflame-audit-insiden-${filenameDate}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    },
    [filtered]
  );

  // Loading skeleton while mounting client state
  if (!isClient) {
    return (
      <div className="min-h-screen bg-[#050507] text-[#fafafa] flex flex-col font-sans relative overflow-x-hidden">
        <HeaderNav />
        <main className="relative z-10 flex-1 flex items-center justify-center pt-24 pb-16">
          <div className="w-8 h-8 rounded-full border-2 border-white/10 border-t-[#ff5a1f] animate-spin" />
        </main>
      </div>
    );
  }

  // Option 1: Restricted Auth Gate if user is not logged in
  if (!user) {
    return (
      <div className="min-h-screen bg-[#050507] text-[#fafafa] flex flex-col font-sans relative overflow-x-hidden">
        {/* Subtle Fire & Smoke Ambient Glow */}
        <div
          className="pointer-events-none fixed inset-0 z-0"
          style={{
            background:
              "radial-gradient(circle at 50% 25%, rgba(255,90,31,0.08), transparent 50%), radial-gradient(circle at 80% 80%, rgba(56,189,248,0.04), transparent 50%)",
          }}
        />

        <HeaderNav />

        <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 sm:px-6 pt-24 pb-16 max-w-4xl mx-auto w-full text-center">
          {/* Clearance Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#ff5a1f]/10 border border-[#ff5a1f]/30 text-[11px] sm:text-xs font-mono font-medium text-[#ff8c42] mb-6 sm:mb-8">
            <LockKey weight="bold" className="w-3.5 h-3.5" />
            <span>Khusus petugas</span>
          </div>

          {/* Pod Icon */}
          <div className="relative mb-6">
            <div className="absolute -inset-4 rounded-3xl bg-[#ff5a1f]/15 blur-2xl pointer-events-none" />
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-[#0e111a] border border-[#ff5a1f]/40 flex items-center justify-center text-[#ff5a1f] shadow-2xl shadow-[#ff5a1f]/20">
              <ShieldWarning weight="duotone" className="w-8 h-8 sm:w-10 sm:h-10" />
            </div>
          </div>

          {/* Title & Description */}
          <h1 className="font-display text-2xl sm:text-4xl font-bold tracking-tight text-white max-w-xl">
            Masuk untuk melihat riwayat insiden
          </h1>

          <p className="mt-3.5 sm:mt-4 text-xs sm:text-sm text-zinc-400 max-w-lg leading-relaxed">
            Rekaman kamera, lokasi, dan data suhu tiap insiden hanya bisa dilihat oleh{" "}
            <span className="text-zinc-200 font-medium">Operator</span> dan{" "}
            <span className="text-zinc-200 font-medium">Supervisor K3</span> yang sudah login.
          </p>

          {/* Login CTA Button */}
          <div className="mt-8 flex flex-col items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={openAuthModal}
              className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-white hover:bg-zinc-100 text-zinc-950 text-sm font-semibold flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-white/10"
            >
              <GoogleLogo className="w-4 h-4" />
              <span>Masuk dengan Akun Google</span>
            </button>

            <span className="text-[11px] font-mono text-zinc-500">
              Mode demo: pilih akun Operator atau Supervisor K3 setelah menekan tombol.
            </span>
          </div>

          {/* Locked Ghost Metric Cards Preview */}
          <div className="mt-12 sm:mt-14 w-full grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 opacity-30 blur-[1px] pointer-events-none select-none">
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 text-left">
              <div className="text-[11px] text-zinc-500 font-sans">Alarm Aktif</div>
              <div className="text-xl font-bold text-white mt-1 font-mono">••</div>
            </div>
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 text-left">
              <div className="text-[11px] text-zinc-500 font-sans">Deteksi Api</div>
              <div className="text-xl font-bold text-white mt-1 font-mono">••</div>
            </div>
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 text-left">
              <div className="text-[11px] text-zinc-500 font-sans">Deteksi Asap</div>
              <div className="text-xl font-bold text-white mt-1 font-mono">••</div>
            </div>
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 text-left">
              <div className="text-[11px] text-zinc-500 font-sans">Selesai &amp; Aman</div>
              <div className="text-xl font-bold text-white mt-1 font-mono">••</div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050507] text-[#fafafa] flex flex-col font-sans relative overflow-x-hidden">
      {/* Subtle Fire & Smoke Ambient Glow */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background:
            "radial-gradient(circle at 18% 12%, rgba(255,90,31,0.06), transparent 40%), radial-gradient(circle at 82% 20%, rgba(56,189,248,0.05), transparent 40%)",
        }}
      />

      <HeaderNav />

      <main className="relative z-10 flex-1 pt-20 sm:pt-24 pb-10 sm:pb-12 px-3.5 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full flex flex-col gap-4 sm:gap-5">
        {/* Clean Header Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Riwayat Insiden
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-[11px] sm:text-xs font-mono text-zinc-400">
              {incidents.length} Rekaman
            </span>
          </div>

          {/* Export Dropdown Menu */}
          <div className="relative" ref={exportMenuRef}>
            <button
              type="button"
              onClick={() => setIsExportOpen((prev) => !prev)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.07] hover:bg-white/[0.12] border border-white/15 hover:border-[#ff5a1f]/50 text-white text-xs font-semibold transition-all active:scale-[0.98] shadow-sm"
            >
              <DownloadSimple weight="bold" className="w-3.5 h-3.5 text-[#ff8c42]" />
              <span>Ekspor Laporan</span>
              <CaretDown
                weight="bold"
                className={`w-3 h-3 text-zinc-400 transition-transform duration-200 ${
                  isExportOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Dropdown Popover */}
            {isExportOpen && (
              <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-[#0b0d14]/95 backdrop-blur-2xl border border-white/12 p-2 shadow-2xl z-40 flex flex-col gap-1 animate-[fadeIn_0.15s_ease-out]">
                <div className="px-3 py-1.5 text-[10px] font-mono font-medium text-zinc-400 uppercase tracking-wider border-b border-white/[0.06]">
                  Pilih Format Berkas
                </div>

                {/* Option 1: Microsoft Excel (.xls) */}
                <button
                  type="button"
                  onClick={exportToExcel}
                  className="w-full text-left p-2.5 rounded-xl hover:bg-white/[0.06] transition-colors flex items-start gap-2.5 group"
                >
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                    <FileXls weight="duotone" className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-white group-hover:text-emerald-300 transition-colors flex items-center gap-1.5">
                      <span>Microsoft Excel (.xls)</span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                        Rekomendasi
                      </span>
                    </div>
                    <div className="text-[11px] text-zinc-400 leading-snug mt-0.5">
                      Tabel rapi bergaris, berwarna, dan otomatis terpisah per kolom di Excel.
                    </div>
                  </div>
                </button>

                {/* Option 2: CSV untuk Excel (Semicolon Delimited) */}
                <button
                  type="button"
                  onClick={() => exportToCsv(";")}
                  className="w-full text-left p-2.5 rounded-xl hover:bg-white/[0.06] transition-colors flex items-start gap-2.5 group"
                >
                  <div className="w-8 h-8 rounded-lg bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0 mt-0.5">
                    <FileCsv weight="duotone" className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-white group-hover:text-blue-300 transition-colors">
                      CSV untuk Excel (.csv)
                    </div>
                    <div className="text-[11px] text-zinc-400 leading-snug mt-0.5">
                      Pemisah titik-koma (;) dengan UTF-8 BOM, otomatis rapi di Excel Indonesia/Mac.
                    </div>
                  </div>
                </button>

                {/* Option 3: CSV Standar (Comma Delimited) */}
                <button
                  type="button"
                  onClick={() => exportToCsv(",")}
                  className="w-full text-left p-2.5 rounded-xl hover:bg-white/[0.06] transition-colors flex items-start gap-2.5 group"
                >
                  <div className="w-8 h-8 rounded-lg bg-white/[0.05] border border-white/10 flex items-center justify-center text-zinc-300 shrink-0 mt-0.5">
                    <FileCsv weight="bold" className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-white group-hover:text-zinc-200 transition-colors">
                      CSV Standar (.csv)
                    </div>
                    <div className="text-[11px] text-zinc-400 leading-snug mt-0.5">
                      Pemisah koma (,), kompatibel dengan Google Sheets, Python, &amp; Database.
                    </div>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>

        <IncidentStatCards
          activeCount={activeCount}
          fireCount={fireCount}
          smokeCount={smokeCount}
          dualCount={dualCount}
          resolvedCount={resolvedCount}
        />

        <IncidentFilters
          search={search}
          onSearchChange={setSearch}
          typeFilter={typeFilter}
          onTypeFilterChange={setTypeFilter}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          totalCount={incidents.length}
          filteredCount={filtered.length}
          onReset={resetFilters}
        />

        <IncidentTable
          records={filtered}
          onInspect={(item) => setInspectingIncident(item)}
          onResetFilters={resetFilters}
        />
      </main>

      <SnapshotModal
        incident={inspectingIncident}
        onClose={() => setInspectingIncident(null)}
        onUpdateStatus={handleUpdateStatus}
        onDelete={handleDeleteIncident}
      />
    </div>
  );
}
