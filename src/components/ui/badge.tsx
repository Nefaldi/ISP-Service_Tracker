import React from "react";
import { cn, getPriorityBadgeClass, getStatusBadgeClass, formatTicketStatus } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "status" | "priority" | "default";
  value?: string;
}

export function Badge({
  className,
  variant = "default",
  value,
  children,
  ...props
}: BadgeProps) {
  let badgeClass = "bg-[#F1F5F9] text-[#475569] border-[#E2E8F0]";
  let displayText = children || value;

  if (variant === "status" && value) {
    badgeClass = getStatusBadgeClass(value);
    displayText = formatTicketStatus(value);
  } else if (variant === "priority" && value) {
    badgeClass = getPriorityBadgeClass(value);
  }

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-[13px] font-semibold border leading-tight",
        badgeClass,
        className
      )}
      {...props}
    >
      {displayText}
    </span>
  );
}
