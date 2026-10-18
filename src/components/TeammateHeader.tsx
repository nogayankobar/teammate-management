"use client";

import { useShowOverage } from "@/lib/creditsDemoStore";
import { useRouter } from "next/navigation";
import { teammate, tasks, getBilledCredits, CREDIT_PACKAGE, CREDITS_USED_BEFORE_FEED } from "@/data/mockData";
import KpiBar from "@/components/KpiBar";

type Tab = "feed" | "instructions";

const tabs: Array<{ id: Tab; label: string }> = [
  { id: "feed", label: "Work Items" },
  { id: "instructions", label: "Instructions" },
];

// Prototype-only overage example: usage that went past the package.
const OVERAGE_EXAMPLE_USED = 103200;

// Payer-level usage of the credit package (package from SFDC), across all agents and entities.
export function BudgetWidget() {
  const showOverage = useShowOverage();
  const used = showOverage
    ? OVERAGE_EXAMPLE_USED
    : CREDITS_USED_BEFORE_FEED + tasks.reduce((sum, t) => sum + (getBilledCredits(t) ?? 0), 0);
  const overage = Math.max(used - CREDIT_PACKAGE.size, 0);
  const pct = Math.min(used / CREDIT_PACKAGE.size, 1);
  const fmt = (n: number) => n.toLocaleString("en-US");

  return (
    <div className="flex items-center gap-3 text-[13px] whitespace-nowrap">
      <span className="flex items-center gap-1 font-semibold text-tipalti-text-primary">
        Credits
        <span className="relative inline-flex group/tip cursor-help">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.2" className="text-tipalti-text-muted flex-shrink-0">
            <circle cx="6" cy="6" r="5" />
            <path d="M6 5.5v3" strokeLinecap="round" />
            <circle cx="6" cy="3.7" r="0.5" fill="currentColor" stroke="none" />
          </svg>
          <span className="pointer-events-none absolute right-0 top-full mt-1.5 w-72 whitespace-normal rounded-lg bg-tipalti-navy text-white text-[11px] font-normal leading-snug px-2.5 py-2 opacity-0 group-hover/tip:opacity-100 transition-opacity duration-150 z-[60] shadow-lg text-left">
            Credits used by all AI agents across all entities in your current package.
            {overage > 0 && " Credits used beyond your package are billed as overage."}
            <br /><br />
            See how each agent calculates credits on its activity page.
          </span>
        </span>
      </span>
      <span className="tabular-nums text-tipalti-text-primary">
        {fmt(used)}{" "}
        <span className="text-tipalti-text-muted">of {fmt(CREDIT_PACKAGE.size)} used</span>
      </span>
      <div className="w-32 h-1.5 rounded-full bg-tipalti-border overflow-hidden">
        <div
          className={`h-full rounded-full ${overage > 0 ? "bg-tipalti-warning" : "bg-tipalti-blue"}`}
          style={{ width: `${pct * 100}%` }}
        />
      </div>
    </div>
  );
}

interface TeammateHeaderProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  fresh?: boolean;
}

export default function TeammateHeader({ activeTab, onTabChange, fresh }: TeammateHeaderProps) {
  const router = useRouter();

  return (
    <div>
      <div className="flex items-center gap-3 mb-5">
        <button
          onClick={() => router.push("/")}
          aria-label="Back to AI Agents"
          title="Back to AI Agents"
          className="w-8 h-8 rounded-lg flex items-center justify-center text-tipalti-text-muted hover:text-tipalti-text-primary hover:bg-tipalti-bg-light transition-colors flex-shrink-0"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6">
            <path d="M10 3L5 8l5 5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center shadow-card flex-shrink-0"
          style={{ backgroundColor: teammate.avatarColor }}
        >
          <span className="text-white font-bold text-sm">{teammate.avatar}</span>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-tipalti-text-primary">{teammate.name}</h1>
            {fresh && (
              <span className="text-[11px] font-semibold text-tipalti-warning bg-tipalti-warning-bg px-2 py-0.5 rounded-full">
                Not yet activated
              </span>
            )}
          </div>
          <p className="text-xs text-tipalti-text-muted mt-0.5">
            {teammate.domain} &middot; {teammate.job}
          </p>
        </div>
      </div>

      {/* KPIs — only once the agent is set up and has run */}
      {!fresh && (
        <div className="my-5">
          <div className="flex justify-end mb-3">
            <BudgetWidget />
          </div>
          <KpiBar />
        </div>
      )}

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
