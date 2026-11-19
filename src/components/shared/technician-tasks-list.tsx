"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { TechnicianActions } from "@/components/forms/technician-actions";
import { formatDateTime } from "@/lib/utils";
import {
  Phone,
  MessageSquare,
  Clock,
  CheckCircle2,
  ImageIcon,
  FileText,
  Search,
  ExternalLink,
  Inbox,
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
  adminNotes?: string | null;
  createdAt: string | Date;
  resolvedAt?: string | Date | null;
  customer: {
    name: string;
    phone?: string | null;
  };
}

interface TechnicianTasksListProps {
  initialTasks: TechTaskItem[];
  limit?: number;
}

export function TechnicianTasksList({
  initialTasks,
  limit,
}: TechnicianTasksListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTab, setFilterTab] = useState<"ACTIVE" | "ASSIGNED" | "IN_PROGRESS" | "RESOLVED" | "ALL">("ACTIVE");

  const filteredTasks = useMemo(() => {
    return initialTasks.filter((task) => {
      const keyword = searchTerm.toLowerCase().trim();
      const matchKeyword =
        !keyword ||
        task.ticketNumber.toLowerCase().includes(keyword) ||
        task.title.toLowerCase().includes(keyword) ||
        task.customer.name.toLowerCase().includes(keyword) ||
        task.category.toLowerCase().includes(keyword);

      let matchTab = true;
      if (filterTab === "ACTIVE") matchTab = task.status === "ASSIGNED" || task.status === "IN_PROGRESS";
      else if (filterTab === "ASSIGNED") matchTab = task.status === "ASSIGNED";
      else if (filterTab === "IN_PROGRESS") matchTab = task.status === "IN_PROGRESS";
      else if (filterTab === "RESOLVED") matchTab = task.status === "RESOLVED" || task.status === "CLOSED";

      return matchKeyword && matchTab;
    });
  }, [initialTasks, searchTerm, filterTab]);

  // Display only the latest `limit` tasks on overview dashboard
  const displayedTasks = useMemo(() => {
    return limit ? filteredTasks.slice(0, limit) : filteredTasks;
  }, [filteredTasks, limit]);

  // Clean empty state matching reference UI
  if (initialTasks.length === 0) {
    return (
      <div className="py-20 sm:py-24 flex flex-col items-center justify-center text-center">
        <div className="h-14 w-14 rounded-full bg-[#F1F5F9] text-[#94A3B8] flex items-center justify-center mb-3">
          <Inbox className="h-6 w-6 stroke-[1.75]" />
        </div>
        <p className="text-[14px] text-[#64748B]">
          Belum ada tugas lapangan yang ditugaskan.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search and Tabs Toolbar (Consistent with Customer Tickets List) */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-3 border-b border-[#F1F5F9]">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            type="button"
            onClick={() => setFilterTab("ACTIVE")}
            className={`h-[36px] px-3.5 rounded-[8px] text-[13px] font-semibold whitespace-nowrap transition-colors flex items-center justify-center cursor-pointer ${
              filterTab === "ACTIVE"
                ? "bg-[#1D4ED8] text-white shadow-2xs"
                : "bg-[#F1F5F9] text-[#475569] hover:bg-[#E2E8F0] hover:text-[#0F172A]"
            }`}
          >
            Sedang Berjalan
          </button>

          <button
            type="button"
            onClick={() => setFilterTab("ASSIGNED")}
            className={`h-[36px] px-3.5 rounded-[8px] text-[13px] font-semibold whitespace-nowrap transition-colors flex items-center justify-center cursor-pointer ${
              filterTab === "ASSIGNED"
                ? "bg-[#1D4ED8] text-white shadow-2xs"
                : "bg-[#F1F5F9] text-[#475569] hover:bg-[#E2E8F0] hover:text-[#0F172A]"
            }`}
          >
            Ditugaskan
          </button>

          <button
            type="button"
            onClick={() => setFilterTab("IN_PROGRESS")}
            className={`h-[36px] px-3.5 rounded-[8px] text-[13px] font-semibold whitespace-nowrap transition-colors flex items-center justify-center cursor-pointer ${
              filterTab === "IN_PROGRESS"
                ? "bg-[#1D4ED8] text-white shadow-2xs"
                : "bg-[#F1F5F9] text-[#475569] hover:bg-[#E2E8F0] hover:text-[#0F172A]"
            }`}
          >
            Dikerjakan
          </button>

          <button
            type="button"
            onClick={() => setFilterTab("RESOLVED")}
            className={`h-[36px] px-3.5 rounded-[8px] text-[13px] font-semibold whitespace-nowrap transition-colors flex items-center justify-center cursor-pointer ${
              filterTab === "RESOLVED"
                ? "bg-[#1D4ED8] text-white shadow-2xs"
                : "bg-[#F1F5F9] text-[#475569] hover:bg-[#E2E8F0] hover:text-[#0F172A]"
            }`}
          >
            Riwayat Selesai
          </button>

          <button
            type="button"
            onClick={() => setFilterTab("ALL")}
            className={`h-[36px] px-3.5 rounded-[8px] text-[13px] font-semibold whitespace-nowrap transition-colors flex items-center justify-center cursor-pointer ${
              filterTab === "ALL"
                ? "bg-[#1D4ED8] text-white shadow-2xs"
                : "bg-[#F1F5F9] text-[#475569] hover:bg-[#E2E8F0] hover:text-[#0F172A]"
            }`}
          >
            Semua
          </button>
        </div>

        <div className="relative w-full sm:w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#64748B]" />
          <input
            type="text"
            aria-label="Cari tugas lapangan"
            placeholder="Cari tiket atau pelanggan..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-[36px] pl-9 pr-3 rounded-[8px] border border-[#CBD5E1] bg-white text-[13px] text-[#0F172A] placeholder:text-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]"
          />
        </div>
      </div>

      {/* Task Cards List */}
      {displayedTasks.length === 0 ? (
        <div className="py-12 flex flex-col items-center justify-center text-center">
          <div className="h-12 w-12 rounded-full bg-[#F1F5F9] text-[#94A3B8] flex items-center justify-center mb-2">
            <Inbox className="h-5 w-5 stroke-[1.75]" />
          </div>
          <p className="text-[14px] text-[#64748B]">
            Tidak ada tugas yang sesuai kriteria pencarian.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {displayedTasks.map((task) => {
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
                className="rounded-[12px] border border-[#E2E8F0]/60 bg-white p-3.5 sm:p-4 space-y-3 shadow-2xs hover:border-[#1D4ED8] transition-all"
              >
                {/* Header: Kode tiket + StatusBadge + Priority + Link */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#1D4ED8]">
                      #{task.ticketNumber}
                    </span>
                    <StatusBadge status={task.status} />
                    <Badge variant="priority" value={task.priority} />
                    <span className="text-xs text-[#64748B] hidden sm:inline">
                      &bull; {task.category}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#64748B]">
                      {formatDateTime(task.createdAt)}
                    </span>
                    <Link
                      href={`/customer/track/${task.id}`}
                      className="text-xs font-semibold text-[#1D4ED8] hover:underline inline-flex items-center gap-0.5"
                      title="Lihat Halaman Live Tracker"
                    >
                      <span>Detail</span>
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  </div>
                </div>

                {/* Judul & Deskripsi Masalah */}
                <div>
                  <h2 className="text-[16px] font-semibold text-[#0F172A] leading-snug">
                    {task.title}
                  </h2>
                  <p className="text-[14px] text-[#475569] mt-1 whitespace-pre-line">
                    {task.description}
                  </p>
                </div>

                {/* Instruksi Admin jika ada */}
                {task.adminNotes && (
                  <div className="p-3.5 rounded-[8px] bg-[#EFF6FF] border border-[#BFDBFE] text-xs space-y-1">
                    <span className="font-semibold text-[#1D4ED8] flex items-center gap-1.5">
                      <FileText className="h-4 w-4" />
                      <span>Instruksi Helpdesk Admin:</span>
                    </span>
                    <p className="text-[#0F172A] font-medium pl-5 text-[13px]">{task.adminNotes}</p>
                  </div>
                )}

                {/* Foto Kerusakan dari Pelanggan jika ada */}
                {task.damagePhotoUrl && (
                  <div className="p-3 rounded-[8px] bg-[#F8FAFC] border border-[#E2E8F0] space-y-2">
                    <span className="text-xs font-semibold text-[#475569] flex items-center gap-1.5">
                      <ImageIcon className="h-4 w-4 text-[#1D4ED8]" />
                      <span>Foto Bukti Kerusakan dari Pelanggan:</span>
                    </span>
                    <div className="flex items-center gap-3">
                      <div className="h-16 w-24 rounded-[6px] overflow-hidden border border-[#CBD5E1] bg-[#F1F5F9] shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={task.damagePhotoUrl}
                          alt="Foto Kerusakan"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <a
                        href={task.damagePhotoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-semibold text-[#1D4ED8] hover:underline"
                      >
                        Buka Foto Lengkap &rarr;
                      </a>
                    </div>
                  </div>
                )}

                {/* Catatan Penyelesaian jika tiket sudah RESOLVED / CLOSED */}
                {(task.status === "RESOLVED" || task.status === "CLOSED") && task.resolutionNotes && (
                  <div className="p-3 rounded-[8px] bg-[#EFF6FF] border border-[#BFDBFE] text-xs space-y-1">
                    <span className="font-semibold text-[#1D4ED8] flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Catatan Penyelesaian Anda:</span>
                    </span>
                    <p className="text-[#0F172A] pl-5 text-[13px]">{task.resolutionNotes}</p>
                  </div>
                )}

                {/* Informasi Pelanggan & Kontak WhatsApp/Telepon */}
                <div className="pt-3 border-t border-[#E2E8F0] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="block text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
                      Pelanggan Pelapor
                    </span>
                    <span className="font-semibold text-[14px] text-[#0F172A]">
                      {task.customer.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {waNumber && (
                      <a
                        href={`https://wa.me/${waNumber}?text=Halo%20${encodeURIComponent(
                          task.customer.name
                        )},%20saya%20teknisi%20Service%20Tracker%20terkait%20laporan%20%23${task.ticketNumber}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="h-[36px] px-3.5 rounded-[8px] bg-[#EFF6FF] hover:bg-[#DBEAFE] text-[#1D4ED8] border border-[#BFDBFE] text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <MessageSquare className="h-3.5 w-3.5" />
                        <span>WhatsApp</span>
                      </a>
                    )}

                    {task.customer.phone && (
                      <a
                        href={`tel:${task.customer.phone}`}
                        className="h-[36px] px-3.5 rounded-[8px] bg-[#EFF6FF] hover:bg-[#DBEAFE] text-[#1D4ED8] border border-[#BFDBFE] text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Phone className="h-3.5 w-3.5" />
                        <span>Telepon</span>
                      </a>
                    )}

                    <div className="rounded-[8px] bg-[#EFF6FF] border border-[#BFDBFE] px-3 py-1.5 text-xs text-[#1D4ED8] font-medium hidden md:inline-flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      <span>SLA: {targetHours} Jam</span>
                    </div>
                  </div>
                </div>

                {/* Tombol Aksi Teknisi */}
                <div className="pt-2">
                  <TechnicianActions ticketId={task.id} status={task.status} />
                </div>
              </div>
            );
          })}

          {/* Footer note when more tasks exist */}
          {limit && filteredTasks.length > limit && (
            <div className="pt-2 text-center border-t border-[#F1F5F9]">
              <p className="text-[12px] text-[#64748B]">
                Menampilkan {limit} tugas terakhir dari total {filteredTasks.length} tugas.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
