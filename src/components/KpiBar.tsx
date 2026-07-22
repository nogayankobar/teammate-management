"use client";

import { useState } from "react";
import { tasks, Task } from "@/data/mockData";

// ─── Categorize a work item into the platform status vocabulary ─────────────────

type Category =
  | "auto" // Auto-completed
  | "accepted_clean" // Accepted, no changes
  | "accepted_edits" // Accepted with changes
  | "awaiting" // Awaiting human review
  | "error"
  | "abandoned"
  | "skipped"
  | "in_progress";

function categorize(t: Task): Category {
  if (t.status === "in_progress") return "in_progress";
  if (t.status === "error") return "error";
  if (t.status === "abandoned") return "abandoned";
  if (t.status === "flagged" || t.status === "pending_review") return "awaiting";
  if (t.status === "auto_approved") return "auto";
  if (typeof t.userOverride === "number" && t.userOverride > 0) return "accepted_edits";
  return "accepted_clean"; // approved, no override
}

// ─── Computations (mirror the PRD calculations) ─────────────────────────────────

export function computeKpis() {
  const cats = tasks.map(categorize);
  const count = (c: Category) => cats.filter((x) => x === c).length;

  const total = tasks.length; // every item the routing saw
  const errored = count("error");
  const abandoned = count("abandoned");
  const skipped = count("skipped");
  const inProgress = count("in_progress");
  const auto = count("auto");
  const acceptedClean = count("accepted_clean");
  const acceptedEdits = count("accepted_edits");
  const reviewed = acceptedClean + acceptedEdits; // human-reviewed & accepted

  // Volume = coverage of the real whole (Skipped stays in the denominator)
  const handled = total - errored - abandoned - skipped;
  const volumeRate = total > 0 ? Math.round((handled / total) * 100) : 0;

  // Automation = auto-completed / in-scope (excludes Skipped)
  const inScope = total - skipped;
  const automationRate = inScope > 0 ? Math.round((auto / inScope) * 100) : 0;

  // Accepted without changes = accepted-clean / reviewed items
  const acceptedAsIsRate = reviewed > 0 ? Math.round((acceptedClean / reviewed) * 100) : 0;

  // Accuracy = simple average of per-item % over reviewed items (AP method = field kept-ratio)
  const accSum = tasks.reduce((sum, t) => {
    const c = categorize(t);
    if (c === "accepted_clean") return sum + 1;
    if (c === "accepted_edits") {
      const flds = t.fieldStats.total || 1;
      const changed = typeof t.userOverride === "number" ? t.userOverride : 0;
      return sum + Math.max(0, (flds - changed) / flds);
    }
    return sum;
  }, 0);
  const accuracyRate = reviewed > 0 ? Math.round((accSum / reviewed) * 100) : 0;

  const processed = total - inProgress; // kept for the agents-list card

  return {
    total,
    processed,
    handled,
    inScope,
    auto,
    reviewed,
    acceptedClean,
    acceptedEdits,
    volumeRate,
    automationRate,
    acceptedAsIsRate,
    accuracyRate,
  };
}

// ─── Info icon + hover tooltip ──────────────────────────────────────────────────

function InfoIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.2" className="text-tipalti-text-muted flex-shrink-0">
      <circle cx="6" cy="6" r="5" />
      <path d="M6 5.5v3" strokeLinecap="round" />
      <circle cx="6" cy="3.7" r="0.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

function Tooltip({ text }: { text: string }) {
  return (
    <span className="relative inline-flex group/tip cursor-help">
      <InfoIcon />
      <span className="pointer-events-none absolute left-0 bottom-full mb-1.5 w-60 rounded-lg bg-tipalti-navy text-white text-[11px] leading-snug px-2.5 py-2 opacity-0 group-hover/tip:opacity-100 transition-opacity duration-150 z-[60] shadow-lg">
        {text}
      </span>
    </span>
  );
}

// ─── Delta pill (signed % vs last week) ─────────────────────────────────────────

function DeltaPill({ pts, down }: { pts: number; down?: boolean }) {
  const positive = down ? pts < 0 : pts >= 0;
  const arrowDown = pts < 0;
  const bg = positive ? "bg-tipalti-success-bg text-tipalti-success" : "bg-tipalti-danger-bg text-tipalti-danger";
  const sign = pts >= 0 ? "+" : "−";
  return (
    <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] leading-none font-semibold whitespace-nowrap flex-shrink-0 ${bg}`}>
      <svg width="7" height="7" viewBox="0 0 11 11" fill="none" className="flex-shrink-0">
        <path
          d={arrowDown ? "M5.5 2v7M2 5.5l3.5 3.5 3.5-3.5" : "M5.5 9V2M2 5.5l3.5-3.5 3.5 3.5"}
          stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"
        />
      </svg>
      {sign}{Math.abs(pts)}%
    </span>
  );
}

// ─── Trend chart: this week (solid) vs last week (dashed), one dot per day ───────

const LAST_WK_COLOR = "#B9C0CC";

function TrendChart({
  thisWeek,
  lastWeek,
  datesThis,
  datesLast,
  color,
}: {
  thisWeek: number[];
  lastWeek: number[];
  datesThis: string[];
  datesLast: string[];
  color: string;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const H = 76;
  const padY = 12;
  const n = thisWeek.length;
  const all = [...thisWeek, ...lastWeek];
  const min = Math.min(...all);
  const max = Math.max(...all);
  const range = max - min || 1;

  const xPct = (i: number) => (i / (n - 1)) * 100;
  const yPx = (v: number) => padY + (1 - (v - min) / range) * (H - padY * 2);
  const path = (arr: number[]) => arr.map((v, i) => `${i === 0 ? "M" : "L"}${xPct(i)},${yPx(v).toFixed(1)}`).join(" ");

  const tipLeft = Math.min(74, Math.max(26, xPct(hover ?? 0)));

  return (
    <div
      className="relative"
      style={{ height: H }}
      onMouseLeave={() => setHover(null)}
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        const idx = Math.max(0, Math.min(n - 1, Math.round(((e.clientX - r.left) / r.width) * (n - 1))));
        setHover(idx);
      }}
    >
      <svg width="100%" height={H} viewBox={`0 0 100 ${H}`} preserveAspectRatio="none" className="block">
        <path d={path(lastWeek)} fill="none" stroke={LAST_WK_COLOR} strokeWidth={1.5} strokeDasharray="3 3" vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" />
        <path d={path(thisWeek)} fill="none" stroke={color} strokeWidth={1.75} vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" />
      </svg>

      {hover !== null && (
        <>
          {/* vertical guide */}
          <div className="absolute top-0 bottom-0 border-l border-dashed border-tipalti-border pointer-events-none" style={{ left: `${xPct(hover)}%` }} />
          {/* dots */}
          <div className="absolute w-1.5 h-1.5 rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none" style={{ left: `${xPct(hover)}%`, top: yPx(lastWeek[hover]), background: LAST_WK_COLOR }} />
          <div className="absolute w-2 h-2 rounded-full -translate-x-1/2 -translate-y-1/2 ring-2 ring-white pointer-events-none" style={{ left: `${xPct(hover)}%`, top: yPx(thisWeek[hover]), background: color }} />
          {/* tooltip */}
          <div
            className="absolute z-50 -translate-x-1/2 bg-white border border-tipalti-border rounded-lg shadow-lg px-2.5 py-1.5 pointer-events-none whitespace-nowrap"
            style={{ left: `${tipLeft}%`, top: 2 }}
          >
            <p className="text-[10px] text-tipalti-text-muted mb-1">{datesLast[hover]} → {datesThis[hover]}</p>
            <div className="flex items-center gap-1.5 text-[11px] leading-tight">
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
              <span className="text-tipalti-text-secondary">Last week:</span>
              <span className="font-semibold text-tipalti-text-primary">{thisWeek[hover]}%</span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] leading-tight mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: LAST_WK_COLOR }} />
              <span className="text-tipalti-text-secondary">Previous week:</span>
              <span className="font-semibold text-tipalti-text-primary">{lastWeek[hover]}%</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function Legend({ color }: { color: string }) {
  return (
    <div className="flex items-center gap-3 px-3.5 pb-3 pt-1.5">
      <span className="flex items-center gap-1.5 text-[10px] text-tipalti-text-muted">
        <span className="inline-block w-3.5 h-[2px] rounded-full" style={{ background: color }} />
        Last week
      </span>
      <span className="flex items-center gap-1.5 text-[10px] text-tipalti-text-muted">
        <span className="inline-block w-3.5 border-t border-dashed" style={{ borderColor: LAST_WK_COLOR }} />
        Previous week
      </span>
    </div>
  );
}

// build a gently rising this-week series that lands on the current value, plus a
// lower "last week" series for the comparison line
function makeSeries(value: number, pts: number) {
  const prev = value - pts;
  const thisWeek = [prev - 5, prev - 3, prev - 3, prev - 1, prev, Math.round((prev + value) / 2), value].map((x) =>
    Math.max(0, x)
  );
  const lastWeek = thisWeek.map((v, i) => Math.max(0, v - pts - (i % 2 === 0 ? 1 : 2)));
  return { thisWeek, lastWeek };
}

// ─── KPI card ─────────────────────────────────────────────────────────────────

function KpiCard({
  label,
  value,
  sub,
  pts,
  down,
  tooltip,
  datesThis,
  datesLast,
}: {
  label: string;
  value: string;
  sub?: string;
  pts: number;
  down?: boolean;
  tooltip: string;
  datesThis: string[];
  datesLast: string[];
}) {
  const color = "#4C57E3";
  const numeric = parseInt(value, 10);
  const { thisWeek, lastWeek } = makeSeries(isNaN(numeric) ? 50 : numeric, pts);

  return (
    <div className="bg-white border border-tipalti-border rounded-xl shadow-card flex flex-col">
      <div className="px-3.5 pt-3.5 flex flex-col gap-2">
        <div className="flex items-start justify-between gap-1.5">
          <div className="flex items-center gap-1 min-w-0">
            <span className="text-[11.5px] font-medium text-tipalti-text-secondary">{label}</span>
            <Tooltip text={tooltip} />
          </div>
          <div className="flex flex-col items-end gap-0.5 flex-shrink-0">
            <DeltaPill pts={pts} down={down} />
            <span className="text-[9px] text-tipalti-text-muted leading-none">vs previous week</span>
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-[24px] font-bold text-tipalti-text-primary leading-none">{value}</span>
          {sub && <span className="text-[12px] text-tipalti-text-muted leading-snug">{sub}</span>}
        </div>
      </div>
      <div className="mt-2 px-1.5">
        <TrendChart thisWeek={thisWeek} lastWeek={lastWeek} datesThis={datesThis} datesLast={datesLast} color={color} />
      </div>
      <Legend color={color} />
    </div>
  );
}

// ─── Dates (anchored to the most recent work item, so the demo stays stable) ────

function buildDates() {
  const anchorMs = tasks.reduce((m, t) => Math.max(m, new Date(t.processedAt).getTime()), 0);
  const anchor = new Date(anchorMs || Date.parse("2026-07-11T00:00:00"));
  const fmt = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const thisWeek: string[] = [];
  const lastWeek: string[] = [];
  for (let i = 0; i < 7; i++) {
    const dThis = new Date(anchor);
    dThis.setDate(anchor.getDate() - (6 - i));
    const dLast = new Date(dThis);
    dLast.setDate(dThis.getDate() - 7);
    thisWeek.push(fmt(dThis));
    lastWeek.push(fmt(dLast));
  }
  return { thisWeek, lastWeek };
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function KpiBar() {
  const k = computeKpis();
  const { thisWeek: datesThis, lastWeek: datesLast } = buildDates();

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Volume rate"
          value={`${k.volumeRate}%`}
          sub={`${k.handled} of ${k.total} items processed by the agent`}
          pts={4}
          tooltip="Share of all items the agent processed. Excluding items that are abandoned, errored or skipped."
          datesThis={datesThis}
          datesLast={datesLast}
        />
        <KpiCard
          label="Fully automated"
          value={`${k.automationRate}%`}
          sub={`${k.auto} items completed without human review`}
          pts={6}
          tooltip="Share of processed items completed automatically, with no human review needed."
          datesThis={datesThis}
          datesLast={datesLast}
        />
        <KpiCard
          label="Accepted without changes"
          value={`${k.acceptedAsIsRate}%`}
          sub={`of reviewed items were accepted with no corrections`}
          pts={3}
          tooltip="Share of reviewed items accepted with no changes at all."
          datesThis={datesThis}
          datesLast={datesLast}
        />
        <KpiCard
          label="Accuracy rate"
          value={`${k.accuracyRate}%`}
          sub={`of fields processed correctly`}
          pts={2}
          tooltip="Share of fields from all bills processed correctly by the agent and not overridden by a reviewer."
          datesThis={datesThis}
          datesLast={datesLast}
        />
      </div>
    </div>
  );
}
