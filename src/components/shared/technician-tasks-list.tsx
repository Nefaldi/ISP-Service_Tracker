"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { TechnicianActions } from "@/components/forms/technician-actions";
import { formatDateTime } from "@/lib/utils";
import {
  Search,
  Inbox,
  ChevronDown,
  Check,
  Wrench,
  Phone,
  MessageSquare,
  Clock,
  FileText,
  Activity,
  CheckCircle2,
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

const PROGRESS_STEPS = [
  { key: "OPEN", label: "Laporan Diterima", desc: "Menunggu verifikasi admin" },
  { key: "ASSIGNED", label: "Teknisi Ditugaskan", desc: "Ditugaskan ke Anda" },
  { key: "IN_PROGRESS", label: "Pengerjaan Lapangan", desc: "Sedang Anda tangani" },
  { key: "RESOLVED", label: "Perbaikan Selesai", desc: "Pekerjaan selesai diuji" },
  { key: "CLOSED", label: "Tiket Ditutup", desc: "Terkonfirmasi & ditutup" },
];

function getStatusIndex(status: string): number {
  switch (status) {
    case "OPEN":
      return 0;
    case "ASSIGNED":
      return 1;
    case "IN_PROGRESS":
      return 2;
    case "RESOLVED":
      return 3;
    case "CLOSED":
      return 4;
    default:
      return 0;
  }
}

export function TechnicianTasksList({
  initialTasks,
  limit,
}: TechnicianTasksListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTab, setFilterTab] = useState<"ACTIVE" | "ASSIGNED" | "IN_PROGRESS" | "RESOLVED" | "ALL">("ACTIVE");
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

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
        <div className="space-y-3.5">
          {displayedTasks.map((task) => {
            const isExpanded = !!expandedIds[task.id];
            const currentIdx = getStatusIndex(task.status);
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
                className="rounded-[12px] border border-[#E2E8F0]/60 bg-white overflow-hidden shadow-2xs hover:border-[#CBD5E1] transition-all"
              >
                {/* Main Card Header */}
                <div className="p-3.5 sm:p-4 space-y-2.5">
                  {/* Baris Atas: Kode tiket + Status + Priority di kiri, Tanggal tepat di pojok kanan atas */}
                  <div className="flex items-start sm:items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2 min-w-0">
                      <span className="font-mono text-xs font-bold text-[#1D4ED8]">
                        #{task.ticketNumber}
                      </span>
                      <StatusBadge status={task.status} />
                      <Badge variant="priority" value={task.priority} />
                      <span className="text-xs text-[#64748B] hidden sm:inline">
                        &bull; {task.category}
                      </span>
                    </div>

                    <span className="text-[12px] text-[#64748B] shrink-0 font-medium whitespace-nowrap">
                      {formatDateTime(task.createdAt)}
                    </span>
                  </div>

                  {/* Baris Utama: Judul & Deskripsi di kiri, Tombol Dropdown di kanan */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-0.5">
                    <div className="space-y-1 flex-1 min-w-0">
                      <h3 className="text-[16px] font-semibold text-[#0F172A] leading-snug">
                        {task.title}
                      </h3>

                      <p className="text-[13px] text-[#475569] line-clamp-2">
                        {task.description}
                      </p>
                    </div>

                    {/* Tombol Dropdown: Detail & Penanganan (Neutral outline, tidak biru saat dibuka) */}
                    <div className="shrink-0 self-end sm:self-center">
                      <button
                        type="button"
                        onClick={() => toggleExpand(task.id)}
                        aria-expanded={isExpanded}
                        className="h-[34px] px-3.5 rounded-[8px] text-[12px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-[#CBD5E1] bg-[#F8FAFC] hover:bg-[#F1F5F9] text-[#0F172A] shadow-2xs"
                      >
                        <span>{isExpanded ? "Tutup Penanganan" : "Detail & Penanganan"}</span>
                        <ChevronDown
                          className={`h-3.5 w-3.5 text-[#64748B] transition-transform duration-200 ${
                            isExpanded ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Baris Informasi Ringkas Bawah: Pelapor & SLA */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#F8FAFC] text-[12px]">
                    <div className="flex items-center gap-2 text-[#64748B]">
                      <span>
                        Pelapor: <strong className="text-[#0F172A]">{task.customer.name}</strong>
                      </span>
                      {task.customer.phone && (
                        <span className="hidden sm:inline">&bull; {task.customer.phone}</span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="rounded-[6px] bg-[#EFF6FF] border border-[#BFDBFE] px-2.5 py-1 text-[11px] text-[#1D4ED8] font-medium flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>SLA: {targetHours} Jam</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Dropdown Panel: Detail & Penanganan Tugas */}
                {isExpanded && (
                  <div className="border-t border-[#F1F5F9] bg-[#F8FAFC] p-4 sm:p-5 space-y-5 animate-in fade-in-50 duration-200">
                    {/* 1. Alur Progres Stepper */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[12px] font-bold text-[#0B2A6F] uppercase tracking-wider">
                          Tahapan Penanganan Gangguan
                        </span>
                        <span className="text-[11px] font-medium text-[#64748B]">
                          Tahap {currentIdx + 1} dari 5
                        </span>
                      </div>

                      {/* Responsive Step Tracker */}
                      <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 relative">
                        {PROGRESS_STEPS.map((step, idx) => {
                          const isDone = idx < currentIdx;
                          const isActive = idx === currentIdx;
                          const isUpcoming = idx > currentIdx;

                          return (
                            <div
                              key={step.key}
                              className={`p-2.5 rounded-[8px] border transition-all ${
                                isActive
                                  ? "bg-white border-[#1D4ED8] shadow-xs ring-2 ring-[#DBEAFE]"
                                  : isDone
                                  ? "bg-[#EFF6FF] border-[#BFDBFE]"
                                  : "bg-white border-[#E2E8F0] opacity-60"
                              }`}
                            >
                              <div className="flex items-center gap-2 mb-1">
                                {isDone && (
                                  <div className="h-5 w-5 rounded-full bg-[#2563EB] text-white flex items-center justify-center shrink-0">
                                    <Check className="h-3 w-3 stroke-[3]" />
                                  </div>
                                )}
                                {isActive && (
                                  <div className="h-5 w-5 rounded-full bg-[#1D4ED8] text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                                    {idx + 1}
                                  </div>
                                )}
                                {isUpcoming && (
                                  <div className="h-5 w-5 rounded-full bg-[#E2E8F0] text-[#64748B] flex items-center justify-center text-[10px] font-bold shrink-0">
                                    {idx + 1}
                                  </div>
                                )}
                                <span
                                  className={`text-[12px] font-bold truncate ${
                                    isActive
                                      ? "text-[#1D4ED8]"
                                      : isDone
                                      ? "text-[#1D4ED8]"
                                      : "text-[#64748B]"
                                  }`}
                                >
                                  {step.label}
                                </span>
                              </div>
                              <p className="text-[11px] text-[#64748B] line-clamp-1">
                                {step.desc}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* 2. Grid Informasi Detail & Aksi Lapangan */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                      {/* Kolom Kiri: Informasi Pengaduan & Pelapor */}
                      <div className="space-y-3 bg-white p-3.5 rounded-[10px] border border-[#E2E8F0]">
                        <h4 className="text-[12px] font-bold text-[#0F172A] flex items-center gap-1.5 pb-2 border-b border-[#F1F5F9]">
                          <MessageSquare className="h-3.5 w-3.5 text-[#1D4ED8]" />
                          <span>Informasi Pengaduan & Pelanggan</span>
                        </h4>

                        <div className="space-y-2.5 text-[12px]">
                          <div>
                            <span className="text-[#64748B]">Deskripsi Masalah:</span>
                            <p className="text-[#0F172A] mt-0.5 whitespace-pre-wrap">
                              {task.description}
                            </p>
                          </div>

                          <div className="pt-2 border-t border-[#F1F5F9] space-y-1.5">
                            <span className="text-[#64748B] block">Data Kontak Pelanggan:</span>
                            <div className="p-2.5 rounded-[6px] bg-[#EFF6FF] border border-[#BFDBFE] space-y-2">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-semibold text-[#1D4ED8] truncate">
                                    {task.customer.name}
                                  </p>
                                  {task.customer.phone && (
                                    <p className="text-[11px] text-[#1E40AF]">
                                      {task.customer.phone}
                                    </p>
                                  )}
                                </div>

                                <div className="flex items-center gap-1.5">
                                  {waNumber && (
                                    <a
                                      href={`https://wa.me/${waNumber}?text=Halo%20${encodeURIComponent(
                                        task.customer.name
                                      )},%20saya%20teknisi%20Service%20Tracker%20terkait%20laporan%20%23${task.ticketNumber}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="px-2.5 py-1 rounded-[6px] bg-[#2563EB] text-white text-[11px] font-semibold flex items-center gap-1 hover:bg-[#1D4ED8]"
                                    >
                                      <MessageSquare className="h-3 w-3" />
                                      <span>WhatsApp</span>
                                    </a>
                                  )}

                                  {task.customer.phone && (
                                    <a
                                      href={`tel:${task.customer.phone}`}
                                      className="px-2.5 py-1 rounded-[6px] bg-[#EFF6FF] border border-[#BFDBFE] text-[#1D4ED8] text-[11px] font-semibold flex items-center gap-1 hover:bg-[#DBEAFE]"
                                    >
                                      <Phone className="h-3 w-3" />
                                      <span>Telepon</span>
                                    </a>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>

                          {task.damagePhotoUrl && (
                            <div className="pt-2">
                              <span className="text-[#64748B] block mb-1">
                                Foto Bukti Kerusakan dari Pelanggan:
                              </span>
                              <div className="flex items-center gap-3">
                                <a
                                  href={task.damagePhotoUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-block relative w-20 h-20 rounded-[6px] overflow-hidden border border-[#CBD5E1] hover:opacity-90 shrink-0"
                                >
                                  <Image
                                    src={task.damagePhotoUrl}
                                    alt="Foto Kerusakan"
                                    fill
                                    unoptimized
                                    className="object-cover"
                                  />
                                </a>
                                <a
                                  href={task.damagePhotoUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs font-semibold text-[#1D4ED8] hover:underline"
                                >
                                  Buka Foto Lengkap
                                </a>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Kolom Kanan: Tindakan & Penanganan Teknisi */}
                      <div className="space-y-3 bg-white p-3.5 rounded-[10px] border border-[#E2E8F0]">
                        <h4 className="text-[12px] font-bold text-[#0F172A] flex items-center gap-1.5 pb-2 border-b border-[#F1F5F9]">
                          <Wrench className="h-3.5 w-3.5 text-[#2563EB]" />
                          <span>Tindakan & Penanganan Lapangan</span>
                        </h4>

                        <div className="space-y-2.5 text-[12px]">
                          {/* Instruksi Admin jika ada */}
                          {task.adminNotes && (
                            <div className="p-2.5 rounded-[6px] bg-[#EFF6FF] border border-[#BFDBFE] space-y-1">
                              <span className="font-semibold text-[#1D4ED8] flex items-center gap-1.5 text-[11px]">
                                <FileText className="h-3.5 w-3.5" />
                                <span>Instruksi Helpdesk Admin:</span>
                              </span>
                              <p className="text-[#1E40AF] pl-5 text-[12px]">
                                {task.adminNotes}
                              </p>
                            </div>
                          )}

                          {/* Catatan Penyelesaian jika tiket sudah RESOLVED / CLOSED */}
                          {(task.status === "RESOLVED" || task.status === "CLOSED") && task.resolutionNotes && (
                            <div className="p-2.5 rounded-[6px] bg-[#EFF6FF] border border-[#BFDBFE] space-y-1">
                              <span className="font-semibold text-[#1D4ED8] flex items-center gap-1.5 text-[11px]">
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                <span>Catatan Penyelesaian Anda:</span>
                              </span>
                              <p className="text-[#1E40AF] pl-5 text-[12px]">
                                {task.resolutionNotes}
                              </p>
                            </div>
                          )}

                          {/* Foto Hasil Kerja jika ada */}
                          {task.resolvedPhotoUrl && (
                            <div className="pt-1">
                              <span className="text-[#64748B] block mb-1">
                                Foto Bukti Hasil Kerja:
                              </span>
                              <div className="flex items-center gap-3">
                                <a
                                  href={task.resolvedPhotoUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-block relative w-20 h-20 rounded-[6px] overflow-hidden border border-[#CBD5E1] hover:opacity-90 shrink-0"
                                >
                                  <Image
                                    src={task.resolvedPhotoUrl}
                                    alt="Foto Hasil Kerja"
                                    fill
                                    unoptimized
                                    className="object-cover"
                                  />
                                </a>
                                <a
                                  href={task.resolvedPhotoUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs font-semibold text-[#1D4ED8] hover:underline"
                                >
                                  Buka Foto Hasil Kerja
                                </a>
                              </div>
                            </div>
                          )}

                          {/* Tombol Aksi Teknisi */}
                          <div className="pt-2">
                            <span className="text-[#64748B] block mb-1.5 font-medium">
                              Aksi Penanganan:
                            </span>
                            <TechnicianActions ticketId={task.id} status={task.status} />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 3. Action Banner Live Tracker */}
                    <div className="pt-3 border-t border-[#F1F5F9]">
                      <div className="rounded-[10px] bg-white border border-[#BFDBFE] p-3 sm:p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="h-9 w-9 rounded-full bg-[#EFF6FF] text-[#1D4ED8] flex items-center justify-center shrink-0 border border-[#DBEAFE]">
                            <Activity className="h-4 w-4" />
                          </div>
                          <div className="min-w-0">
                            <h5 className="text-[13px] font-bold text-[#0F172A] leading-snug">
                              Live Tracker & Status Real-Time
                            </h5>
                            <p className="text-[11px] text-[#64748B] truncate">
                              Lihat riwayat koordinasi, log aktivitas teknisi, dan pembaruan real-time
                            </p>
                          </div>
                        </div>

                        <Link
                          href={`/customer/track/${task.id}`}
                          className="h-[36px] px-4 rounded-[8px] bg-[#1D4ED8] hover:bg-[#1E40AF] text-white text-[12px] font-semibold flex items-center justify-center transition-colors shrink-0 shadow-xs"
                        >
                          <span>Buka Live Tracker</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
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
