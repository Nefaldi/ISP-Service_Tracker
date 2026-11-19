import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDateTime(date: Date | string | number | null | undefined): string {
  if (!date) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
}

export function getStatusBadgeClass(status: string): string {
  switch (status) {
    case "OPEN":
      return "bg-[#FEF3C7] text-[#92400E] border-[#FDE68A]";
    case "ASSIGNED":
      return "bg-[#DBEAFE] text-[#1D4ED8] border-[#BFDBFE]";
    case "IN_PROGRESS":
      return "bg-[#EDE9FE] text-[#5B21B6] border-[#DDD6FE]";
    case "RESOLVED":
      return "bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE]";
    case "CLOSED":
      return "bg-[#E2E8F0] text-[#334155] border-[#CBD5E1]";
    default:
      return "bg-[#F1F5F9] text-[#475569] border-[#E2E8F0]";
  }
}

export function formatTicketStatus(status: string): string {
  switch (status) {
    case "OPEN":
      return "Open";
    case "ASSIGNED":
      return "Assigned";
    case "IN_PROGRESS":
      return "In Progress";
    case "RESOLVED":
      return "Resolved";
    case "CLOSED":
      return "Closed";
    default:
      return status;
  }
}

export function getPriorityBadgeClass(priority: string): string {
  switch (priority) {
    case "CRITICAL":
      return "bg-[#FEE2E2] text-[#991B1B] border-[#FCA5A5]";
    case "HIGH":
      return "bg-[#FFEDD5] text-[#9A3412] border-[#FDBA74]";
    case "MEDIUM":
      return "bg-[#FEF9C3] text-[#854D0E] border-[#FDE047]";
    case "LOW":
      return "bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE]";
    default:
      return "bg-[#F1F5F9] text-[#475569] border-[#E2E8F0]";
  }
}

export function formatPriority(priority: string): string {
  switch (priority) {
    case "CRITICAL":
      return "Critical";
    case "HIGH":
      return "High";
    case "MEDIUM":
      return "Medium";
    case "LOW":
      return "Low";
    default:
      return priority;
  }
}
