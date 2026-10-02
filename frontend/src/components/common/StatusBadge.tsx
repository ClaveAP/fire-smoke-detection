import { CameraStatus } from "@/types/detection";

interface StatusBadgeProps {
  status: CameraStatus;
  size?: "sm" | "md";
  className?: string;
}

export function StatusBadge({ status, size = "md", className = "" }: StatusBadgeProps) {
  const configs = {
    safe: {
      label: "NOMINAL",
      dotClass: "bg-emerald-500",
      badgeClass: "bg-emerald-950/40 text-emerald-400 border-emerald-800/50",
    },
    warning: {
      label: "SMOKE ALERT",
      dotClass: "bg-amber-500",
      badgeClass: "bg-amber-950/40 text-amber-400 border-amber-800/50",
    },
    critical: {
      label: "FIRE DETECTED",
      dotClass: "bg-red-500 animate-pulse",
      badgeClass: "bg-red-950/40 text-red-400 border-red-800/50",
    },
  };

  const { label, dotClass, badgeClass } = configs[status];
  const sizeClass = size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs";

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-mono uppercase tracking-wider font-semibold border rounded ${badgeClass} ${sizeClass} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotClass}`} />
      {label}
    </span>
  );
}
