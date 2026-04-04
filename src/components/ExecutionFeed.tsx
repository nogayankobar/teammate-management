"use client";

import { useState, useMemo } from "react";
import { tasks as allTasks, Task, TaskStatus } from "@/data/mockData";
import { StatusBadge, ConfidencePill } from "./StatusBadge";
import TaskDetailPanel from "./TaskDetailPanel";

// ─── Feed column config per teammate ─────────────────────────────────────────

interface ColumnConfig {
  primaryLabel: string;
  secondaryLabel: string;
  primaryField: (task: Task) => string;
  secondaryField: (task: Task) => string;
}

const columnConfigs: Record<string, ColumnConfig> = {
  "ap-specialist-01": {
    primaryLabel: "Vendor",
    secondaryLabel: "Invoice #",
    primaryField: (t) => t.vendor,
    secondaryField: (t) => t.invoiceNumber,
  },
  "expense-auditor-01": {
    primaryLabel: "Employee",
    secondaryLabel: "Expense #",
    primaryField: (t) => t.submittedBy ?? t.vendor,
    secondaryField: (t) => t.invoiceNumber,
  },
};

const defaultColumnConfig: ColumnConfig = {
  primaryLabel: "Entity",
  secondaryLabel: "Reference",
  primaryField: (t) => t.vendor,
  secondaryField: (t) => t.invoiceNumber,
};

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
    case "duplicate":
      return (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <rect x="1.5" y="1.5" width="8" height="8" rx="1" stroke="#DE350B" strokeWidth="1.3" />
          <rect x="4.5" y="4.5" width="8" height="8" rx="1" stroke="#DE350B" strokeWidth="1.3" />
        </svg>
      );
    case "policy_violation":
      return (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M7 1L1.5 3.5v3.5C1.5 10 4 12.5 7 13.5c3-1 5.5-3.5 5.5-6.5V3.5L7 1z" stroke="#FF8B00" strokeWidth="1.3" />
          <path d="M7 5v3M7 9.5v.5" stroke="#FF8B00" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
      );
    case "fraud_signal":
      return (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <circle cx="7" cy="7" r="5.5" stroke="#DE350B" strokeWidth="1.3" />
          <path d="M5 5l4 4M9 5l-4 4" stroke="#DE350B" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
      );
    case "receipt_audit":
      return (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M3 1.5h8v11l-1.5-1-1.5 1-1.5-1-1.5 1-1.5-1V1.5z" stroke="#0065FF" strokeWidth="1.3" strokeLinejoin="round" />
          <path d="M5 4.5h4M5 7h4M5 9.5h2.5" stroke="#0065FF" strokeWidth="1" strokeLinecap="round" />
        </svg>
      );
    case "spend_pattern":
      return (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M1.5 11.5l3-4 3 2 4.5-6" stroke="#5243AA" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="4.5" cy="7.5" r="1" fill="#5243AA" />
          <circle cx="7.5" cy="9.5" r="1" fill="#5243AA" />
          <circle cx="12" cy="3.5" r="1" fill="#5243AA" />
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

function TableHeader({ columns }: { columns: ColumnConfig }) {
  return (
    <div className="grid grid-cols-[2fr_1fr_1fr_1fr_0.8fr_120px] gap-4 px-4 py-2.5 bg-tipalti-bg-light border-b border-tipalti-border">
      {[columns.primaryLabel, columns.secondaryLabel, "Amount", "Date", "Confidence", "Actions"].map((col) => (
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
  columns,
  onClick,
  onAction,
}: {
  task: Task;
  columns: ColumnConfig;
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
      {/* Primary field (Vendor / Employee) */}
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="flex-shrink-0">
          <TypeIcon type={task.type} />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-tipalti-text-primary truncate group-hover:text-tipalti-blue">
            {columns.primaryField(task)}
          </p>
          <p className="text-[11px] text-tipalti-text-muted truncate mt-0.5">{task.summary}</p>
        </div>
      </div>

      {/* Secondary field (Invoice # / Expense #) */}
      <div className="flex items-center">
        <span className="text-xs text-tipalti-text-secondary font-mono truncate">{columns.secondaryField(task)}</span>
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
  columns,
  onTaskClick,
  onAction,
  defaultOpen = true,
}: {
  status: TaskStatus;
  tasks: Task[];
  columns: ColumnConfig;
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
              <TableHeader columns={columns} />
              {tasks.map((task) => (
                <TaskRow
                  key={task.id}
                  task={task}
                  columns={columns}
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

interface ExecutionFeedProps {
  teammateId?: string;
}

export default function ExecutionFeed({ teammateId }: ExecutionFeedProps) {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [search, setSearch] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const columns = teammateId
    ? columnConfigs[teammateId] ?? defaultColumnConfig
    : defaultColumnConfig;

  const teammateTasks = useMemo(() => {
    return teammateId
      ? allTasks.filter((t) => t.teammateId === teammateId)
      : allTasks;
  }, [teammateId]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return teammateTasks;
    return teammateTasks.filter(
      (t) =>
        t.vendor.toLowerCase().includes(q) ||
        t.invoiceNumber.toLowerCase().includes(q) ||
        t.summary.toLowerCase().includes(q) ||
        (t.submittedBy && t.submittedBy.toLowerCase().includes(q))
    );
  }, [search, teammateTasks]);

  const byStatus = (status: TaskStatus) => filtered.filter((t) => t.status === status);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleAction = (taskId: string, action: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const task = teammateTasks.find((t) => t.id === taskId);
    const entity = task?.submittedBy ?? task?.vendor;
    const messages: Record<string, string> = {
      approve: `Approved — ${entity} expense cleared.`,
      reject: `Rejected — ${entity} claim has been returned.`,
      ask: `Chat opened for ${entity} task.`,
      fix: `Fix mode opened for ${entity}.`,
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
          columns={columns}
          onTaskClick={setSelectedTask}
          onAction={handleAction}
          defaultOpen={true}
        />
        <TaskSection
          status="in_progress"
          tasks={byStatus("in_progress")}
          columns={columns}
          onTaskClick={setSelectedTask}
          onAction={handleAction}
          defaultOpen={true}
        />
        <TaskSection
          status="completed"
          tasks={byStatus("completed")}
          columns={columns}
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
