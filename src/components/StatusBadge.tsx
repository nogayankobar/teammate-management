import { TaskStatus, TaskType } from "@/data/mockData";

interface StatusBadgeProps {
  status?: TaskStatus;
  type?: TaskType;
  label?: string;
  size?: "sm" | "md";
}

const statusConfig: Record<
  TaskStatus,
  { label: string; className: string; dot: string; icon?: React.ReactNode }
> = {
  needs_attention: {
    label: "Needs Attention",
    className: "bg-tipalti-danger-bg text-tipalti-danger",
    dot: "bg-tipalti-danger",
  },
  in_progress: {
    label: "In Progress",
    className: "bg-tipalti-info-bg text-tipalti-info",
    dot: "bg-tipalti-info",
  },
  completed: {
    label: "Completed",
    className: "bg-tipalti-success-bg text-tipalti-success",
    dot: "bg-tipalti-success",
  },
};

const typeConfig: Record<TaskType, { label: string; className: string }> = {
  bookkeeping: { label: "Bookkeeping", className: "bg-tipalti-purple-bg text-tipalti-purple" },
  validation: { label: "Validation", className: "bg-tipalti-info-bg text-tipalti-blue" },
  approval: { label: "Approval", className: "bg-tipalti-warning-bg text-tipalti-warning" },
  routing: { label: "Routing", className: "bg-gray-100 text-gray-600" },
  anomaly: { label: "Anomaly", className: "bg-tipalti-danger-bg text-tipalti-danger" },
  extraction: { label: "Extraction", className: "bg-tipalti-info-bg text-tipalti-blue" },
  duplicate: { label: "Duplicate", className: "bg-tipalti-danger-bg text-tipalti-danger" },
  policy_violation: { label: "Policy Violation", className: "bg-tipalti-warning-bg text-tipalti-warning" },
  fraud_signal: { label: "Fraud Signal", className: "bg-tipalti-danger-bg text-tipalti-danger" },
  receipt_audit: { label: "Receipt Audit", className: "bg-tipalti-info-bg text-tipalti-blue" },
  spend_pattern: { label: "Spend Pattern", className: "bg-tipalti-purple-bg text-tipalti-purple" },
};

export function StatusBadge({ status, type, label, size = "sm" }: StatusBadgeProps) {
  const sizeClass = size === "sm" ? "text-[11px] px-2 py-0.5" : "text-xs px-2.5 py-1";

  if (status) {
    const config = statusConfig[status];
    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full font-medium ${sizeClass} ${config.className}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${config.dot}`} />
        {label ?? config.label}
      </span>
    );
  }

  if (type) {
    const config = typeConfig[type];
    return (
      <span
        className={`inline-flex items-center gap-1 rounded font-medium ${sizeClass} ${config.className}`}
      >
        {label ?? config.label}
      </span>
    );
  }

  return null;
}

export function ConfidencePill({ value }: { value: number }) {
  const color =
    value >= 90
      ? "text-tipalti-success"
      : value >= 75
      ? "text-tipalti-warning"
      : "text-tipalti-danger";

  return (
    <span className={`text-xs font-medium ${color}`}>
      {value}%
    </span>
  );
}
