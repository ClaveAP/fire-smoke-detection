"use client";

import {
  useState,
  useMemo,
  useCallback,
  useEffect,
  useRef,
  useSyncExternalStore,
} from "react";
import { WorkspaceShell } from "@/components/dashboard/WorkspaceShell";
import { WorkspacePageHeader } from "@/components/dashboard/WorkspacePageHeader";
import { IncidentFilters } from "@/components/incidents/IncidentFilters";
import { IncidentStatCards } from "@/components/incidents/IncidentStatCards";
import { IncidentTable } from "@/components/incidents/IncidentTable";
import { SnapshotModal } from "@/components/incidents/SnapshotModal";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { IncidentRecord } from "@/types/detection";
import { detectionAdapter } from "@/services/detectionAdapter";
import { getSupabase, supabase } from "@/lib/supabase";
import {
  DownloadSimple,
  FileXls,
  FileCsv,
  CaretDown,
} from "@phosphor-icons/react";
import workspaceStyles from "@/components/dashboard/WorkspacePage.module.css";
import styles from "@/components/incidents/Incidents.module.css";

const emptySubscribe = () => () => {};

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const formatDateTime = (isoString: string) => {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return "—";
  return (
    date
      .toLocaleString("id-ID", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
      .replace(/\//g, "-") + " WIB"
  );
};

/** Local calendar date for file names (UTC would name a WIB evening export "yesterday"). */
const todayStamp = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(
    now.getDate()
  ).padStart(2, "0")}`;
};

/** Append the anchor so Safari/Firefox start the download, then release the URL later. */
const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.rel = "noopener";
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1500);
};

export default function IncidentsPage() {
  const isClient = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const [incidents, setIncidents] = useState<IncidentRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [inspectingIncident, setInspectingIncident] = useState<IncidentRecord | null>(null);
  /** Incident waiting for the delete confirmation dialog. */
  const [pendingDelete, setPendingDelete] = useState<IncidentRecord | null>(null);
  const [isExportOpen, setIsExportOpen] = useState<boolean>(false);
  const exportMenuRef = useRef<HTMLDivElement | null>(null);

  const fetchIncidents = useCallback(async () => {
    setIsLoading(true);
    const records = await detectionAdapter.getIncidentRecords();
    setIncidents(records);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchIncidents();
  }, [fetchIncidents]);

  // Realtime synchronization with the Supabase database
  useEffect(() => {
    const client = getSupabase() || supabase;
    if (!client) return;

    const channel = client
      .channel("incidents-realtime-listener")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "incidents" },
        () => {
          detectionAdapter.getIncidentRecords().then((records) => {
            setIncidents(records);
          });
        }
      )
      .subscribe();

    return () => {
      client.removeChannel(channel);
    };
  }, []);

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

  // Nothing to export means the menu should not stay open with empty results.
  useEffect(() => {
    if (filtered.length === 0) setIsExportOpen(false);
  }, [filtered.length]);

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
   * Export 1: Formatted Microsoft Excel Worksheet (.xls)
   * Opens in Microsoft Excel with borders, colors, and auto-spaced columns
   */
  const exportToExcel = useCallback(() => {
    setIsExportOpen(false);
    const dateFormatted = new Date().toLocaleDateString("id-ID", {
      dateStyle: "full",
    });
    const filenameDate = todayStamp();

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
        const operatorLabel = i.operator
          ? `${i.operator.name} (${i.operator.roleTitle || i.operator.role || "Petugas"})`
          : "Sistem Otomatis";

        return `
          <tr style="background-color: ${bgRow};">
            <td style="font-family: Consolas, monospace; font-weight: bold; text-align: center;">${escapeHtml(i.id.toUpperCase())}</td>
            <td>${escapeHtml(formatDateTime(i.timestamp))}</td>
            <td style="font-family: Consolas, monospace;">${escapeHtml(i.cameraId)}</td>
            <td>${escapeHtml(i.cameraName)}</td>
            <td>${escapeHtml(operatorLabel)}</td>
            <td style="font-weight: bold; color: ${isFire ? "#dc2626" : "#0284c7"}; text-align: center;">${isFire ? "API (FIRE)" : "ASAP (SMOKE)"}</td>
            <td style="text-align: center;">${hasDual ? "ASAP PEKAT" : "-"}</td>
            <td style="text-align: right; font-family: Consolas, monospace;">${(i.confidence * 100).toFixed(1)}%</td>
            <td style="text-align: right; font-family: Consolas, monospace;">${i.temperatureC ? `+${i.temperatureC}°C` : "-"}</td>
            <td style="text-align: right; font-family: Consolas, monospace;">${i.smokeDensityDbm ? `${i.smokeDensityDbm.toFixed(1)} dB/m` : "-"}</td>
            <td style="${statusStyle}">${statusLabel}</td>
            <td>${escapeHtml(i.notes || "")}</td>
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
        <div class="header-meta">Dicetak pada: ${dateFormatted} | Total Rekaman: ${filtered.length} insiden (mengikuti filter yang aktif)</div>
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
    downloadBlob(blob, `aegisflame-laporan-insiden-${filenameDate}.xls`);
  }, [filtered]);

  /**
   * Export 2: Clean CSV with UTF-8 BOM
   * @param delimiter Semicolon ';' for Excel compatibility (Indonesian/Mac), or Comma ',' for standard
   */
  const exportToCsv = useCallback(
    (delimiter: ";" | ",") => {
      setIsExportOpen(false);
      const filenameDate = todayStamp();
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
        const operatorLabel = i.operator
          ? `${i.operator.name} (${i.operator.roleTitle || i.operator.role || "Petugas"})`
          : "Sistem Otomatis";
        const cleanOperator = operatorLabel.replace(/"/g, '""');

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

      // UTF-8 BOM keeps °C and accented text readable in Excel.
      // The "sep=" directive is an Excel hint only, so the standard comma file stays plain CSV.
      const bom = "\uFEFF";
      const directive = delimiter === ";" ? "sep=;\r\n" : "";
      const csvContent =
        bom +
        directive +
        [headers.join(delimiter), ...rows.map((r) => r.join(delimiter))].join(
          "\r\n"
        );

      const blob = new Blob([csvContent], {
        type: "text/csv;charset=utf-8;",
      });
      downloadBlob(blob, `aegisflame-audit-insiden-${filenameDate}.csv`);
    },
    [filtered]
  );

  const exportOptions = [
    {
      label: "Microsoft Excel (.xls)",
      detail: "Tabel berformat untuk audit dan laporan K3.",
      icon: FileXls,
      action: exportToExcel,
      recommended: true,
    },
    {
      label: "CSV untuk Excel (.csv)",
      detail: "Pemisah titik-koma dengan UTF-8 BOM.",
      icon: FileCsv,
      action: () => exportToCsv(";"),
      recommended: false,
    },
    {
      label: "CSV Standar (.csv)",
      detail: "Pemisah koma untuk Sheets, Python, dan database.",
      icon: FileCsv,
      action: () => exportToCsv(","),
      recommended: false,
    },
  ];

  // Loading skeleton while mounting client state
  if (!isClient) {
    return (
      <WorkspaceShell dataUI="incident-log">
        <div className={workspaceStyles.content}>
          <WorkspacePageHeader
            title="Aktivitas keselamatan."
            description="Pantau bukti terbaru dan tindak lanjut insiden dari seluruh area."
          />
          <div className={styles.loading} aria-label="Memuat riwayat insiden"><i /></div>
        </div>
      </WorkspaceShell>
    );
  }

  return (
    <WorkspaceShell dataUI="incident-log">
      <div className={workspaceStyles.content}>
        <WorkspacePageHeader
          title="Aktivitas keselamatan."
          description="Pantau bukti terbaru dan tindak lanjut insiden dari seluruh area."
          aside={
            <>
              <span className={workspaceStyles.status} data-online={!isLoading}>
                <i />{isLoading ? "Menyegarkan rekaman" : `${incidents.length} rekaman tersimpan`}
              </span>
              <div id="reports" className={styles.exportArea} ref={exportMenuRef}>
                <button
                  type="button"
                  onClick={() => setIsExportOpen((prev) => !prev)}
                  className={styles.exportButton}
                  aria-expanded={isExportOpen}
                  disabled={filtered.length === 0}
                  title={filtered.length === 0 ? "Tidak ada rekaman untuk diekspor" : "Ekspor rekaman yang sedang ditampilkan"}
                >
                  <DownloadSimple size={15} weight="bold" />
                  <span>Ekspor Laporan</span>
                  <CaretDown size={12} weight="bold" className={`${styles.exportCaret} ${isExportOpen ? styles.exportCaretOpen : ""}`} />
                </button>
                {isExportOpen && (
                  <div className={styles.exportPopover}>
                    <span className={styles.exportPopoverLabel}>Pilih format berkas</span>
                    {exportOptions.map((option) => {
                      const Icon = option.icon;
                      return (
                        <button key={option.label} type="button" onClick={option.action} className={styles.exportOption}>
                          <span className={styles.exportOptionIcon}><Icon size={17} weight="duotone" /></span>
                          <span className={styles.exportOptionCopy}>
                            <span className={styles.exportOptionTitle}>
                              {option.label}
                              {option.recommended && <span className={styles.recommended}>Rekomendasi</span>}
                            </span>
                            <small>{option.detail}</small>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          }
        />

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

        <footer className={workspaceStyles.footer}>
          <span>AegisFlame / Audit insiden keselamatan</span>
          <span>Filter dan ekspor mengikuti rekaman yang ditampilkan</span>
        </footer>
      </div>

      <SnapshotModal
        incident={inspectingIncident}
        onClose={() => setInspectingIncident(null)}
        onUpdateStatus={handleUpdateStatus}
        suspendEscape={Boolean(pendingDelete)}
        onDelete={(incidentId) =>
          setPendingDelete(incidents.find((item) => item.id === incidentId) ?? null)
        }
      />

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        tone="danger"
        title="Hapus rekaman insiden?"
        description={
          <>
            Rekaman <b>{pendingDelete?.id.toUpperCase()}</b> dari{" "}
            <b>{pendingDelete?.cameraName}</b> akan dihapus dari log, backend, dan database.
            Tindakan ini tidak bisa dibatalkan.
          </>
        }
        confirmLabel="Hapus rekaman"
        onClose={() => setPendingDelete(null)}
        onConfirm={() => {
          const target = pendingDelete;
          setPendingDelete(null);
          if (target) void handleDeleteIncident(target.id);
        }}
      />
    </WorkspaceShell>
  );
}
