"use client";

import { teammate } from "@/data/mockData";

type Tab = "feed" | "instructions";

const tabs: Array<{ id: Tab; label: string }> = [
  { id: "feed", label: "Work Items" },
  { id: "instructions", label: "Instructions" },
];

// ─── Metrics ──────────────────────────────────────────────────────────────────

function sparklinePath(data: number[]): { line: string; area: string } {
  const w = 80, h = 26;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const step = w / (data.length - 1);
  const pts = data.map((d, i) => ({
    x: +(i * step).toFixed(1),
    y: +(h - ((d - min) / range) * (h * 0.75) - h * 0.1).toFixed(1),
  }));
  const line = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  const area = `${line} L${w},${h} L0,${h} Z`;
  return { line, area };
}

const METRICS = [
  {
    label: "Processed",
    value: "47",
    sub: "this month",
    trend: "↑ 4.2%",
    trendClass: "text-tipalti-success bg-tipalti-success-bg",
    data: [30, 35, 28, 40, 38, 45, 47],
    color: "#0065FF",
  },
  {
    label: "Avg confidence",
    value: "94%",
    sub: "across all fields",
    trend: "↑ 2.1%",
    trendClass: "text-tipalti-success bg-tipalti-success-bg",
    data: [88, 90, 91, 92, 93, 94, 94],
    color: "#36B37E",
  },
  {
    label: "Override rate",
    value: "8%",
    sub: "of reviewed",
    trend: "↓ 3.2%",
    trendClass: "text-tipalti-success bg-tipalti-success-bg",
    data: [14, 12, 13, 11, 10, 9, 8],
    color: "#0065FF",
  },
] as const;

function MetricsRow() {
  return (
    <div className="grid grid-cols-3 gap-3 my-5">
      {METRICS.map((m) => {
        const { line, area } = sparklinePath([...m.data]);
        return (
          <div key={m.label} className="bg-white rounded-lg border border-tipalti-border px-4 py-3 flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <p className="text-[11px] font-medium text-tipalti-text-muted uppercase tracking-wide">{m.label}</p>
              <div className="flex items-baseline gap-1.5">
                <p className="text-[22px] font-bold text-tipalti-text-primary leading-none">{m.value}</p>
                <p className="text-[11px] text-tipalti-text-muted">{m.sub}</p>
              </div>
              <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded self-start ${m.trendClass}`}>
                {m.trend}
              </span>
            </div>
            <svg width="80" height="26" viewBox="0 0 80 26" fill="none">
              <path d={area} fill={m.color} fillOpacity="0.08" />
              <path d={line} stroke={m.color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        );
      })}
    </div>
  );
}

interface TeammateHeaderProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

export default function TeammateHeader({ activeTab, onTabChange }: TeammateHeaderProps) {
  return (
    <div>
      {/* Identity row */}
      <div className="flex items-center gap-4 mb-5">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center shadow-card flex-shrink-0"
          style={{ backgroundColor: teammate.avatarColor }}
        >
          <span className="text-white font-bold text-sm">{teammate.avatar}</span>
        </div>
        <div>
          <h1 className="text-lg font-bold text-tipalti-text-primary">{teammate.name}</h1>
          <p className="text-xs text-tipalti-text-muted mt-0.5">
            {teammate.domain} &middot; {teammate.job}
          </p>
        </div>
      </div>

      {/* Metrics */}
      <MetricsRow />

      {/* Tabs */}
      <div className="border-b border-tipalti-border">
        <nav className="-mb-px flex gap-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-tipalti-blue text-tipalti-blue"
                  : "border-transparent text-tipalti-text-secondary hover:text-tipalti-text-primary hover:border-tipalti-border"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}
