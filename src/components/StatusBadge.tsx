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
  flagged: {
    label: "Flagged for review",
    className: "bg-tipalti-danger-bg text-tipalti-danger",
    dot: "bg-tipalti-danger",
  },
  pending_review: {
    label: "Pending review",
    className: "bg-gray-100 text-gray-600",
    dot: "bg-gray-400",
  },
  auto_approved: {
    label: "Auto-approved",
    className: "bg-tipalti-success-bg text-tipalti-success",
    dot: "bg-tipalti-success",
  },
  approved: {
    label: "Approved",
    className: "bg-tipalti-success-bg text-tipalti-success",
    dot: "bg-tipalti-success",
  },
  in_progress: {
    label: "In progress",
    className: "bg-gray-100 text-gray-500",
    dot: "bg-gray-400",
  },
  error: {
    label: "Error",
    className: "bg-red-50 text-red-600",
    dot: "bg-red-500",
  },
  abandoned: {
    label: "Abandoned",
    className: "bg-gray-100 text-gray-500",
    dot: "bg-gray-400",
  },
};

const typeConfig: Record<TaskType, { label: string; className: string }> = {
  bookkeeping: { label: "Bookkeeping", className: "bg-tipalti-purple-bg text-tipalti-purple" },
  validation: { label: "Validation", className: "bg-tipalti-info-bg text-tipalti-blue" },
  routing: { label: "Routing", className: "bg-gray-100 text-gray-600" },
  anomaly: { label: "Anomaly", className: "bg-tipalti-danger-bg text-tipalti-danger" },
  extraction: { label: "Extraction", className: "bg-tipalti-info-bg text-tipalti-blue" },
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
