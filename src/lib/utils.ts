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
      return "bg-[#D1FAE5] text-[#065F46] border-[#A7F3D0]";
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
      return "bg-red-100 text-red-800 border-red-300 dark:bg-red-950 dark:text-red-300";
    case "HIGH":
      return "bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-950 dark:text-orange-300";
    case "MEDIUM":
      return "bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-950 dark:text-yellow-300";
    case "LOW":
      return "bg-green-100 text-green-800 border-green-300 dark:bg-green-950 dark:text-green-300";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
}
