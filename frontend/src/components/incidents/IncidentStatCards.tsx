import { Flame, CloudFog, ShieldCheck } from "lucide-react";

interface IncidentStatCardsProps {
  activeCount: number;
  fireCount: number;
  smokeCount: number;
  resolvedCount: number;
}

export function IncidentStatCards({
  activeCount,
  fireCount,
  smokeCount,
  resolvedCount,
}: IncidentStatCardsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="bg-[#131b2e] border border-[#2d3449] rounded-lg p-4">
        <div className="text-[10px] font-mono text-[#e4beb4] uppercase tracking-wider mb-1">
          Active Threats
        </div>
        <div className="font-mono text-2xl font-bold text-red-400">{activeCount}</div>
        <div className="text-[11px] text-slate-500 font-mono mt-1">Requiring Response</div>
      </div>

      <div className="bg-[#131b2e] border border-[#2d3449] rounded-lg p-4">
        <div className="text-[10px] font-mono text-[#e4beb4] uppercase tracking-wider mb-1">
          Fire Incidents
        </div>
        <div className="font-mono text-2xl font-bold text-slate-100 flex items-center gap-2">
          <Flame className="w-5 h-5 text-[#ff5722] fill-[#ff5722]" />
          {fireCount}
        </div>
        <div className="text-[11px] text-slate-500 font-mono mt-1">Optical Signatures</div>
      </div>

      <div className="bg-[#131b2e] border border-[#2d3449] rounded-lg p-4">
        <div className="text-[10px] font-mono text-[#e4beb4] uppercase tracking-wider mb-1">
          Smoke Advisories
        </div>
        <div className="font-mono text-2xl font-bold text-slate-100 flex items-center gap-2">
          <CloudFog className="w-5 h-5 text-[#ffba38]" />
          {smokeCount}
        </div>
        <div className="text-[11px] text-slate-500 font-mono mt-1">Particulate Plumes</div>
      </div>

      <div className="bg-[#131b2e] border border-[#2d3449] rounded-lg p-4">
        <div className="text-[10px] font-mono text-[#e4beb4] uppercase tracking-wider mb-1">
          Resolved Cases
        </div>
        <div className="font-mono text-2xl font-bold text-emerald-400 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-500" />
          {resolvedCount}
        </div>
        <div className="text-[11px] text-slate-500 font-mono mt-1">Verified Nominal</div>
      </div>
    </div>
  );
}
