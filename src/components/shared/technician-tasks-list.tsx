"use client";

import { useState, useMemo } from "react";
import { StatusBadge } from "@/components/shared/status-badge";
import { TechnicianActions } from "@/components/forms/technician-actions";
import { formatDateTime } from "@/lib/utils";
import {
  Phone,
  MessageSquare,
  Clock,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

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
  const [filterTab, setFilterTab] = useState<"ALL" | "ASSIGNED" | "IN_PROGRESS" | "RESOLVED">("ALL");

  const counts = useMemo(() => {
    return {
      all: initialTasks.length,
      assigned: initialTasks.filter((t) => t.status === "ASSIGNED").length,
      inProgress: initialTasks.filter((t) => t.status === "IN_PROGRESS").length,
      resolved: initialTasks.filter((t) => t.status === "RESOLVED" || t.status === "CLOSED").length,
    };
  }, [initialTasks]);

  const filteredTasks = useMemo(() => {
    return initialTasks.filter((task) => {
      if (filterTab === "ASSIGNED") return task.status === "ASSIGNED";
      if (filterTab === "IN_PROGRESS") return task.status === "IN_PROGRESS";
      if (filterTab === "RESOLVED") return task.status === "RESOLVED" || task.status === "CLOSED";
      return true;
    });
  }, [initialTasks, filterTab]);

  return (
    <div className="space-y-4">
      {/* Filter Tabs (Horizontal Scrollable on Mobile) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        <button
          type="button"
          onClick={() => setFilterTab("ALL")}
          className={`h-[36px] px-3.5 rounded-[8px] text-[13px] font-semibold whitespace-nowrap transition-colors ${
            filterTab === "ALL"
              ? "bg-[#0F172A] text-white"
              : "bg-white border border-[#E2E8F0] text-[#475569] hover:bg-[#F1F5F9]"
          }`}
        >
          Semua ({counts.all})
        </button>

        <button
          type="button"
          onClick={() => setFilterTab("ASSIGNED")}
          className={`h-[36px] px-3.5 rounded-[8px] text-[13px] font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
            filterTab === "ASSIGNED"
              ? "bg-[#1D4ED8] text-white"
              : "bg-white border border-[#BFDBFE] text-[#1D4ED8] hover:bg-[#EFF6FF]"
          }`}
        >
          <Clock className="h-3.5 w-3.5" />
          <span>Ditugaskan ({counts.assigned})</span>
        </button>

        <button
          type="button"
          onClick={() => setFilterTab("IN_PROGRESS")}
          className={`h-[36px] px-3.5 rounded-[8px] text-[13px] font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
            filterTab === "IN_PROGRESS"
              ? "bg-[#5B21B6] text-white"
              : "bg-white border border-[#DDD6FE] text-[#5B21B6] hover:bg-[#EDE9FE]"
          }`}
        >
          <AlertTriangle className="h-3.5 w-3.5" />
          <span>Sedang Dikerjakan ({counts.inProgress})</span>
        </button>

        <button
          type="button"
          onClick={() => setFilterTab("RESOLVED")}
          className={`h-[36px] px-3.5 rounded-[8px] text-[13px] font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
            filterTab === "RESOLVED"
              ? "bg-[#047857] text-white"
              : "bg-white border border-[#A7F3D0] text-[#065F46] hover:bg-[#D1FAE5]"
          }`}
        >
          <CheckCircle2 className="h-3.5 w-3.5" />
          <span>Selesai ({counts.resolved})</span>
        </button>
      </div>

      {/* Task Cards List (UI_CONTEXT 4.4: mobile 390px, vertical spacing 16px) */}
      {filteredTasks.length === 0 ? (
        <div className="py-12 text-center rounded-[12px] border border-[#E2E8F0] bg-white p-6">
          <Clock className="h-8 w-8 text-[#94A3B8] mx-auto mb-2" />
          <h3 className="text-[16px] font-semibold text-[#0F172A]">
            Tidak ada tugas
          </h3>
          <p className="text-[13px] text-[#64748B] mt-1">
            Belum ada tugas lapangan pada kategori ini.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTasks.map((task) => {
            // Target SLA
            const targetHours =
              task.priority === "CRITICAL"
                ? 2
                : task.priority === "HIGH"
                ? 4
                : task.priority === "MEDIUM"
                ? 8
                : 24;

            const cleanPhone = task.customer.phone
              ? task.customer.phone.replace(/[^0-9]/g, "")
              : null;
            const waNumber = cleanPhone
              ? cleanPhone.startsWith("0")
                ? "62" + cleanPhone.slice(1)
                : cleanPhone
              : null;

            return (
              <div
                key={task.id}
                className="rounded-[12px] border border-[#E2E8F0] bg-white p-4 sm:p-5 space-y-3.5 shadow-xs"
              >
                {/* Header: Kode tiket + StatusBadge (UI_CONTEXT 4.4) */}
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-[14px] font-medium text-[#475569]">
                    #{task.ticketNumber}
                  </span>
                  <StatusBadge status={task.status} />
                </div>

                {/* Judul Masalah (16px semibold - UI_CONTEXT 4.4) */}
                <div>
                  <h2 className="text-[16px] font-semibold text-[#0F172A] leading-snug">
                    {task.title}
                  </h2>
                  <p className="text-[13px] text-[#475569] mt-1 line-clamp-2">
                    {task.description}
                  </p>
                </div>

                {/* Pelanggan & Kontak WhatsApp/Telepon */}
                <div className="pt-2 border-t border-[#E2E8F0] space-y-2">
                  <div className="flex items-center justify-between text-[13px]">
                    <span className="font-medium text-[#0F172A]">
                      {task.customer.name}
                    </span>
                    <span className="text-[#64748B] text-xs">
                      {formatDateTime(task.createdAt)}
                    </span>
                  </div>

                  {task.customer.phone && (
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      {waNumber && (
                        <a
                          href={`https://wa.me/${waNumber}?text=Halo%20${encodeURIComponent(
                            task.customer.name
                          )},%20saya%20teknisi%20Service%20Tracker%20terkait%20laporan%20%23${task.ticketNumber}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="h-[38px] rounded-[8px] bg-[#D1FAE5] hover:bg-[#A7F3D0] text-[#065F46] border border-[#A7F3D0] text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <MessageSquare className="h-3.5 w-3.5" />
                          <span>WhatsApp</span>
                        </a>
                      )}

                      <a
                        href={`tel:${task.customer.phone}`}
                        className="h-[38px] rounded-[8px] bg-[#EFF6FF] hover:bg-[#DBEAFE] text-[#1D4ED8] border border-[#BFDBFE] text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Phone className="h-3.5 w-3.5" />
                        <span>Telepon</span>
                      </a>
                    </div>
                  )}
                </div>

                {/* Kotak SLA Kecil (latar brand-50 - UI_CONTEXT 4.4) */}
                <div className="rounded-[8px] bg-[#EFF6FF] border border-[#BFDBFE] p-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-[#1D4ED8] font-medium">
                    <Clock className="h-3.5 w-3.5" />
                    <span>Target SLA: {targetHours} Jam</span>
                  </div>
                  <span className="font-semibold text-[#1E40AF]">
                    Prioritas {task.priority}
                  </span>
                </div>

                {/* Tombol Aksi Utama (UI_CONTEXT 4.4: 52px tombol aksi teknisi) */}
                <div className="pt-2">
                  <TechnicianActions ticketId={task.id} status={task.status} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
