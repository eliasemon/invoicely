import { cn } from "@/lib/utils";

export type StatusType = "PAID" | "UNPAID" | "PENDING" | "DRAFT" | "PARTIAL";

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
}

export function StatusBadge({ status, className }: Readonly<StatusBadgeProps>) {
  const statusConfig = {
    PAID: "bg-success-container text-on-tertiary-container",
    UNPAID: "bg-error-container text-error",
    PENDING: "bg-warning-container text-warning",
    PARTIAL: "bg-surface-container-high text-primary",
    DRAFT: "bg-surface-container text-on-surface-variant border border-outline-variant",
  };

  return (
    <div
      className={cn(
        "inline-block font-label-caps text-[10px] px-2 py-0.5 rounded-full",
        statusConfig[status] || statusConfig.DRAFT,
        className
      )}
    >
      {status}
    </div>
  );
}
