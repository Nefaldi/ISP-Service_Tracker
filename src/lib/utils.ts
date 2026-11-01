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
      return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/40 dark:text-blue-300";
    case "ASSIGNED":
      return "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/40 dark:text-purple-300";
    case "IN_PROGRESS":
      return "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/40 dark:text-amber-300";
    case "RESOLVED":
      return "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300";
    case "CLOSED":
      return "bg-zinc-100 text-zinc-800 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
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
