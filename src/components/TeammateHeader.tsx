"use client";

import { teammate, tasks } from "@/data/mockData";
import KpiBar from "@/components/KpiBar";
import { AnnotationZone } from "@/components/AnnotationZone";

type Tab = "feed" | "instructions";

const tabs: Array<{ id: Tab; label: string }> = [
  { id: "feed", label: "Work Items" },
  { id: "instructions", label: "Instructions" },
];

const CREDIT_BUDGET = 200;

export function BudgetWidget() {
  const used = tasks.reduce((sum, t) => sum + t.credits, 0);
  const pct = used / CREDIT_BUDGET;

  const barColor =
    pct >= 0.8 ? "bg-red-500" : pct >= 0.6 ? "bg-amber-400" : "bg-tipalti-success";
  const usedColor =
    pct >= 0.8 ? "text-red-600" : pct >= 0.6 ? "text-amber-500" : "text-tipalti-text-primary";

  return (
    <div className="flex flex-col items-end gap-1 ml-auto">
      <div className="flex items-center gap-2">
        <span className={`text-[13px] font-semibold tabular-nums ${usedColor}`}>
          {used} <span className="font-normal text-tipalti-text-muted">/ {CREDIT_BUDGET} credits</span>
        </span>
        <button className="text-[12px] font-medium text-tipalti-blue hover:underline flex items-center gap-0.5">
          + Increase
        </button>
      </div>
      <div className="w-40 h-1.5 rounded-full bg-tipalti-border overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${barColor}`}
          style={{ width: `${Math.min(pct * 100, 100)}%` }}
        />
      </div>
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
      <AnnotationZone label="Fixed" description="Agent identity. Name, avatar, domain, and job are platform-owned." rounded="rounded-lg">
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
      </AnnotationZone>

      {/* KPIs */}
      <div className="my-5">
        <KpiBar />
      </div>

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
