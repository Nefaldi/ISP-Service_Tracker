import React from "react";
import { cn, getPriorityBadgeClass, getStatusBadgeClass } from "@/lib/utils";

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
  let badgeClass = "bg-zinc-100 text-zinc-800 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-200";

  if (variant === "status" && value) {
    badgeClass = getStatusBadgeClass(value);
  } else if (variant === "priority" && value) {
    badgeClass = getPriorityBadgeClass(value);
  }

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border",
        badgeClass,
        className
      )}
      {...props}
    >
      {children || value}
    </span>
  );
}
