"use client";

import { Task } from "@/data/mockData";
import { StatusBadge } from "./StatusBadge";

interface TaskDetailPanelProps {
  task: Task | null;
  onClose: () => void;
  onAction: (taskId: string, action: string) => void;
}

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <path d="M12.5 4.5l-8 8M4.5 4.5l8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function StepIcon({ index, isLast }: { index: number; isLast: boolean }) {
  return (
    <div className="flex flex-col items-center">
      <div className="w-6 h-6 rounded-full bg-tipalti-blue-light border-2 border-tipalti-blue flex items-center justify-center flex-shrink-0">
        <span className="text-[10px] font-bold text-tipalti-blue">{index + 1}</span>
      </div>
      {!isLast && <div className="w-0.5 h-6 bg-tipalti-border mt-0.5" />}
    </div>
  );
}

function ActionButton({
  action,
  taskId,
  onClick,
}: {
  action: string;
  taskId: string;
  onClick: (taskId: string, action: string) => void;
}) {
  const configs: Record<string, { label: string; className: string }> = {
    approve: {
      label: "Approve",
      className: "bg-tipalti-success text-white hover:bg-green-700",
    },
    reject: {
      label: "Reject",
      className: "bg-white text-tipalti-danger border border-tipalti-danger hover:bg-red-50",
    },
    ask: {
      label: "Ask",
      className: "bg-white text-tipalti-blue border border-tipalti-blue hover:bg-tipalti-blue-light",
    },
    fix: {
      label: "Fix",
      className: "bg-white text-tipalti-text-primary border border-tipalti-border hover:bg-tipalti-bg-light",
    },
    correct: {
      label: "Correct",
      className: "bg-white text-tipalti-text-primary border border-tipalti-border hover:bg-tipalti-bg-light",
    },
    stop: {
      label: "Stop",
      className: "bg-white text-tipalti-danger border border-tipalti-danger hover:bg-red-50",
    },
  };

  const config = configs[action];
  if (!config) return null;

  return (
    <button
      onClick={() => onClick(taskId, action)}
      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${config.className}`}
    >
      {config.label}
    </button>
  );
}

export default function TaskDetailPanel({ task, onClose, onAction }: TaskDetailPanelProps) {
  if (!task) return null;

  const formatAmount = (amount: number, currency: string) =>
    `${currency} ${amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}`;

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/20 z-40"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed top-0 right-0 h-full w-[520px] bg-white z-50 shadow-side-panel flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-tipalti-border">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <StatusBadge status={task.status} />
              <StatusBadge type={task.type} />
            </div>
            <h2 className="text-base font-semibold text-tipalti-text-primary">{task.vendor}</h2>
            <p className="text-xs text-tipalti-text-secondary mt-0.5">{task.invoiceNumber}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-tipalti-bg-light text-tipalti-text-muted transition-colors"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto">
          {/* Key details */}
          <div className="px-6 py-4 grid grid-cols-3 gap-4 border-b border-tipalti-border">
            <div>
              <p className="text-[11px] text-tipalti-text-muted uppercase tracking-wide mb-1">Amount</p>
              <p className="text-sm font-semibold text-tipalti-text-primary">
                {formatAmount(task.amount, task.currency)}
              </p>
            </div>
            <div>
              <p className="text-[11px] text-tipalti-text-muted uppercase tracking-wide mb-1">Invoice date</p>
              <p className="text-sm font-medium text-tipalti-text-primary">{formatDate(task.date)}</p>
            </div>
            {task.dueDate && (
              <div>
                <p className="text-[11px] text-tipalti-text-muted uppercase tracking-wide mb-1">Due date</p>
                <p className="text-sm font-medium text-tipalti-text-primary">{formatDate(task.dueDate)}</p>
              </div>
            )}
            {task.codedTo && (
              <div className="col-span-2">
                <p className="text-[11px] text-tipalti-text-muted uppercase tracking-wide mb-1">Coded to</p>
                <p className="text-sm font-medium text-tipalti-text-primary">{task.codedTo}</p>
              </div>
            )}
            {task.assignedTo && (
              <div className="col-span-2">
                <p className="text-[11px] text-tipalti-text-muted uppercase tracking-wide mb-1">Assigned to</p>
                <p className="text-sm font-medium text-tipalti-text-primary">{task.assignedTo}</p>
              </div>
            )}
            {task.confidence && (
              <div>
                <p className="text-[11px] text-tipalti-text-muted uppercase tracking-wide mb-1">Confidence</p>
                <p className={`text-sm font-semibold ${task.confidence >= 90 ? "text-tipalti-success" : task.confidence >= 75 ? "text-tipalti-warning" : "text-tipalti-danger"}`}>
                  {task.confidence}%
                </p>
              </div>
            )}
          </div>

          {/* Issue / Summary */}
          {task.issue && (
            <div className="px-6 py-4 border-b border-tipalti-border">
              <div className="bg-tipalti-danger-bg border border-red-200 rounded-lg p-4">
                <div className="flex gap-2.5">
                  <div className="mt-0.5 flex-shrink-0">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M7 1.5L1 12.5h12L7 1.5z" stroke="#DE350B" strokeWidth="1.5" strokeLinejoin="round" />
                      <path d="M7 6v3" stroke="#DE350B" strokeWidth="1.5" strokeLinecap="round" />
                      <circle cx="7" cy="10.5" r="0.75" fill="#DE350B" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-tipalti-danger mb-1">Issue detected</p>
                    <p className="text-xs text-red-700 leading-relaxed">{task.issue}</p>
                  </div>
                </div>
              </div>
              {task.suggestedAction && (
                <div className="mt-3 bg-tipalti-info-bg border border-blue-200 rounded-lg p-4">
                  <div className="flex gap-2.5">
                    <div className="mt-0.5 flex-shrink-0">
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <circle cx="7" cy="7" r="5.5" stroke="#0065FF" strokeWidth="1.5" />
                        <path d="M7 5.5v4" stroke="#0065FF" strokeWidth="1.5" strokeLinecap="round" />
                        <circle cx="7" cy="4" r="0.75" fill="#0065FF" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-tipalti-blue mb-1">Suggested action</p>
                      <p className="text-xs text-blue-700 leading-relaxed">{task.suggestedAction}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Reasoning */}
          {task.reasoning && (
            <div className="px-6 py-4 border-b border-tipalti-border">
              <h3 className="text-xs font-semibold text-tipalti-text-secondary uppercase tracking-wide mb-3">
                Reasoning
              </h3>
              <p className="text-sm text-tipalti-text-primary leading-relaxed">{task.reasoning}</p>
            </div>
          )}

          {/* Context Used */}
          {task.contextUsed && task.contextUsed.length > 0 && (
            <div className="px-6 py-4 border-b border-tipalti-border">
              <h3 className="text-xs font-semibold text-tipalti-text-secondary uppercase tracking-wide mb-3">
                Context used
              </h3>
              <ul className="space-y-2">
                {task.contextUsed.map((ctx, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <svg className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-tipalti-blue" viewBox="0 0 14 14" fill="currentColor">
                      <path d="M7 1a6 6 0 100 12A6 6 0 007 1zM6 4h2v2H6V4zm0 3h2v4H6V7z" />
                    </svg>
                    <span className="text-xs text-tipalti-text-secondary leading-relaxed">{ctx}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Policy Triggered */}
          {task.policyTriggered && (
            <div className="px-6 py-4 border-b border-tipalti-border">
              <h3 className="text-xs font-semibold text-tipalti-text-secondary uppercase tracking-wide mb-2">
                Policy triggered
              </h3>
              <span className="inline-flex items-center gap-1.5 bg-tipalti-purple-bg text-tipalti-purple text-xs font-medium px-2.5 py-1.5 rounded-md">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                  <path d="M6 1L1 3.5v3C1 9 3.2 11.2 6 12c2.8-.8 5-3 5-5.5v-3L6 1z" />
                </svg>
                {task.policyTriggered}
              </span>
            </div>
          )}

          {/* Audit trail */}
          {task.steps && task.steps.length > 0 && (
            <div className="px-6 py-4">
              <h3 className="text-xs font-semibold text-tipalti-text-secondary uppercase tracking-wide mb-4">
                Audit trail
              </h3>
              <div className="space-y-0">
                {task.steps.map((step, i) => (
                  <div key={step.id} className="flex gap-3">
                    <StepIcon index={i} isLast={i === task.steps!.length - 1} />
                    <div className="pb-5 flex-1 min-w-0">
                      <p className="text-xs font-semibold text-tipalti-text-primary">{step.action}</p>
                      <p className="text-xs text-tipalti-text-secondary mt-0.5 leading-relaxed">{step.detail}</p>
                      {step.tool && (
                        <span className="mt-1.5 inline-block text-[10px] text-tipalti-text-muted bg-tipalti-bg-light px-1.5 py-0.5 rounded">
                          {step.tool}
                        </span>
                      )}
                      <p className="text-[10px] text-tipalti-text-muted mt-1">
                        {new Date(step.timestamp).toLocaleString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        {task.availableActions.length > 0 && (
          <div className="px-6 py-4 border-t border-tipalti-border bg-tipalti-bg-light">
            <div className="flex items-center gap-2 flex-wrap">
              {task.availableActions.map((action) => (
                <ActionButton
                  key={action}
                  action={action}
                  taskId={task.id}
                  onClick={onAction}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
