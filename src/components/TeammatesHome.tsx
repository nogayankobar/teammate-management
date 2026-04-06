"use client";

import { useState } from "react";
import { teammates, tasks, Teammate, Task, TeammateStatus } from "@/data/mockData";
import { StatusBadge } from "./StatusBadge";
import TaskDetailPanel from "./TaskDetailPanel";

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
    inactive: { label: "Inactive", dotClass: "bg-[#C1C7D0]", textClass: "text-[#8993A4]" },
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

        <div className="grid grid-cols-2 gap-x-4 gap-y-3">
          <div>
            <p className="text-[10px] text-tipalti-text-muted uppercase tracking-wide">Automation</p>
            <span className="text-lg font-bold text-tipalti-text-primary">{teammate.automationRate}%</span>
          </div>
          <div>
            <p className="text-[10px] text-tipalti-text-muted uppercase tracking-wide">Accuracy</p>
            <span className="text-lg font-bold text-tipalti-text-primary">{teammate.accuracy}%</span>
          </div>
          <div>
            <p className="text-[10px] text-tipalti-text-muted uppercase tracking-wide">Tasks today</p>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-bold text-tipalti-text-primary">{teammate.tasksToday}</span>
              <span className="text-[10px] text-tipalti-text-muted">/ {teammate.tasksTotal} total</span>
            </div>
          </div>
          <div>
            <p className="text-[10px] text-tipalti-text-muted uppercase tracking-wide">Time saved</p>
            <span className="text-lg font-bold text-tipalti-text-primary">{teammate.timeSaved}</span>
          </div>
        </div>
      </div>

      <div className="px-5 py-3 border-t border-tipalti-border bg-tipalti-bg-light/50 rounded-b-lg">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] text-tipalti-text-muted font-medium uppercase tracking-wide">Token usage</span>
          <span className="text-[11px] font-semibold text-tipalti-text-primary">{tokenPct}%</span>
        </div>
        <div className="w-full bg-tipalti-border/50 rounded-full h-1.5">
          <div className={`h-1.5 rounded-full transition-all ${tokenBarColor}`} style={{ width: `${tokenPct}%` }} />
        </div>
        <div className="flex items-center justify-between mt-1.5">
          <span className="text-[10px] text-tipalti-text-muted">{(teammate.tokensUsed / 1000).toFixed(0)}k / {(teammate.tokenLimit / 1000).toFixed(0)}k</span>
          <span className="text-[10px] text-tipalti-text-muted">Active {teammate.lastActive}</span>
        </div>
      </div>
    </div>
  );
}

// ─── Triage Item (cross-teammate) ────────────────────────────────────────────

function TriageItem({
  task,
  onAction,
  onClick,
}: {
  task: Task;
  onAction: (taskId: string, action: string) => void;
  onClick: () => void;
}) {
  const teammate = teammates.find((t) => t.id === task.teammateId);

  const formatAmount = (amount: number, currency: string) =>
    `${currency} ${amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}`;

  return (
    <div
      onClick={onClick}
      className="px-4 py-3.5 hover:bg-[#FAFBFF] transition-colors cursor-pointer border-b border-tipalti-border last:border-b-0 group"
    >
      {/* Top row: teammate badge + entity + amount */}
      <div className="flex items-start gap-3 mb-2">
        {/* Teammate avatar */}
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
          style={{ backgroundColor: teammate?.avatarColor ?? "#8993A4" }}
        >
          <span className="text-white text-[9px] font-bold">{teammate?.avatar}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-tipalti-text-primary truncate group-hover:text-tipalti-blue">
              {task.submittedBy ?? task.vendor}
            </p>
            <span className="text-sm font-semibold text-tipalti-text-primary flex-shrink-0 ml-2">
              {formatAmount(task.amount, task.currency)}
            </span>
          </div>
          <p className="text-[11px] text-tipalti-text-muted truncate mt-0.5">{task.summary}</p>
        </div>
      </div>

      {/* Bottom row: badges + actions */}
      <div className="flex items-center justify-between ml-10">
        <div className="flex items-center gap-1.5">
          <StatusBadge type={task.type} />
          <span className="text-[10px] text-tipalti-text-muted">{teammate?.name}</span>
        </div>
        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
          {task.availableActions.includes("approve") && (
            <button
              onClick={() => onAction(task.id, "approve")}
              className="text-[11px] font-medium px-2.5 py-1 rounded border border-tipalti-success text-tipalti-success hover:bg-tipalti-success hover:text-white transition-colors"
            >
              Approve
            </button>
          )}
          {task.availableActions.includes("reject") && (
            <button
              onClick={() => onAction(task.id, "reject")}
              className="text-[11px] font-medium px-2.5 py-1 rounded border border-tipalti-danger text-tipalti-danger hover:bg-tipalti-danger hover:text-white transition-colors"
            >
              Reject
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function TeammatesHome({ onSelectTeammate }: TeammatesHomeProps) {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const activeTeammates = teammates.filter((t) => t.status === "active").length;
  const needsAttentionTasks = tasks.filter((t) => t.status === "needs_attention");
  const totalTasksToday = teammates.reduce((sum, t) => sum + t.tasksToday, 0);

  const totalTimeSaved = teammates.reduce((sum, t) => {
    const num = parseFloat(t.timeSaved.replace(/[^0-9.]/g, ""));
    return sum + (isNaN(num) ? 0 : num);
  }, 0);

  const totalCostSaved = teammates.reduce((sum, t) => {
    const num = parseFloat(t.costSaved.replace(/[^0-9.]/g, ""));
    return sum + (isNaN(num) ? 0 : num);
  }, 0);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleTriageAction = (taskId: string, action: string) => {
    const task = tasks.find((t) => t.id === taskId);
    const entity = task?.submittedBy ?? task?.vendor;
    if (action === "approve") showToast(`Approved — ${entity} item cleared.`);
    if (action === "reject") showToast(`Rejected — ${entity} item returned.`);
  };

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
        <button className="px-4 py-2 bg-transparent text-tipalti-text-secondary text-sm font-medium rounded-md border border-tipalti-border hover:bg-tipalti-bg-light transition-colors flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 10a2 2 0 100-4 2 2 0 000 4z" stroke="#6B778C" strokeWidth="1.3" />
            <path d="M13.5 8a5.5 5.5 0 01-.08.93l1.52 1.19a.36.36 0 01.09.46l-1.44 2.49a.36.36 0 01-.44.16l-1.79-.72a5.3 5.3 0 01-1.61.93l-.27 1.9a.37.37 0 01-.36.31H6.88a.37.37 0 01-.36-.31l-.27-1.9a5.6 5.6 0 01-1.61-.93l-1.79.72a.36.36 0 01-.44-.16L1.97 10.58a.36.36 0 01.09-.46l1.52-1.19A5.6 5.6 0 013.5 8c0-.32.03-.63.08-.93L2.06 5.88a.36.36 0 01-.09-.46l1.44-2.49a.36.36 0 01.44-.16l1.79.72a5.3 5.3 0 011.61-.93l.27-1.9A.37.37 0 017.88.35h2.24c.18 0 .33.13.36.31l.27 1.9c.59.22 1.13.53 1.61.93l1.79-.72a.36.36 0 01.44.16l1.44 2.49a.36.36 0 01-.09.46l-1.52 1.19c.05.3.08.61.08.93z" stroke="#6B778C" strokeWidth="1.3" />
          </svg>
          Manage Teammates
        </button>
      </div>

      {/* Fleet KPIs */}
      <div className="grid grid-cols-5 gap-3 mb-6">
        <FleetKpi label="Active teammates" value={`${activeTeammates} / ${teammates.length}`} />
        <FleetKpi label="Needs Attention" value={`${needsAttentionTasks.length}`} sub="across all teammates" />
        <FleetKpi label="Tasks today" value={`${totalTasksToday}`} sub="across all teammates" />
        <FleetKpi label="Time saved" value={`${totalTimeSaved.toFixed(1)} hrs`} sub="this month" />
        <FleetKpi
          label="Cost saved"
          value={`$${totalCostSaved.toLocaleString()}`}
          sub="estimated this month"
        />
      </div>

      {/* Two-column layout: cards + triage */}
      <div className="grid grid-cols-[1fr_380px] gap-6">
        {/* Teammate cards */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-tipalti-text-primary">Teammates</h2>
            <span className="text-xs text-tipalti-text-muted">{teammates.length} teammates</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {teammates
              .filter((t) => t.status !== "inactive")
              .map((t) => (
                <TeammateCard key={t.id} teammate={t} onClick={() => onSelectTeammate(t.id)} />
              ))}

            {/* Inactive / not-yet-activated teammates */}
            {teammates
              .filter((t) => t.status === "inactive")
              .map((t) => (
                <div
                  key={t.id}
                  className="bg-white rounded-lg border border-tipalti-border shadow-card relative group flex flex-col overflow-hidden"
                  style={{ borderLeft: `3px solid ${t.avatarColor}` }}
                >
                  {/* Header */}
                  <div className="px-5 pt-5 pb-3">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm flex-shrink-0 opacity-70"
                          style={{ backgroundColor: t.avatarColor }}
                        >
                          <span className="text-white font-bold text-xs">{t.avatar}</span>
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-tipalti-text-primary">{t.name}</h3>
                          <p className="text-[11px] text-tipalti-text-muted">{t.domain}</p>
                        </div>
                      </div>
                      <StatusIndicator status={t.status} />
                    </div>

                    {/* Pain point highlight */}
                    {t.projectedImpact && (
                      <p className="text-xs text-tipalti-text-secondary leading-relaxed mb-4">
                        {t.projectedImpact.highlight}
                      </p>
                    )}

                    {/* Projected impact metrics */}
                    {t.projectedImpact && (
                      <div className="bg-[#F4F5F7] rounded-lg px-4 py-3 mb-3">
                        <p className="text-[10px] text-tipalti-text-muted uppercase tracking-wide font-medium mb-2">Projected Impact</p>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <span className="text-lg font-bold text-tipalti-success">{t.projectedImpact.timeSaved}</span>
                            <p className="text-[10px] text-tipalti-text-muted">time saved</p>
                          </div>
                          <div>
                            <span className="text-lg font-bold text-tipalti-success">{t.projectedImpact.costSaved}</span>
                            <p className="text-[10px] text-tipalti-text-muted">cost reduction</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Capabilities */}
                    <div className="space-y-1.5">
                      {t.capabilities.map((cap, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="flex-shrink-0">
                            <circle cx="6" cy="6" r="5" stroke={t.avatarColor} strokeWidth="1" opacity="0.5" />
                            <path d="M4 6l1.5 1.5L8 5" stroke={t.avatarColor} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          <span className="text-[11px] text-tipalti-text-secondary">{cap}</span>
                        </div>
                      ))}
                    </div>

                    {/* Social proof */}
                    {t.projectedImpact && (
                      <p className="text-[10px] text-tipalti-text-muted mt-3 italic">
                        {t.projectedImpact.adoptionRate}
                      </p>
                    )}
                  </div>

                  {/* Footer with actions */}
                  <div className="px-5 py-3 border-t border-tipalti-border bg-tipalti-bg-light/50 rounded-b-lg flex items-center justify-end gap-2 mt-auto">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                      className="px-3 py-1.5 text-tipalti-text-secondary text-[11px] font-medium rounded-md border border-tipalti-border hover:bg-white transition-colors"
                    >
                      Try Dry Run
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                      className="px-3 py-1.5 bg-tipalti-orange text-white text-[11px] font-semibold rounded-md hover:bg-tipalti-orange-hover transition-colors shadow-sm"
                    >
                      Activate
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Needs Attention — cross-teammate triage queue */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-tipalti-text-primary">Needs Attention</h2>
              {needsAttentionTasks.length > 0 && (
                <span className="bg-tipalti-danger text-white text-[10px] font-bold rounded-full px-1.5 py-0.5 leading-none">
                  {needsAttentionTasks.length}
                </span>
              )}
            </div>
            <span className="text-xs text-tipalti-text-muted">all teammates</span>
          </div>

          {/* Triage card */}
          <div className="bg-white rounded-lg border border-red-200 shadow-card overflow-hidden">
            {/* Section header */}
            <div className="bg-tipalti-danger-bg px-4 py-2.5 border-b border-red-200 flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M7 1.5L1 12.5h12L7 1.5z" stroke="#DE350B" strokeWidth="1.5" strokeLinejoin="round" />
                <path d="M7 6v3" stroke="#DE350B" strokeWidth="1.5" strokeLinecap="round" />
                <circle cx="7" cy="10.5" r="0.75" fill="#DE350B" />
              </svg>
              <span className="text-xs font-semibold text-tipalti-danger">
                {needsAttentionTasks.length} item{needsAttentionTasks.length !== 1 ? "s" : ""} require your review
              </span>
            </div>

            {/* Task list */}
            {needsAttentionTasks.length > 0 ? (
              needsAttentionTasks.map((task) => (
                <TriageItem
                  key={task.id}
                  task={task}
                  onAction={handleTriageAction}
                  onClick={() => setSelectedTask(task)}
                />
              ))
            ) : (
              <div className="px-4 py-8 text-center">
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none" className="mx-auto mb-2">
                  <circle cx="16" cy="16" r="12" stroke="#00875A" strokeWidth="2" />
                  <path d="M10 16l4 4 8-8" stroke="#00875A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <p className="text-sm font-medium text-tipalti-success">All clear</p>
                <p className="text-xs text-tipalti-text-muted mt-1">Nothing needs attention right now.</p>
              </div>
            )}
          </div>

          {/* Today's Activity */}
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

      {/* Task detail panel (for triage drill-down) */}
      <TaskDetailPanel
        task={selectedTask}
        onClose={() => setSelectedTask(null)}
        onAction={(taskId, action) => {
          handleTriageAction(taskId, action);
          setSelectedTask(null);
        }}
      />

      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] bg-tipalti-navy text-white text-sm px-5 py-3 rounded-lg shadow-panel">
          {toastMessage}
        </div>
      )}
    </div>
  );
}
