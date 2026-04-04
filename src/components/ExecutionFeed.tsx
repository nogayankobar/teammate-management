"use client";

import { useState, useMemo } from "react";
import { tasks as allTasks, Task, TaskStatus } from "@/data/mockData";
import { StatusBadge, ConfidencePill } from "./StatusBadge";
import TaskDetailPanel from "./TaskDetailPanel";

// ─── Icons ───────────────────────────────────────────────────────────────────

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
    >
      <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function FilterIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M1.5 3h11M3.5 7h7M5.5 11h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <circle cx="6" cy="6" r="4" stroke="currentColor" strokeWidth="1.5" />
      <path d="M9 9l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function TypeIcon({ type }: { type: string }) {
  switch (type) {
    case "anomaly":
      return (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M7 1.5L1 12.5h12L7 1.5z" stroke="#DE350B" strokeWidth="1.5" strokeLinejoin="round" />
          <path d="M7 6v3M7 10.5v.5" stroke="#DE350B" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    case "bookkeeping":
      return (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <rect x="2" y="1.5" width="10" height="11" rx="1" stroke="#5243AA" strokeWidth="1.5" />
          <path d="M4.5 5h5M4.5 7.5h5M4.5 10h3" stroke="#5243AA" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    case "routing":
      return (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M2 4h7l3 3-3 3H2" stroke="#5E6C84" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "validation":
      return (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <circle cx="7" cy="7" r="5" stroke="#0065FF" strokeWidth="1.5" />
          <path d="M4.5 7l2 2 3-3" stroke="#0065FF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "extraction":
      return (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <rect x="2" y="2" width="10" height="10" rx="1" stroke="#0065FF" strokeWidth="1.5" />
          <path d="M7 5v4M5 7l2 2 2-2" stroke="#0065FF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    default:
      return (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <circle cx="7" cy="7" r="5" stroke="#8993A4" strokeWidth="1.5" />
        </svg>
      );
  }
}

// ─── Action buttons ───────────────────────────────────────────────────────────

function InlineAction({
  action,
  onClick,
}: {
  action: string;
  onClick: (e: React.MouseEvent) => void;
}) {
  const configs: Record<string, { label: string; className: string }> = {
    approve: { label: "Approve", className: "text-tipalti-success border-tipalti-success hover:bg-tipalti-success hover:text-white" },
    reject: { label: "Reject", className: "text-tipalti-danger border-tipalti-danger hover:bg-tipalti-danger hover:text-white" },
    ask: { label: "Ask", className: "text-tipalti-blue border-tipalti-blue hover:bg-tipalti-blue hover:text-white" },
    fix: { label: "Fix", className: "text-tipalti-text-secondary border-tipalti-border hover:bg-tipalti-bg-light" },
    correct: { label: "Correct", className: "text-tipalti-text-secondary border-tipalti-border hover:bg-tipalti-bg-light" },
    stop: { label: "Stop", className: "text-tipalti-danger border-tipalti-danger hover:bg-tipalti-danger hover:text-white" },
  };
  const config = configs[action];
  if (!config) return null;

  return (
    <button
      onClick={onClick}
      className={`text-[11px] font-medium px-2.5 py-1 rounded border transition-colors ${config.className}`}
    >
      {config.label}
    </button>
  );
}

// ─── Table header ─────────────────────────────────────────────────────────────

function TableHeader() {
  return (
    <div className="grid grid-cols-[2fr_1fr_1fr_1fr_0.8fr_120px] gap-4 px-4 py-2.5 bg-tipalti-bg-light border-b border-tipalti-border">
      {["Vendor", "Invoice #", "Amount", "Date", "Confidence", "Actions"].map((col) => (
        <span key={col} className="text-[11px] font-semibold text-tipalti-text-muted uppercase tracking-wide">
          {col}
        </span>
      ))}
    </div>
  );
}

// ─── Task Row ─────────────────────────────────────────────────────────────────

function TaskRow({
  task,
  onClick,
  onAction,
}: {
  task: Task;
  onClick: () => void;
  onAction: (taskId: string, action: string, e: React.MouseEvent) => void;
}) {
  const formatAmount = (amount: number, currency: string) =>
    `${currency} ${amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}`;

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  return (
    <div
      onClick={onClick}
      className="grid grid-cols-[2fr_1fr_1fr_1fr_0.8fr_120px] gap-4 px-4 py-3.5 border-b border-tipalti-border hover:bg-[#FAFBFF] cursor-pointer group transition-colors"
    >
      {/* Vendor */}
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="flex-shrink-0">
          <TypeIcon type={task.type} />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-tipalti-text-primary truncate group-hover:text-tipalti-blue">
            {task.vendor}
          </p>
          <p className="text-[11px] text-tipalti-text-muted truncate mt-0.5">{task.summary}</p>
        </div>
      </div>

      {/* Invoice # */}
      <div className="flex items-center">
        <span className="text-xs text-tipalti-text-secondary font-mono truncate">{task.invoiceNumber}</span>
      </div>

      {/* Amount */}
      <div className="flex items-center">
        <span className="text-sm font-medium text-tipalti-text-primary">
          {formatAmount(task.amount, task.currency)}
        </span>
      </div>

      {/* Date */}
      <div className="flex items-center">
        <span className="text-xs text-tipalti-text-secondary">{formatDate(task.date)}</span>
      </div>

      {/* Confidence */}
      <div className="flex items-center">
        {task.confidence ? <ConfidencePill value={task.confidence} /> : <span className="text-tipalti-text-muted text-xs">—</span>}
      </div>

      {/* Actions */}
      <div
        className="flex items-center gap-1.5 flex-wrap"
        onClick={(e) => e.stopPropagation()}
      >
        {task.availableActions.slice(0, 2).map((action) => (
          <InlineAction
            key={action}
            action={action}
            onClick={(e) => onAction(task.id, action, e)}
          />
        ))}
        {task.availableActions.length > 2 && (
          <button
            onClick={(e) => { e.stopPropagation(); onClick(); }}
            className="text-[11px] text-tipalti-text-muted hover:text-tipalti-blue"
          >
            +{task.availableActions.length - 2}
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Section ─────────────────────────────────────────────────────────────────

const sectionConfig: Record<
  TaskStatus,
  {
    label: string;
    emptyText: string;
    headerClass: string;
    countClass: string;
    borderClass: string;
  }
> = {
  needs_attention: {
    label: "Needs Attention",
    emptyText: "No exceptions — everything is on track.",
    headerClass: "bg-tipalti-danger-bg border-red-200",
    countClass: "bg-tipalti-danger text-white",
    borderClass: "border-red-200",
  },
  in_progress: {
    label: "In Progress",
    emptyText: "No tasks currently running.",
    headerClass: "bg-tipalti-info-bg border-blue-200",
    countClass: "bg-tipalti-info text-white",
    borderClass: "border-blue-200",
  },
  completed: {
    label: "Completed",
    emptyText: "No completed tasks yet.",
    headerClass: "bg-tipalti-success-bg border-green-200",
    countClass: "bg-tipalti-success text-white",
    borderClass: "border-green-200",
  },
};

function TaskSection({
  status,
  tasks,
  onTaskClick,
  onAction,
  defaultOpen = true,
}: {
  status: TaskStatus;
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onAction: (taskId: string, action: string, e: React.MouseEvent) => void;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const config = sectionConfig[status];

  return (
    <div className={`rounded-lg border overflow-hidden shadow-card ${config.borderClass}`}>
      {/* Section header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center gap-3 px-4 py-3 ${config.headerClass} border-b ${config.borderClass} transition-colors`}
      >
        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${config.countClass}`}>
          {tasks.length}
        </span>
        <span className="text-sm font-semibold text-tipalti-text-primary">{config.label}</span>
        <span className="ml-auto text-tipalti-text-muted">
          <ChevronIcon open={isOpen} />
        </span>
      </button>

      {/* Content */}
      {isOpen && (
        <div className="bg-white">
          {tasks.length === 0 ? (
            <div className="px-4 py-6 text-center">
              <p className="text-sm text-tipalti-text-muted">{config.emptyText}</p>
            </div>
          ) : (
            <>
              <TableHeader />
              {tasks.map((task) => (
                <TaskRow
                  key={task.id}
                  task={task}
                  onClick={() => onTaskClick(task)}
                  onAction={onAction}
                />
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main Feed Component ──────────────────────────────────────────────────────

export default function ExecutionFeed() {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [search, setSearch] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return allTasks;
    return allTasks.filter(
      (t) =>
        t.vendor.toLowerCase().includes(q) ||
        t.invoiceNumber.toLowerCase().includes(q) ||
        t.summary.toLowerCase().includes(q)
    );
  }, [search]);

  const byStatus = (status: TaskStatus) => filtered.filter((t) => t.status === status);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleAction = (taskId: string, action: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const task = allTasks.find((t) => t.id === taskId);
    const messages: Record<string, string> = {
      approve: `Approved — ${task?.vendor} invoice sent for payment preparation.`,
      reject: `Rejected — ${task?.vendor} invoice has been rejected.`,
      ask: `Chat opened for ${task?.vendor} task.`,
      fix: `Fix mode opened for ${task?.vendor} invoice.`,
      correct: `Correction mode opened — teach the teammate.`,
      stop: `Task stopped.`,
    };
    showToast(messages[action] ?? "Action taken.");
  };

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Toolbar */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-xs">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-tipalti-text-muted">
            <SearchIcon />
          </span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tasks..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-tipalti-border rounded-md bg-white placeholder:text-tipalti-text-muted focus:outline-none focus:ring-2 focus:ring-tipalti-blue focus:border-transparent"
          />
        </div>
        <button className="flex items-center gap-2 px-3 py-2 text-sm text-tipalti-text-secondary border border-tipalti-border rounded-md bg-white hover:bg-tipalti-bg-light transition-colors">
          <FilterIcon />
          Filter
        </button>
        <div className="ml-auto text-xs text-tipalti-text-muted">
          {filtered.length} task{filtered.length !== 1 ? "s" : ""}
        </div>
      </div>

      {/* Sections */}
      <div className="space-y-4">
        <TaskSection
          status="needs_attention"
          tasks={byStatus("needs_attention")}
          onTaskClick={setSelectedTask}
          onAction={handleAction}
          defaultOpen={true}
        />
        <TaskSection
          status="in_progress"
          tasks={byStatus("in_progress")}
          onTaskClick={setSelectedTask}
          onAction={handleAction}
          defaultOpen={true}
        />
        <TaskSection
          status="completed"
          tasks={byStatus("completed")}
          onTaskClick={setSelectedTask}
          onAction={handleAction}
          defaultOpen={false}
        />
      </div>

      {/* Detail panel */}
      <TaskDetailPanel
        task={selectedTask}
        onClose={() => setSelectedTask(null)}
        onAction={(taskId, action) => {
          handleAction(taskId, action);
          setSelectedTask(null);
        }}
      />

      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-tipalti-navy text-white text-sm px-5 py-3 rounded-lg shadow-panel animate-fade-in">
          {toastMessage}
        </div>
      )}
    </div>
  );
}
