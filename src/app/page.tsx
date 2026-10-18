"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { BudgetWidget } from "@/components/TeammateHeader";
import PrototypeControls, { Segmented, CreditsOverageControl } from "@/components/PrototypeControls";
import SuperagentsHubBanner from "@/components/SuperagentsHubBanner";
import SuperagentsHero from "@/components/SuperagentsHero";
import { computeKpis } from "@/components/KpiBar";
import { superagents, teammate, type Superagent } from "@/data/mockData";
import PermissionsModal from "@/components/PermissionsModal";
import {
  getDemoState,
  setDemoState,
  getOnboardingResult,
  resetOnboardingDemo,
  onOnboardingChange,
} from "@/lib/onboardingStore";

// ─── Lock icon + hover tooltip ─────────────────────────────────────────────────

function LockIcon({ className }: { className?: string }) {
  return (
    <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.3" className={className}>
      <rect x="2.5" y="5.5" width="7" height="5" rx="1" />
      <path d="M4 5.5V3.8a2 2 0 014 0V5.5" strokeLinecap="round" />
    </svg>
  );
}

function LockedTooltip({ text }: { text: string }) {
  return (
    <span className="pointer-events-none absolute left-0 top-full mt-1.5 w-56 rounded-lg bg-tipalti-navy text-white text-[11px] leading-snug px-2.5 py-2 opacity-0 group-hover/locked:opacity-100 transition-opacity duration-150 z-[60] shadow-lg">
      {text}
    </span>
  );
}

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
  fresh,
  hasResult,
  onActivate,
  locked,
}: {
  agent: Superagent;
  enabled: boolean;
  onToggle: () => void;
  fresh?: boolean;
  hasResult?: boolean;
  onActivate?: () => void;
  locked?: boolean;
}) {
  const router = useRouter();
  const disabled = !!agent.comingSoon;
  // Locked (agent permission granted, domain permission not) is not clickable either -
  // same as Not active / Coming soon. Requirement 2's "only Live opens the page" rule.
  const clickable = !disabled && !locked && !!agent.href;

  // Mock data only models one live agent today - reuse its status + KPI math for the tile.
  const live = agent.id === "ap";
  const { automationRate, processed, total } = live ? computeKpis() : { automationRate: 0, processed: 0, total: 0 };

  // In the "new activation" demo state, the AP agent starts off and is onboarded on activation.
  const freshAp = live && !!fresh;
  const needsSetup = freshAp && !hasResult;

  // Fresh AP reflects real activation: off until activated, and flipping it on begins activation.
  const checked = freshAp ? !!hasResult : enabled;
  const handleToggle = () => {
    if (needsSetup) {
      onActivate?.();
      return;
    }
    onToggle();
  };

  return (
    <div
      onClick={clickable ? () => router.push(agent.href!) : undefined}
      className={`bg-white border border-tipalti-border rounded-xl shadow-card p-5 flex flex-col gap-4 min-h-[188px] transition-colors ${
        disabled ? "opacity-60" : ""
      } ${clickable ? "cursor-pointer hover:border-tipalti-blue" : ""} ${locked ? "cursor-not-allowed" : ""}`}
    >
      {/* Locked mutes its own content via color, not opacity - opacity on this
          container would create a stacking context and trap the tooltip below,
          clipped behind the next card. */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center shadow-card flex-shrink-0"
            style={{ backgroundColor: locked ? "#97A0AF" : agent.avatarColor }}
          >
            <span className="text-white font-bold text-sm">{agent.avatar}</span>
          </div>
          <div className="min-w-0">
            <h3 className={`text-[14px] font-bold truncate ${locked ? "text-tipalti-text-muted" : "text-tipalti-text-primary"}`}>{agent.name}</h3>
            <p className="text-[12px] text-tipalti-text-muted mt-0.5 truncate">{agent.domain}</p>
          </div>
        </div>
        <div onClick={(e) => e.stopPropagation()}>
          <ToggleSwitch checked={checked} disabled={disabled || locked} onChange={handleToggle} />
        </div>
      </div>

      {live && !locked && (
        <div className="flex items-center gap-1.5 -mt-1">
          <span
            className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
              freshAp
                ? needsSetup
                  ? "bg-tipalti-warning"
                  : "bg-tipalti-success"
                : teammate.status === "active"
                ? "bg-tipalti-success"
                : "bg-tipalti-text-muted"
            }`}
          />
          <span className="text-[11.5px] font-medium text-tipalti-text-secondary">
            {freshAp
              ? needsSetup
                ? "Not yet activated"
                : "Ready · awaiting first run"
              : teammate.status === "active"
              ? "Active"
              : `Last active ${teammate.lastActive}`}
          </span>
        </div>
      )}

      {agent.job && (
        <p className={`text-[12px] leading-relaxed ${locked ? "text-tipalti-text-muted" : "text-tipalti-text-secondary"}`}>{agent.job}</p>
      )}

      <div className="mt-auto flex items-center justify-between gap-2">
        {locked && (
          <span className="relative inline-flex group/locked items-center w-fit gap-1 px-2 py-1 rounded-full bg-tipalti-bg-light border border-tipalti-border text-[11px] font-medium text-tipalti-text-muted cursor-help">
            <LockIcon className="w-2.5 h-2.5" />
            Locked
            <LockedTooltip text="You don't have permission to view this agent's data. Contact your admin." />
          </span>
        )}
        {!locked && agent.comingSoon && (
          <span className="inline-flex items-center w-fit px-2 py-1 rounded-full bg-tipalti-bg-light border border-tipalti-border text-[11px] font-medium text-tipalti-text-muted">
            Coming soon
          </span>
        )}
        {!locked && live && freshAp && needsSetup && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onActivate?.();
            }}
            className="flex items-center gap-1.5 text-[12px] font-semibold text-white bg-tipalti-blue rounded-md px-3 py-1.5 hover:bg-tipalti-navy-hover transition-colors shadow-sm"
          >
            Activate
          </button>
        )}
        {!locked && live && freshAp && !needsSetup && (
          <span className="text-[11px] text-tipalti-text-muted">Configured · no activity yet</span>
        )}
        {!locked && live && !freshAp && (
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
  const router = useRouter();
  const [permOpen, setPermOpen] = useState(false);
  // Prototype-only: demo the "Locked" card state (agent permission granted,
  // domain permission not) - Requirement 2/3 in the PRD.
  const [domainPermission, setDomainPermission] = useState<"granted" | "denied">("granted");

  // Prototype demo state — mirrors the AP page so the list reflects setup status.
  const [fresh, setFresh] = useState(false);
  const [hasResult, setHasResult] = useState(false);
  useEffect(() => {
    const refresh = () => {
      setFresh(getDemoState() === "fresh");
      setHasResult(!!getOnboardingResult());
    };
    refresh();
    return onOnboardingChange(refresh);
  }, []);

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
              <div className="flex-shrink-0">
                <h1 className="text-[22px] font-bold text-tipalti-text-primary tracking-tight whitespace-nowrap">AI Agents</h1>
                <p className="text-[13px] text-tipalti-text-muted mt-1">
                  Manage and monitor your AI Agents across finance operations.
                </p>
              </div>
            </div>

            <div className="flex justify-end mb-4">
              <BudgetWidget />
            </div>

            {/* Prototype-only demo pickers */}
            <PrototypeControls>
              <Segmented
                label="AP demo"
                value={fresh ? "fresh" : "configured"}
                options={[
                  { id: "fresh", label: "New activation" },
                  { id: "configured", label: "Already active" },
                ] as const}
                onChange={setDemoState}
              />
              {fresh && hasResult && (
                <div className="flex justify-end">
                  <button
                    onClick={resetOnboardingDemo}
                    className="text-[11px] font-medium text-tipalti-text-muted hover:text-tipalti-danger transition-colors"
                  >
                    Reset onboarding
                  </button>
                </div>
              )}
              <Segmented
                label="Domain permission"
                value={domainPermission}
                options={[
                  { id: "granted", label: "Granted" },
                  { id: "denied", label: "Denied" },
                ] as const}
                onChange={setDomainPermission}
              />
              <Segmented
                label="Hero"
                value={variant}
                options={[
                  { id: "current", label: "Current" },
                  { id: "new", label: "New concept" },
                ] as const}
                onChange={setVariant}
              />
              <CreditsOverageControl />
            </PrototypeControls>

            {variant === "current" ? <SuperagentsHubBanner /> : <SuperagentsHero />}

            <div className="grid grid-cols-1 sm:grid-cols-2 auto-rows-fr gap-4">
              {visibleAgents.map((agent) => (
                <SuperagentTile
                  key={agent.id}
                  agent={agent}
                  enabled={!!enabled[agent.id]}
                  onToggle={() => toggleAgent(agent.id)}
                  fresh={fresh}
                  hasResult={hasResult}
                  onActivate={() => setPermOpen(true)}
                  locked={agent.id === "ap" && !agent.comingSoon && domainPermission === "denied"}
                />
              ))}
            </div>
          </div>
        </div>
      </main>

      <PermissionsModal
        open={permOpen}
        onClose={() => setPermOpen(false)}
        onContinue={() => {
          setPermOpen(false);
          router.push("/agents/ap/onboarding");
        }}
      />
    </div>
  );
}
