import React from "react";
import { TicketStatus } from "@prisma/client";
import { cn, getStatusBadgeClass, formatTicketStatus } from "@/lib/utils";

interface StatusBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  status: TicketStatus | string;
}

export function StatusBadge({ status, className, ...props }: StatusBadgeProps) {
  const badgeColors = getStatusBadgeClass(status);
  const label = formatTicketStatus(status);

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-[13px] font-semibold border leading-tight",
        badgeColors,
        className
      )}
      {...props}
    >
      {label}
    </span>
  );
}
