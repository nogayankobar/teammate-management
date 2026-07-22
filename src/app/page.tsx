"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { BudgetWidget } from "@/components/TeammateHeader";
import SuperagentsHubBanner from "@/components/SuperagentsHubBanner";
import SuperagentsHero from "@/components/SuperagentsHero";
import { computeKpis } from "@/components/KpiBar";
import { superagents, teammate, type Superagent } from "@/data/mockData";

// ─── Toggle switch ────────────────────────────────────────────────────────────

function ToggleSwitch({
  checked,
  disabled,
  onChange,
}: {
  checked: boolean;
  disabled?: boolean;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={onChange}
      className={`relative w-9 h-5 rounded-full transition-colors flex-shrink-0 ${
        disabled
          ? "bg-tipalti-border cursor-not-allowed"
          : checked
          ? "bg-tipalti-success"
          : "bg-tipalti-border"
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
          checked ? "translate-x-4" : "translate-x-0"
        }`}
      />
    </button>
  );
}

// ─── Superagent tile ──────────────────────────────────────────────────────────

function SuperagentTile({
  agent,
  enabled,
  onToggle,
}: {
  agent: Superagent;
  enabled: boolean;
  onToggle: () => void;
}) {
  const router = useRouter();
  const disabled = !!agent.comingSoon;
  const clickable = !disabled && !!agent.href;

  // Mock data only models one live agent today - reuse its status + KPI math for the tile.
  const live = agent.id === "ap";
  const { automationRate, processed, total } = live ? computeKpis() : { automationRate: 0, processed: 0, total: 0 };

  return (
    <div
      onClick={clickable ? () => router.push(agent.href!) : undefined}
      className={`bg-white border border-tipalti-border rounded-xl shadow-card p-5 flex flex-col gap-4 min-h-[188px] transition-colors ${
        disabled ? "opacity-60" : ""
      } ${clickable ? "cursor-pointer hover:border-tipalti-blue" : ""}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center shadow-card flex-shrink-0"
            style={{ backgroundColor: agent.avatarColor }}
          >
            <span className="text-white font-bold text-sm">{agent.avatar}</span>
          </div>
          <div className="min-w-0">
            <h3 className="text-[14px] font-bold text-tipalti-text-primary truncate">{agent.name}</h3>
            <p className="text-[12px] text-tipalti-text-muted mt-0.5 truncate">{agent.domain}</p>
          </div>
        </div>
        <div onClick={(e) => e.stopPropagation()}>
          <ToggleSwitch checked={enabled} disabled={disabled} onChange={onToggle} />
        </div>
      </div>

      {live && (
        <div className="flex items-center gap-1.5 -mt-1">
          <span
            className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
              teammate.status === "active" ? "bg-tipalti-success" : "bg-tipalti-text-muted"
            }`}
          />
          <span className="text-[11.5px] font-medium text-tipalti-text-secondary">
            {teammate.status === "active" ? "Active" : `Last active ${teammate.lastActive}`}
          </span>
        </div>
      )}

      {agent.job && <p className="text-[12px] text-tipalti-text-secondary leading-relaxed">{agent.job}</p>}

      <div className="mt-auto flex items-center justify-between gap-2">
        {agent.comingSoon && (
          <span className="inline-flex items-center w-fit px-2 py-1 rounded-full bg-tipalti-bg-light border border-tipalti-border text-[11px] font-medium text-tipalti-text-muted">
            Coming soon
          </span>
        )}
        {live && (
          <div className="flex items-baseline gap-1.5">
            <span className="text-[18px] font-bold text-tipalti-text-primary leading-none">{automationRate}%</span>
            <span className="text-[11px] text-tipalti-text-muted">
              automated · {processed}/{total} this week
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function SuperagentsOverviewPage() {
  const [enabled, setEnabled] = useState<Record<string, boolean>>({
    ap: true,
    procurement: false,
    expenses: false,
  });
  const [variant, setVariant] = useState<"current" | "new">("new");

  const toggleAgent = (id: string) => {
    setEnabled((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Show every agent in both variants; the non-AP ones render as "Coming soon".
  const visibleAgents = superagents;

  return (
    <div className="flex h-screen overflow-hidden bg-tipalti-bg-light">
      <Sidebar />

      <main className="flex-1 overflow-hidden flex flex-col">
        {/* Top bar */}
        <div className="h-12 bg-white border-b border-tipalti-border flex items-center px-6 justify-between flex-shrink-0">
          <div className="flex items-center gap-2 text-[13px] text-tipalti-text-muted">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle cx="5" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.2" />
              <circle cx="9" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.2" />
              <path d="M0.5 12c0-2 2-3.5 4.5-3.5s4.5 1.5 4.5 3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
              <path d="M8.5 9c.5-.2 1-.3 1.5-.3C12 8.7 14 10 14 12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
            <span className="font-medium">AI Workforce</span>
          </div>
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-1.5 text-tipalti-text-muted hover:text-tipalti-text-primary transition-colors">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M6 0C6.8 3.2 6.8 3.2 10 4C6.8 4.8 6.8 4.8 6 8C5.2 4.8 5.2 4.8 2 4C5.2 3.2 5.2 3.2 6 0Z" />
                <path d="M12 6C12.5 8 12.5 8 14.5 8.5C12.5 9 12.5 9 12 11C11.5 9 11.5 9 9.5 8.5C11.5 8 11.5 8 12 6Z" />
              </svg>
              <span className="text-[13px] font-medium">AI Assistant</span>
            </button>
            <button className="text-tipalti-text-muted hover:text-tipalti-text-primary transition-colors">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3">
                <circle cx="8" cy="8" r="6.5" />
                <path d="M6 6.5a2 2 0 113.5 1.5c-.5.5-1.5.8-1.5 1.5" strokeLinecap="round" />
                <circle cx="8" cy="11.5" r="0.5" fill="currentColor" stroke="none" />
              </svg>
            </button>
            <button className="text-tipalti-text-muted hover:text-tipalti-text-primary transition-colors relative">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3">
                <path d="M4 6a4 4 0 118 0v3l1.5 2H2.5L4 9V6z" />
                <path d="M6 13a2 2 0 004 0" />
              </svg>
            </button>
            <div className="h-5 w-px bg-tipalti-border" />
            <button className="text-[13px] text-tipalti-text-primary font-medium flex items-center gap-1 hover:text-tipalti-blue transition-colors">
              Payer name
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M3 4l2 2 2-2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <div className="w-7 h-7 rounded-full bg-tipalti-navy flex items-center justify-center">
              <span className="text-white text-[10px] font-semibold">M</span>
            </div>
          </div>
        </div>

        {/* Page content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-[1100px] mx-auto px-6 py-6">
            <div className="flex items-start justify-between gap-6 mb-6">
              <div>
                <h1 className="text-[22px] font-bold text-tipalti-text-primary tracking-tight">AI Agents</h1>
                <p className="text-[13px] text-tipalti-text-muted mt-1">
                  Manage and monitor your AI Agents across finance operations.
                </p>
              </div>
              <div className="flex items-center gap-3">
                {/* Prototype-only: compare the current banner+grid against the new hero concept */}
                <div className="flex items-center gap-0.5 bg-tipalti-bg-light border border-tipalti-border rounded-lg p-0.5">
                  {(["current", "new"] as const).map((v) => (
                    <button
                      key={v}
                      onClick={() => setVariant(v)}
                      className={`text-[11px] font-semibold px-2.5 py-1 rounded-md transition-colors ${
                        variant === v
                          ? "bg-white text-tipalti-text-primary shadow-card"
                          : "text-tipalti-text-muted hover:text-tipalti-text-primary"
                      }`}
                    >
                      {v === "current" ? "Current" : "New concept"}
                    </button>
                  ))}
                </div>
                <BudgetWidget />
              </div>
            </div>

            {variant === "current" ? <SuperagentsHubBanner /> : <SuperagentsHero />}

            <div className="grid grid-cols-1 sm:grid-cols-2 auto-rows-fr gap-4">
              {visibleAgents.map((agent) => (
                <SuperagentTile
                  key={agent.id}
                  agent={agent}
                  enabled={!!enabled[agent.id]}
                  onToggle={() => toggleAgent(agent.id)}
                />
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
