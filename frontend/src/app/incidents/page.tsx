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
import { useAuth } from "@/context/AuthContext";
import {
  DownloadSimple,
  FileXls,
  FileCsv,
  CaretDown,
} from "@phosphor-icons/react";

const emptySubscribe = () => () => {};

export default function IncidentsPage() {
  const isClient = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const { user } = useAuth();
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
      <div data-horizon className="min-h-screen bg-[#050507] text-[#fafafa] flex flex-col font-sans relative overflow-x-hidden">
        <HeaderNav />
        <main className="relative z-10 flex-1 flex items-center justify-center pt-24 pb-16">
          <div className="w-8 h-8 rounded-full border-2 border-white/10 border-t-[#ff5a1f] animate-spin" />
        </main>
      </div>
    );
  }

  return (
    <div data-horizon className="min-h-screen bg-[#050507] text-[#fafafa] flex flex-col font-sans relative overflow-x-hidden">
      <HeaderNav />

      <main className="relative z-10 flex-1 pt-20 sm:pt-24 pb-10 sm:pb-12 px-3.5 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full flex flex-col gap-4 sm:gap-5">
        <div className="flex flex-wrap items-end justify-between gap-5 sm:gap-8 pb-1">
          <div>
            <h1 className="text-3xl sm:text-[38px] font-medium tracking-[-.065em] leading-[1.1] text-white">
              Aktivitas keselamatan
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-2.5">
              <p className="text-[13px] text-zinc-400">Pantau bukti terbaru dan tindak lanjut insiden dari seluruh area.</p>
              <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/10 text-[10px] font-medium text-zinc-400">
                {incidents.length} rekaman
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Export Dropdown Menu */}
            <div id="reports" className="relative scroll-mt-24" ref={exportMenuRef}>
            <button
              type="button"
              onClick={() => setIsExportOpen((prev) => !prev)}
              className="inline-flex min-h-10 items-center gap-2 rounded-full border border-[#e1dfd9] bg-white px-4 text-xs font-medium text-[#454740] transition-colors hover:bg-[#f8f7f4] active:scale-[.98]"
            >
              <DownloadSimple weight="bold" className="w-3.5 h-3.5 text-[#bd4338]" />
              <span>Ekspor Laporan</span>
              <CaretDown
                weight="bold"
                className={`w-3 h-3 text-[#85877f] transition-transform duration-200 ${
                  isExportOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Dropdown Popover */}
            {isExportOpen && (
              <div className="absolute right-0 z-40 mt-2 flex w-72 flex-col gap-1 rounded-2xl border border-[#e7e6e1] bg-white p-2">
                <div className="border-b border-[#eeede8] px-3 py-1.5 text-[10px] font-medium text-[#777971]">
                  Pilih Format Berkas
                </div>

                {/* Option 1: Microsoft Excel (.xls) */}
                <button
                  type="button"
                  onClick={exportToExcel}
                  className="group flex w-full items-start gap-2.5 rounded-xl p-2.5 text-left transition-colors hover:bg-[#f7f6f3]"
                >
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#edf4ef] text-[#4e8063]">
                    <FileXls weight="duotone" className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-[#292b27]">
                      <span>Microsoft Excel (.xls)</span>
                      <span className="rounded bg-[#edf4ef] px-1.5 py-0.5 text-[9px] text-[#4e8063]">
                        Rekomendasi
                      </span>
                    </div>
                    <div className="mt-0.5 text-[11px] leading-snug text-[#777971]">
                      Tabel rapi bergaris, berwarna, dan otomatis terpisah per kolom di Excel.
                    </div>
                  </div>
                </button>

                {/* Option 2: CSV untuk Excel (Semicolon Delimited) */}
                <button
                  type="button"
                  onClick={() => exportToCsv(";")}
                  className="group flex w-full items-start gap-2.5 rounded-xl p-2.5 text-left transition-colors hover:bg-[#f7f6f3]"
                >
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#f0efea] text-[#686a63]">
                    <FileCsv weight="duotone" className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-medium text-[#292b27]">
                      CSV untuk Excel (.csv)
                    </div>
                    <div className="mt-0.5 text-[11px] leading-snug text-[#777971]">
                      Pemisah titik-koma (;) dengan UTF-8 BOM, otomatis rapi di Excel Indonesia/Mac.
                    </div>
                  </div>
                </button>

                {/* Option 3: CSV Standar (Comma Delimited) */}
                <button
                  type="button"
                  onClick={() => exportToCsv(",")}
                  className="group flex w-full items-start gap-2.5 rounded-xl p-2.5 text-left transition-colors hover:bg-[#f7f6f3]"
                >
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#f0efea] text-[#686a63]">
                    <FileCsv weight="bold" className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-medium text-[#292b27]">
                      CSV Standar (.csv)
                    </div>
                    <div className="mt-0.5 text-[11px] leading-snug text-[#777971]">
                      Pemisah koma (,), kompatibel dengan Google Sheets, Python, &amp; Database.
                    </div>
                  </div>
                </button>
              </div>
            )}
          </div>
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
