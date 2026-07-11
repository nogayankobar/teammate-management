"use client";

import { tasks } from "@/data/mockData";
import { AnnotationZone } from "@/components/AnnotationZone";

// ─── Computations ─────────────────────────────────────────────────────────────

function computeKpis() {
  const total = tasks.length;
  const inProgress = tasks.filter((t) => t.status === "in_progress").length;
  const processed = total - inProgress;

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

  return { total, processed, accuracyRate, automationRate };
}

// ─── Sparkline ────────────────────────────────────────────────────────────────

function Sparkline({ points, color }: { points: number[]; color: string }) {
  const w = 80;
  const h = 28;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const step = w / (points.length - 1);
  const coords = points.map((v, i) => [
    i * step,
    h - ((v - min) / range) * (h - 4) - 2,
  ]);
  const d = coords.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} fill="none">
      <path d={d} stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
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
  sparkColor,
}: {
  label: string;
  value: string;
  sub?: string;
  delta: string;
  deltaPositive: boolean;
  deltaDown?: boolean;
  sparkPoints: number[];
  sparkColor: string;
}) {
  const arrowDown = deltaDown ?? !deltaPositive;
  return (
    <div className="flex-1 px-6 py-4 flex flex-col gap-1.5">
      <p className="text-[11px] font-semibold text-tipalti-text-muted uppercase tracking-wide">{label}</p>
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-[26px] font-bold text-tipalti-text-primary leading-none">{value}</p>
          {sub && <p className="text-[11px] text-tipalti-text-muted mt-0.5">{sub}</p>}
          <div className="flex items-center gap-1 mt-1.5">
            <svg
              width="11" height="11" viewBox="0 0 11 11" fill="none"
              className={deltaPositive ? "text-tipalti-success" : "text-tipalti-danger"}
            >
              <path
                d={arrowDown ? "M5.5 2v7M2 5.5l3.5 3.5 3.5-3.5" : "M5.5 9V2M2 5.5l3.5-3.5 3.5 3.5"}
                stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"
              />
            </svg>
            <span className={`text-[11px] font-medium ${deltaPositive ? "text-tipalti-success" : "text-tipalti-danger"}`}>
              {delta}
            </span>
            <span className="text-[11px] text-tipalti-text-muted">vs last week</span>
          </div>
        </div>
        <Sparkline points={sparkPoints} color={sparkColor} />
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function KpiBar() {
  const { total, processed, accuracyRate, automationRate } = computeKpis();

  return (
    <div className="bg-white border border-tipalti-border rounded-xl shadow-card flex divide-x divide-tipalti-border overflow-hidden">
      <AnnotationZone label="Fixed" description="Platform-provided KPI. Design, structure, and calculation are platform-owned." className="flex-1" rounded="rounded-none">
        <KpiCard
          label="Processed"
          value={`${processed}`}
          sub={`of ${total} items`}
          delta="+3 items"
          deltaPositive
          sparkPoints={[3, 5, 8, 10, 11, 13, processed]}
          sparkColor="#0065FF"
        />
      </AnnotationZone>
      <AnnotationZone label="Fixed" description="Platform-provided KPI. Design, structure, and calculation are platform-owned." className="flex-1" rounded="rounded-none">
        <KpiCard
          label="Accuracy rate"
          value={`${accuracyRate}%`}
          sub="field-weighted"
          delta="+7pp"
          deltaPositive
          sparkPoints={[58, 61, 65, 67, 64, 68, accuracyRate]}
          sparkColor="#36B37E"
        />
      </AnnotationZone>
      <AnnotationZone label="Fixed" description="Platform-provided KPI. Design, structure, and calculation are platform-owned." className="flex-1" rounded="rounded-none">
        <KpiCard
          label="Automation rate"
          value={`${automationRate}%`}
          sub="no human touch"
          delta="+3pp"
          deltaPositive
          sparkPoints={[7, 8, 9, 10, 11, 12, automationRate]}
          sparkColor="#6554C0"
        />
      </AnnotationZone>
      <AnnotationZone label="Consumer" description="Agent-defined KPI. Label, value and formula set by the agent owner." className="flex-1" rounded="rounded-none">
        <KpiCard
          label="Avg review time"
          value="13h"
          sub="24h for all"
          delta="-7.3%"
          deltaPositive
          deltaDown
          sparkPoints={[24, 22, 20, 19, 17, 15, 13]}
          sparkColor="#8777D9"
        />
      </AnnotationZone>
    </div>
  );
}
