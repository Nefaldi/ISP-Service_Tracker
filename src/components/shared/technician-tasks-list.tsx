"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { TechnicianActions } from "@/components/forms/technician-actions";
import { formatDateTime } from "@/lib/utils";
import { Search, ExternalLink, Phone, MessageSquare, Clock, CheckCircle2, AlertTriangle } from "lucide-react";

export interface TechTaskItem {
  id: string;
  ticketNumber: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  category: string;
  damagePhotoUrl?: string | null;
  resolvedPhotoUrl?: string | null;
  resolutionNotes?: string | null;
  createdAt: string | Date;
  resolvedAt?: string | Date | null;
  customer: {
    name: string;
    phone?: string | null;
  };
}

interface TechnicianTasksListProps {
  initialTasks: TechTaskItem[];
}

export function TechnicianTasksList({ initialTasks }: TechnicianTasksListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusTab, setStatusTab] = useState<"ALL" | "ASSIGNED" | "IN_PROGRESS" | "COMPLETED">("ALL");

  const counts = useMemo(() => {
    return {
      all: initialTasks.length,
      assigned: initialTasks.filter((t) => t.status === "ASSIGNED").length,
      inProgress: initialTasks.filter((t) => t.status === "IN_PROGRESS").length,
      completed: initialTasks.filter((t) => t.status === "RESOLVED" || t.status === "CLOSED").length,
    };
  }, [initialTasks]);

  const filteredTasks = useMemo(() => {
    return initialTasks.filter((task) => {
      const keyword = searchTerm.toLowerCase().trim();
      const matchKeyword =
        !keyword ||
        task.ticketNumber.toLowerCase().includes(keyword) ||
        task.title.toLowerCase().includes(keyword) ||
        task.customer.name.toLowerCase().includes(keyword) ||
        task.category.toLowerCase().includes(keyword);

      let matchStatus = true;
      if (statusTab === "ASSIGNED") matchStatus = task.status === "ASSIGNED";
      else if (statusTab === "IN_PROGRESS") matchStatus = task.status === "IN_PROGRESS";
      else if (statusTab === "COMPLETED")
        matchStatus = task.status === "RESOLVED" || task.status === "CLOSED";

      return matchKeyword && matchStatus;
    });
  }, [initialTasks, searchTerm, statusTab]);

  return (
    <div className="space-y-4">
      {/* Search & Tabs Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs">
        {/* Status Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setStatusTab("ALL")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              statusTab === "ALL"
                ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300"
            }`}
          >
            Semua ({counts.all})
          </button>
          <button
            type="button"
            onClick={() => setStatusTab("ASSIGNED")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 ${
              statusTab === "ASSIGNED"
                ? "bg-purple-600 text-white"
                : "bg-purple-50 text-purple-700 hover:bg-purple-100 dark:bg-purple-950/40 dark:text-purple-300"
            }`}
          >
            <Clock className="h-3.5 w-3.5" />
            <span>Perlu Ditangani ({counts.assigned})</span>
          </button>
          <button
            type="button"
            onClick={() => setStatusTab("IN_PROGRESS")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 ${
              statusTab === "IN_PROGRESS"
                ? "bg-amber-600 text-white"
                : "bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-950/40 dark:text-amber-300"
            }`}
          >
            <AlertTriangle className="h-3.5 w-3.5" />
            <span>Sedang Dikerjakan ({counts.inProgress})</span>
          </button>
          <button
            type="button"
            onClick={() => setStatusTab("COMPLETED")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 ${
              statusTab === "COMPLETED"
                ? "bg-emerald-600 text-white"
                : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300"
            }`}
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Selesai ({counts.completed})</span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Cari tugas atau pelanggan..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Mobile-First Task Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTasks.length === 0 ? (
          <div className="col-span-full py-12 text-center text-sm text-zinc-500 rounded-xl border border-dashed border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-900">
            Tidak ada tugas yang sesuai pada filter ini.
          </div>
        ) : (
          filteredTasks.map((task) => {
            // Clean phone number for WhatsApp
            const rawPhone = task.customer.phone || "";
            let waPhone = rawPhone.replace(/[^0-9]/g, "");
            if (waPhone.startsWith("0")) {
              waPhone = "62" + waPhone.slice(1);
            }

            return (
              <div
                key={task.id}
                className="flex flex-col justify-between p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs hover:shadow-md transition-shadow"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
                      #{task.ticketNumber}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <Badge variant="priority" value={task.priority} />
                      <Badge variant="status" value={task.status} />
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm line-clamp-1">
                      {task.title}
                    </h4>
                    <p className="text-xs text-zinc-500 line-clamp-2 mt-0.5">
                      {task.description}
                    </p>
                  </div>

                  {/* Customer Information & Quick Contact Buttons */}
                  <div className="p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-100 dark:border-zinc-800/60 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-500 font-medium">Pelanggan:</span>
                      <span className="font-bold text-zinc-800 dark:text-zinc-200 truncate max-w-[150px]">
                        {task.customer.name}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-zinc-500">Kategori:</span>
                      <span className="text-zinc-700 dark:text-zinc-300 font-medium">{task.category}</span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-zinc-500">
                      <span>Dilaporkan:</span>
                      <span>{formatDateTime(task.createdAt)}</span>
                    </div>

                    {task.customer.phone && (
                      <div className="pt-1.5 border-t border-zinc-200/60 dark:border-zinc-800 flex items-center justify-between gap-2">
                        <span className="text-zinc-500">{task.customer.phone}</span>
                        <div className="flex items-center gap-1.5">
                          <a
                            href={`https://wa.me/${waPhone}?text=Halo%20${encodeURIComponent(
                              task.customer.name
                            )},%20saya%20teknisi%20yang%20akan%20menangani%20tiket%20kendala%20%23${
                              task.ticketNumber
                            }`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-emerald-100 text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 text-[11px] font-semibold transition-colors"
                            title="Chat WhatsApp Pelanggan"
                          >
                            <MessageSquare className="h-3 w-3" />
                            <span>WA</span>
                          </a>
                          <a
                            href={`tel:${task.customer.phone}`}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-950/60 dark:text-blue-300 text-[11px] font-semibold transition-colors"
                            title="Telepon Langsung"
                          >
                            <Phone className="h-3 w-3" />
                            <span>Telp</span>
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-2 mt-3">
                  <Link
                    href={`/customer/track/${task.id}`}
                    className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium"
                  >
                    <span>Tracker</span>
                    <ExternalLink className="h-3 w-3" />
                  </Link>

                  <TechnicianActions ticketId={task.id} status={task.status} />
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="text-xs text-zinc-500 px-1">
        Menampilkan <strong>{filteredTasks.length}</strong> dari {initialTasks.length} tugas Anda
      </div>
    </div>
  );
}
