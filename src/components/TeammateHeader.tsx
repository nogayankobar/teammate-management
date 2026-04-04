"use client";

import { useState } from "react";
import { teammate } from "@/data/mockData";

type Tab = "overview" | "execution" | "policies" | "control";

const tabs: Array<{ id: Tab; label: string }> = [
  { id: "overview", label: "Overview" },
  { id: "execution", label: "Execution Feed" },
  { id: "policies", label: "Policies & Guardrails" },
  { id: "control", label: "Control" },
];

function KpiCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="bg-white rounded-lg border border-tipalti-border px-4 py-3 shadow-card">
      <p className="text-[11px] text-tipalti-text-muted uppercase tracking-wide mb-1">{label}</p>
      <p className="text-xl font-bold text-tipalti-text-primary">{value}</p>
      {sub && <p className="text-[11px] text-tipalti-text-muted mt-0.5">{sub}</p>}
    </div>
  );
}

function StatusDot({ active }: { active: boolean }) {
  return (
    <span className="relative flex h-2.5 w-2.5">
      {active && (
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-tipalti-success opacity-75" />
      )}
      <span
        className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
          active ? "bg-tipalti-success" : "bg-tipalti-text-muted"
        }`}
      />
    </span>
  );
}

interface TeammateHeaderProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

export default function TeammateHeader({ activeTab, onTabChange }: TeammateHeaderProps) {
  const tokenPct = Math.round((teammate.tokensUsed / teammate.tokenLimit) * 100);

  return (
    <div>
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs text-tipalti-text-muted mb-4">
        <span className="hover:text-tipalti-blue cursor-pointer">AI Workforce</span>
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <path d="M3.5 2l3 3-3 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="text-tipalti-text-primary font-medium">{teammate.name}</span>
      </div>

      {/* Teammate identity */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-tipalti-blue flex items-center justify-center shadow-card">
            <span className="text-white font-bold text-sm">{teammate.avatar}</span>
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold text-tipalti-text-primary">{teammate.name}</h1>
              <div className="flex items-center gap-1.5">
                <StatusDot active={teammate.status === "active"} />
                <span className="text-xs font-medium text-tipalti-success capitalize">
                  {teammate.status}
                </span>
              </div>
            </div>
            <p className="text-xs text-tipalti-text-muted mt-0.5">
              Powered by {teammate.model} &middot; {teammate.tasksToday} tasks today
            </p>
          </div>
        </div>

        {/* Token usage */}
        <div className="bg-white border border-tipalti-border rounded-lg px-4 py-3 shadow-card min-w-[200px]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] text-tipalti-text-muted font-medium uppercase tracking-wide">
              Token usage
            </span>
            <span className="text-xs font-semibold text-tipalti-text-primary">{tokenPct}%</span>
          </div>
          <div className="w-full bg-tipalti-bg-light rounded-full h-1.5 mb-1.5">
            <div
              className={`h-1.5 rounded-full transition-all ${
                tokenPct > 80 ? "bg-tipalti-danger" : tokenPct > 60 ? "bg-tipalti-warning" : "bg-tipalti-blue"
              }`}
              style={{ width: `${tokenPct}%` }}
            />
          </div>
          <p className="text-[10px] text-tipalti-text-muted">
            {(teammate.tokensUsed / 1000).toFixed(0)}k / {(teammate.tokenLimit / 1000).toFixed(0)}k tokens
          </p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        <KpiCard label="Automation rate" value={`${teammate.automationRate}%`} sub="of invoices processed" />
        <KpiCard label="Accuracy" value={`${teammate.accuracy}%`} sub="no human correction needed" />
        <KpiCard label="Time saved" value={teammate.timeSaved} sub="this month" />
        <KpiCard label="Cost saved" value={teammate.costSaved} sub="estimated this month" />
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
