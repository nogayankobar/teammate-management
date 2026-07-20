"use client";

import { tasks } from "@/data/mockData";

// ─── Computations ─────────────────────────────────────────────────────────────

export function computeKpis() {
  const total = tasks.length;
  const inProgress = tasks.filter((t) => t.status === "in_progress").length;
  const processed = total - inProgress;
  const volumeRate = total > 0 ? Math.round((processed / total) * 100) : 0;

  const scoreable = tasks.filter(
    (t) => t.status !== "in_progress" && t.status !== "pending_review" && t.status !== "flagged"
  );
  const scoreSum = scoreable.reduce((sum, t) => {
    if (t.status === "error" || t.status === "abandoned") return sum;
    if (typeof t.userOverride === "number" && t.userOverride > 0 && t.fieldStats.total > 0) {
      return sum + (t.fieldStats.total - t.userOverride) / t.fieldStats.total;
    }
    return sum + 1.0;
  }, 0);
  const accuracyRate = scoreable.length > 0 ? Math.round((scoreSum / scoreable.length) * 100) : 0;

  // Automation rate: items the agent handled end-to-end with no human involvement
  const completed = tasks.filter((t) => t.status !== "in_progress");
  const autoHandled = completed.filter((t) => t.status === "auto_approved").length;
  const automationRate = completed.length > 0 ? Math.round((autoHandled / completed.length) * 100) : 0;

  return { total, processed, volumeRate, accuracyRate, automationRate };
}

// ─── Info icon ────────────────────────────────────────────────────────────────

function InfoIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.2" className="text-tipalti-text-muted flex-shrink-0">
      <circle cx="6" cy="6" r="5" />
      <path d="M6 5.5v3" strokeLinecap="round" />
      <circle cx="6" cy="3.7" r="0.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

// ─── Delta pill ───────────────────────────────────────────────────────────────

function DeltaPill({ delta, positive, down }: { delta: string; positive: boolean; down?: boolean }) {
  const arrowDown = down ?? !positive;
  const bg = positive ? "bg-tipalti-success-bg text-tipalti-success" : "bg-tipalti-danger-bg text-tipalti-danger";
  return (
    <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9.5px] leading-none font-medium whitespace-nowrap flex-shrink-0 ${bg}`}>
      <svg width="7" height="7" viewBox="0 0 11 11" fill="none" className="flex-shrink-0">
        <path
          d={arrowDown ? "M5.5 2v7M2 5.5l3.5 3.5 3.5-3.5" : "M5.5 9V2M2 5.5l3.5-3.5 3.5 3.5"}
          stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"
        />
      </svg>
      {delta} vs last week
    </span>
  );
}

// ─── Area sparkline ───────────────────────────────────────────────────────────

function AreaSparkline({ points, color, gradientId }: { points: number[]; color: string; gradientId: string }) {
  const w = 100;
  const h = 36;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const step = w / (points.length - 1);
  const coords = points.map((v, i) => [
    i * step,
    h - ((v - min) / range) * (h - 6) - 3,
  ]);
  const line = coords.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const area = `${line} L${w},${h} L0,${h} Z`;

  return (
    <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" fill="none">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.28" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gradientId})`} stroke="none" />
      <path d={line} stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ─── KPI card ─────────────────────────────────────────────────────────────────

function KpiCard({
  label,
  value,
  sub,
  delta,
  deltaPositive,
  deltaDown,
  sparkPoints,
}: {
  label: string;
  value: string;
  sub?: string;
  delta: string;
  deltaPositive: boolean;
  deltaDown?: boolean;
  sparkPoints: number[];
}) {
  const sparkColor = "#6366F1";
  const gradientId = `kpi-spark-${label.replace(/\s+/g, "-").toLowerCase()}`;

  return (
    <div className="bg-white border border-tipalti-border rounded-xl shadow-card overflow-hidden flex flex-col">
      <div className="px-3.5 pt-3.5 flex flex-col gap-2">
        <div className="flex items-center justify-between gap-1.5">
          <div className="flex items-center gap-1 min-w-0 flex-shrink-0">
            <span className="text-[11.5px] font-medium text-tipalti-text-secondary whitespace-nowrap">{label}</span>
            <InfoIcon />
          </div>
          <DeltaPill delta={delta} positive={deltaPositive} down={deltaDown} />
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-[24px] font-bold text-tipalti-text-primary leading-none">{value}</span>
          {sub && <span className="text-[12px] text-tipalti-text-muted">{sub}</span>}
        </div>
      </div>
      <div className="mt-2 -mb-px">
        <AreaSparkline points={sparkPoints} color={sparkColor} gradientId={gradientId} />
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function KpiBar() {
  const { processed, total, volumeRate, accuracyRate, automationRate } = computeKpis();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <KpiCard
        label="Volume rate"
        value={`${volumeRate}%`}
        sub={`${processed} out of ${total} items`}
        delta="+6%"
        deltaPositive
        sparkPoints={[3, 5, 8, 10, 11, 13, volumeRate]}
      />
      <KpiCard
        label="Automation rate"
        value={`${automationRate}%`}
        sub="no changes"
        delta="+7%"
        deltaPositive
        sparkPoints={[7, 8, 9, 10, 11, 12, automationRate]}
      />
      <KpiCard
        label="Accuracy rate"
        value={`${accuracyRate}%`}
        sub="of fields"
        delta="+7%"
        deltaPositive
        sparkPoints={[58, 61, 65, 67, 64, 68, accuracyRate]}
      />
      <KpiCard
        label="Avg review time"
        value="13h"
        sub="24h for all"
        delta="-7.3%"
        deltaPositive
        deltaDown
        sparkPoints={[24, 22, 20, 19, 17, 15, 13]}
      />
    </div>
  );
}
