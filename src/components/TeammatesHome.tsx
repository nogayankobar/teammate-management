"use client";

import { teammates, Teammate, TeammateStatus } from "@/data/mockData";

interface TeammatesHomeProps {
  onSelectTeammate: (id: string) => void;
}

// ─── Status indicator ─────────────────────────────────────────────────────────

function StatusIndicator({ status }: { status: TeammateStatus }) {
  const config: Record<TeammateStatus, { label: string; dotClass: string; textClass: string; ping?: boolean }> = {
    active: { label: "Active", dotClass: "bg-tipalti-success", textClass: "text-tipalti-success", ping: true },
    paused: { label: "Paused", dotClass: "bg-tipalti-text-muted", textClass: "text-tipalti-text-muted" },
    dry_run: { label: "Dry Run", dotClass: "bg-tipalti-warning", textClass: "text-tipalti-warning", ping: true },
    setup: { label: "Setup", dotClass: "bg-tipalti-info", textClass: "text-tipalti-info" },
  };
  const c = config[status];
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="relative flex h-2 w-2">
        {c.ping && (
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${c.dotClass}`} />
        )}
        <span className={`relative inline-flex rounded-full h-2 w-2 ${c.dotClass}`} />
      </span>
      <span className={`text-xs font-medium capitalize ${c.textClass}`}>{c.label}</span>
    </span>
  );
}

// ─── Fleet KPIs ───────────────────────────────────────────────────────────────

function FleetKpi({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="bg-white rounded-lg border border-tipalti-border px-5 py-4 shadow-card">
      <p className="text-[11px] text-tipalti-text-muted uppercase tracking-wide mb-1.5">{label}</p>
      <p className="text-2xl font-bold text-tipalti-text-primary">{value}</p>
      {sub && <p className="text-[11px] text-tipalti-text-muted mt-1">{sub}</p>}
    </div>
  );
}

// ─── Teammate Card ────────────────────────────────────────────────────────────

function TeammateCard({
  teammate,
  onClick,
}: {
  teammate: Teammate;
  onClick: () => void;
}) {
  const tokenPct = Math.round((teammate.tokensUsed / teammate.tokenLimit) * 100);
  const tokenBarColor =
    tokenPct > 80 ? "bg-tipalti-danger" : tokenPct > 60 ? "bg-tipalti-warning" : "bg-tipalti-blue";

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg border border-tipalti-border shadow-card hover:shadow-panel transition-all cursor-pointer group"
    >
      {/* Card header */}
      <div className="px-5 pt-5 pb-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm flex-shrink-0"
              style={{ backgroundColor: teammate.avatarColor }}
            >
              <span className="text-white font-bold text-xs">{teammate.avatar}</span>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-tipalti-text-primary group-hover:text-tipalti-blue transition-colors">
                {teammate.name}
              </h3>
              <p className="text-[11px] text-tipalti-text-muted">{teammate.domain}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {teammate.alertCount > 0 && (
              <span className="bg-tipalti-danger text-white text-[10px] font-bold rounded-full px-1.5 py-0.5 leading-none min-w-[18px] text-center">
                {teammate.alertCount}
              </span>
            )}
            <StatusIndicator status={teammate.status} />
          </div>
        </div>

        <p className="text-xs text-tipalti-text-secondary leading-relaxed line-clamp-2 mb-4">
          {teammate.description}
        </p>

        {/* KPI grid */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-3">
          <div>
            <p className="text-[10px] text-tipalti-text-muted uppercase tracking-wide">Automation</p>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-lg font-bold text-tipalti-text-primary">{teammate.automationRate}%</span>
            </div>
          </div>
          <div>
            <p className="text-[10px] text-tipalti-text-muted uppercase tracking-wide">Accuracy</p>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-lg font-bold text-tipalti-text-primary">{teammate.accuracy}%</span>
            </div>
          </div>
          <div>
            <p className="text-[10px] text-tipalti-text-muted uppercase tracking-wide">Tasks today</p>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-lg font-bold text-tipalti-text-primary">{teammate.tasksToday}</span>
              <span className="text-[10px] text-tipalti-text-muted">/ {teammate.tasksTotal} total</span>
            </div>
          </div>
          <div>
            <p className="text-[10px] text-tipalti-text-muted uppercase tracking-wide">Time saved</p>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-lg font-bold text-tipalti-text-primary">{teammate.timeSaved}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Token usage footer */}
      <div className="px-5 py-3 border-t border-tipalti-border bg-tipalti-bg-light/50 rounded-b-lg">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] text-tipalti-text-muted font-medium uppercase tracking-wide">
            Token usage
          </span>
          <span className="text-[11px] font-semibold text-tipalti-text-primary">{tokenPct}%</span>
        </div>
        <div className="w-full bg-tipalti-border/50 rounded-full h-1.5">
          <div
            className={`h-1.5 rounded-full transition-all ${tokenBarColor}`}
            style={{ width: `${tokenPct}%` }}
          />
        </div>
        <div className="flex items-center justify-between mt-1.5">
          <span className="text-[10px] text-tipalti-text-muted">
            {(teammate.tokensUsed / 1000).toFixed(0)}k / {(teammate.tokenLimit / 1000).toFixed(0)}k
          </span>
          <span className="text-[10px] text-tipalti-text-muted">
            Active {teammate.lastActive}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Recent alerts ────────────────────────────────────────────────────────────

interface Alert {
  id: string;
  teammateId: string;
  teammateName: string;
  avatarColor: string;
  avatar: string;
  message: string;
  severity: "critical" | "warning" | "info";
  time: string;
}

const recentAlerts: Alert[] = [
  {
    id: "a1",
    teammateId: "ap-specialist-01",
    teammateName: "AP Specialist",
    avatarColor: "#0052CC",
    avatar: "AP",
    message: "AWS invoice 38% above threshold — needs approval",
    severity: "critical",
    time: "12 min ago",
  },
  {
    id: "a2",
    teammateId: "expense-auditor-01",
    teammateName: "Expense Auditor",
    avatarColor: "#00875A",
    avatar: "EA",
    message: "Possible duplicate Uber receipt flagged for John M.",
    severity: "warning",
    time: "28 min ago",
  },
  {
    id: "a3",
    teammateId: "ap-specialist-01",
    teammateName: "AP Specialist",
    avatarColor: "#0052CC",
    avatar: "AP",
    message: "Unknown vendor 'Acme Software Ltd.' — no payee record",
    severity: "critical",
    time: "1 hr ago",
  },
  {
    id: "a4",
    teammateId: "ap-specialist-01",
    teammateName: "AP Specialist",
    avatarColor: "#0052CC",
    avatar: "AP",
    message: "Routing conflict on Figma invoice — two policies matched",
    severity: "warning",
    time: "2 hrs ago",
  },
];

function AlertRow({ alert, onClick }: { alert: Alert; onClick: () => void }) {
  const severityDot: Record<string, string> = {
    critical: "bg-tipalti-danger",
    warning: "bg-tipalti-warning",
    info: "bg-tipalti-info",
  };

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-tipalti-bg-light transition-colors text-left border-b border-tipalti-border last:border-b-0"
    >
      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${severityDot[alert.severity]}`} />
      <div
        className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: alert.avatarColor }}
      >
        <span className="text-white text-[9px] font-bold">{alert.avatar}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-tipalti-text-primary truncate">{alert.message}</p>
        <p className="text-[10px] text-tipalti-text-muted mt-0.5">{alert.teammateName}</p>
      </div>
      <span className="text-[10px] text-tipalti-text-muted flex-shrink-0">{alert.time}</span>
    </button>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function TeammatesHome({ onSelectTeammate }: TeammatesHomeProps) {
  const activeTeammates = teammates.filter((t) => t.status === "active").length;
  const totalAlerts = teammates.reduce((sum, t) => sum + t.alertCount, 0);
  const totalTasksToday = teammates.reduce((sum, t) => sum + t.tasksToday, 0);

  // Aggregate time saved (strip non-numeric and sum)
  const totalTimeSaved = teammates.reduce((sum, t) => {
    const num = parseFloat(t.timeSaved.replace(/[^0-9.]/g, ""));
    return sum + (isNaN(num) ? 0 : num);
  }, 0);

  // Aggregate cost saved
  const totalCostSaved = teammates.reduce((sum, t) => {
    const num = parseFloat(t.costSaved.replace(/[^0-9.]/g, ""));
    return sum + (isNaN(num) ? 0 : num);
  }, 0);

  return (
    <div>
      {/* Page header */}
      <div className="flex items-end justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-tipalti-text-primary">AI Workforce</h1>
          <p className="text-sm text-tipalti-text-secondary mt-1">
            Manage and monitor your AI teammates across finance operations.
          </p>
        </div>
        <button className="px-4 py-2 bg-tipalti-orange text-white text-sm font-medium rounded-md hover:bg-tipalti-orange-hover transition-colors shadow-sm">
          + Add Teammate
        </button>
      </div>

      {/* Fleet KPIs */}
      <div className="grid grid-cols-5 gap-3 mb-6">
        <FleetKpi label="Active teammates" value={`${activeTeammates} / ${teammates.length}`} />
        <FleetKpi label="Needs Attention" value={`${totalAlerts}`} sub="require attention" />
        <FleetKpi label="Tasks today" value={`${totalTasksToday}`} sub="across all teammates" />
        <FleetKpi label="Time saved" value={`${totalTimeSaved.toFixed(1)} hrs`} sub="this month" />
        <FleetKpi
          label="Cost saved"
          value={`$${totalCostSaved.toLocaleString()}`}
          sub="estimated this month"
        />
      </div>

      {/* Two-column layout: cards + alerts */}
      <div className="grid grid-cols-[1fr_340px] gap-6">
        {/* Teammate cards */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-tipalti-text-primary">Teammates</h2>
            <span className="text-xs text-tipalti-text-muted">{teammates.length} teammates</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {teammates.map((t) => (
              <TeammateCard
                key={t.id}
                teammate={t}
                onClick={() => onSelectTeammate(t.id)}
              />
            ))}

            {/* Add teammate placeholder card */}
            <div className="border-2 border-dashed border-tipalti-border rounded-lg flex flex-col items-center justify-center py-12 hover:border-tipalti-blue hover:bg-tipalti-blue-light/30 transition-colors cursor-pointer group min-h-[280px]">
              <div className="w-10 h-10 rounded-xl bg-tipalti-bg-light group-hover:bg-tipalti-blue-light flex items-center justify-center mb-3 transition-colors">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M9 3v12M3 9h12" stroke="#8993A4" strokeWidth="2" strokeLinecap="round" className="group-hover:stroke-tipalti-blue" />
                </svg>
              </div>
              <p className="text-sm font-medium text-tipalti-text-muted group-hover:text-tipalti-blue transition-colors">
                Add Teammate
              </p>
              <p className="text-xs text-tipalti-text-muted mt-1">Coming soon</p>
            </div>
          </div>
        </div>

        {/* Recent alerts panel */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-tipalti-text-primary">Needs Attention</h2>
            <span className="text-xs text-tipalti-text-muted">{recentAlerts.length} items</span>
          </div>
          <div className="bg-white rounded-lg border border-tipalti-border shadow-card">
            {recentAlerts.map((alert) => (
              <AlertRow
                key={alert.id}
                alert={alert}
                onClick={() => onSelectTeammate(alert.teammateId)}
              />
            ))}
            {recentAlerts.length === 0 && (
              <div className="px-4 py-8 text-center">
                <p className="text-sm text-tipalti-text-muted">Nothing needs attention — everything running smoothly.</p>
              </div>
            )}
          </div>

          {/* Quick activity summary */}
          <div className="mt-4 bg-white rounded-lg border border-tipalti-border shadow-card px-5 py-4">
            <h3 className="text-xs font-semibold text-tipalti-text-secondary uppercase tracking-wide mb-3">
              Today&apos;s Activity
            </h3>
            <div className="space-y-3">
              {teammates
                .filter((t) => t.status === "active")
                .map((t) => (
                  <div key={t.id} className="flex items-center gap-3">
                    <div
                      className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: t.avatarColor }}
                    >
                      <span className="text-white text-[9px] font-bold">{t.avatar}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-tipalti-text-primary">{t.name}</span>
                        <span className="text-xs font-semibold text-tipalti-text-primary">{t.tasksToday}</span>
                      </div>
                      <div className="w-full bg-tipalti-border/50 rounded-full h-1 mt-1.5">
                        <div
                          className="h-1 rounded-full transition-all"
                          style={{
                            width: `${Math.min((t.tasksToday / 30) * 100, 100)}%`,
                            backgroundColor: t.avatarColor,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
