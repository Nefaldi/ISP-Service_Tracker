"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, CheckCircle2, AlertTriangle } from "lucide-react";

interface SSEToast {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning";
}

export function SSEListener() {
  const router = useRouter();
  const [toasts, setToasts] = useState<SSEToast[]>([]);

  useEffect(() => {
    // Open EventSource to our route handler
    const eventSource = new EventSource("/api/sse");

    eventSource.onopen = () => {
      // Connection open
    };

    const handleEvent = (event: MessageEvent) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload.message) {
          const newToast: SSEToast = {
            id: Math.random().toString(36).substring(2, 9),
            title: event.type ? `Notifikasi: ${event.type}` : "Pembaruan Real-Time",
            message: payload.message,
            type:
              event.type === "ticket:resolved" || event.type === "ticket:closed"
                ? "success"
                : "info",
          };

          setToasts((prev) => [...prev.slice(-4), newToast]);

          // Trigger Next.js App Router RSC refresh to pull fresh data
          router.refresh();

          // Auto remove after 5 seconds
          setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
          }, 5000);
        }
      } catch (err) {
        console.error("Error parsing SSE message:", err);
      }
    };

    // Listen to custom ticket event types
    eventSource.addEventListener("ticket:created", handleEvent);
    eventSource.addEventListener("ticket:assigned", handleEvent);
    eventSource.addEventListener("ticket:status_change", handleEvent);
    eventSource.addEventListener("ticket:resolved", handleEvent);
    eventSource.addEventListener("ticket:closed", handleEvent);
    eventSource.onmessage = handleEvent;

    eventSource.onerror = () => {
      // EventSource reconnects automatically on failure
    };

    return () => {
      eventSource.close();
    };
  }, [router]);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto flex items-start gap-3 p-4 rounded-xl border border-zinc-200 bg-white shadow-lg dark:border-zinc-800 dark:bg-zinc-900 animate-in slide-in-from-bottom-2 duration-200"
        >
          {toast.type === "success" ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
          ) : toast.type === "warning" ? (
            <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
          ) : (
            <Bell className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
          )}
          <div className="flex-1">
            <h4 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
              {toast.title}
            </h4>
            <p className="text-sm text-zinc-600 dark:text-zinc-300 mt-0.5">
              {toast.message}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
