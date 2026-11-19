"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import {
  AssignTechnicianDialog,
  TechnicianOption,
} from "@/components/forms/assign-technician-dialog";
import { formatDateTime } from "@/lib/utils";
import {
  Search,
  Inbox,
  ChevronDown,
  Check,
  Wrench,
  Clock,
  ExternalLink,
  MessageSquare,
  Star,
} from "lucide-react";

export interface AdminTicketItem {
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
  closedAt?: string | Date | null;
  customer: {
    id?: string;
    name: string;
    email?: string;
    phone?: string | null;
  };
  technicianId?: string | null;
  technician?: {
    id?: string;
    name: string;
    email?: string;
    phone?: string | null;
  } | null;
  feedback?: {
    rating: number;
    comment?: string | null;
  } | null;
}

interface AdminTicketsListProps {
  initialTickets: AdminTicketItem[];
  technicians: TechnicianOption[];
  limit?: number;
}

const PROGRESS_STEPS = [
  { key: "OPEN", label: "Laporan Diterima", desc: "Menunggu penugasan teknisi" },
  { key: "ASSIGNED", label: "Teknisi Ditugaskan", desc: "Teknisi telah ditunjuk" },
  { key: "IN_PROGRESS", label: "Pengerjaan Lapangan", desc: "Teknisi menangani gangguan" },
  { key: "RESOLVED", label: "Perbaikan Selesai", desc: "Pekerjaan selesai diuji" },
  { key: "CLOSED", label: "Tiket Ditutup", desc: "Terkonfirmasi & selesai" },
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

export function AdminTicketsList({
  initialTickets,
  technicians,
  limit = 3,
}: AdminTicketsListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [tab, setTab] = useState<"ACTIVE" | "UNASSIGNED" | "RESOLVED" | "ALL">("ACTIVE");
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const filteredTickets = useMemo(() => {
    return initialTickets.filter((ticket) => {
      const keyword = searchTerm.toLowerCase().trim();
      const matchKeyword =
        !keyword ||
        ticket.ticketNumber.toLowerCase().includes(keyword) ||
        ticket.title.toLowerCase().includes(keyword) ||
        ticket.customer.name.toLowerCase().includes(keyword) ||
        ticket.category.toLowerCase().includes(keyword) ||
        (ticket.technician?.name && ticket.technician.name.toLowerCase().includes(keyword));

      let matchTab = true;
      if (tab === "ACTIVE") {
        matchTab = ticket.status === "OPEN" || ticket.status === "ASSIGNED" || ticket.status === "IN_PROGRESS";
      } else if (tab === "UNASSIGNED") {
        matchTab = ticket.status === "OPEN";
      } else if (tab === "RESOLVED") {
        matchTab = ticket.status === "RESOLVED" || ticket.status === "CLOSED";
      }

      return matchKeyword && matchTab;
    });
  }, [initialTickets, searchTerm, tab]);

  const displayedTickets = useMemo(() => {
    return limit ? filteredTickets.slice(0, limit) : filteredTickets;
  }, [filteredTickets, limit]);

  // Clean empty state jika belum ada tiket sama sekali
  if (initialTickets.length === 0) {
    return (
      <div className="py-20 sm:py-24 flex flex-col items-center justify-center text-center">
        <div className="h-14 w-14 rounded-full bg-[#F1F5F9] text-[#94A3B8] flex items-center justify-center mb-3">
          <Inbox className="h-6 w-6 stroke-[1.75]" />
        </div>
        <p className="text-[14px] text-[#64748B]">
          Belum ada tiket laporan yang masuk.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search and Tabs Filter - Model Persis Seperti Container Customer */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-3 border-b border-[#F1F5F9]">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            type="button"
            onClick={() => setTab("ACTIVE")}
            className={`h-[36px] px-3.5 rounded-[8px] text-[13px] font-semibold whitespace-nowrap transition-colors flex items-center justify-center cursor-pointer ${
              tab === "ACTIVE"
                ? "bg-[#1D4ED8] text-white shadow-2xs"
                : "bg-[#F1F5F9] text-[#475569] hover:bg-[#E2E8F0] hover:text-[#0F172A]"
            }`}
          >
            Sedang Berjalan
          </button>
          <button
            type="button"
            onClick={() => setTab("UNASSIGNED")}
            className={`h-[36px] px-3.5 rounded-[8px] text-[13px] font-semibold whitespace-nowrap transition-colors flex items-center justify-center cursor-pointer ${
              tab === "UNASSIGNED"
                ? "bg-[#1D4ED8] text-white shadow-2xs"
                : "bg-[#F1F5F9] text-[#475569] hover:bg-[#E2E8F0] hover:text-[#0F172A]"
            }`}
          >
            Perlu Ditugaskan
          </button>
          <button
            type="button"
            onClick={() => setTab("RESOLVED")}
            className={`h-[36px] px-3.5 rounded-[8px] text-[13px] font-semibold whitespace-nowrap transition-colors flex items-center justify-center cursor-pointer ${
              tab === "RESOLVED"
                ? "bg-[#1D4ED8] text-white shadow-2xs"
                : "bg-[#F1F5F9] text-[#475569] hover:bg-[#E2E8F0] hover:text-[#0F172A]"
            }`}
          >
            Riwayat Selesai
          </button>
          <button
            type="button"
            onClick={() => setTab("ALL")}
            className={`h-[36px] px-3.5 rounded-[8px] text-[13px] font-semibold whitespace-nowrap transition-colors flex items-center justify-center cursor-pointer ${
              tab === "ALL"
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
            aria-label="Cari tiket admin"
            placeholder="Cari nomor, judul, atau nama..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-[36px] pl-9 pr-3 rounded-[8px] border border-[#CBD5E1] bg-white text-[13px] text-[#0F172A] placeholder:text-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]"
          />
        </div>
      </div>

      {/* List of Tickets */}
      {displayedTickets.length === 0 ? (
        <div className="py-12 flex flex-col items-center justify-center text-center">
          <div className="h-12 w-12 rounded-full bg-[#F1F5F9] text-[#94A3B8] flex items-center justify-center mb-2">
            <Inbox className="h-5 w-5 stroke-[1.75]" />
          </div>
          <p className="text-[14px] text-[#64748B]">
            Tidak ada tiket yang sesuai pencarian atau filter.
          </p>
        </div>
      ) : (
        <div className="space-y-3.5">
          {displayedTickets.map((ticket) => {
            const isExpanded = !!expandedIds[ticket.id];
            const currentIdx = getStatusIndex(ticket.status);
            const targetHours =
              ticket.priority === "CRITICAL"
                ? 2
                : ticket.priority === "HIGH"
                ? 4
                : ticket.priority === "MEDIUM"
                ? 8
                : 24;

            return (
              <div
                key={ticket.id}
                className="rounded-[12px] border border-[#E2E8F0]/60 bg-white overflow-hidden shadow-2xs hover:border-[#CBD5E1] transition-all"
              >
                {/* Main Card Header */}
                <div className="p-3.5 sm:p-4 space-y-2.5">
                  {/* Baris Atas: Kode tiket + Status + Priority di kiri, Tanggal tepat di pojok kanan atas */}
                  <div className="flex items-start sm:items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2 min-w-0">
                      <span className="font-mono text-xs font-bold text-[#1D4ED8]">
                        #{ticket.ticketNumber}
                      </span>
                      <StatusBadge status={ticket.status} />
                      <Badge variant="priority" value={ticket.priority} />
                      <span className="text-xs text-[#64748B] hidden sm:inline">
                        &bull; {ticket.category}
                      </span>
                    </div>

                    <span className="text-[12px] text-[#64748B] shrink-0 font-medium whitespace-nowrap">
                      {formatDateTime(ticket.createdAt)}
                    </span>
                  </div>

                  {/* Baris Utama: Judul & Deskripsi di kiri, Tombol Dropdown di kanan */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-0.5">
                    <div className="space-y-1 flex-1 min-w-0">
                      <h3 className="text-[16px] font-semibold text-[#0F172A] leading-snug">
                        {ticket.title}
                      </h3>

                      <p className="text-[13px] text-[#475569] line-clamp-2">
                        {ticket.description}
                      </p>
                    </div>

                    {/* Tombol Dropdown: Detail & Penugasan */}
                    <div className="shrink-0 self-end sm:self-center">
                      <button
                        type="button"
                        onClick={() => toggleExpand(ticket.id)}
                        aria-expanded={isExpanded}
                        className="h-[34px] px-3.5 rounded-[8px] text-[12px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-[#CBD5E1] bg-[#F8FAFC] hover:bg-[#F1F5F9] text-[#0F172A] shadow-2xs"
                      >
                        <span>{isExpanded ? "Tutup Progres" : "Detail & Penugasan"}</span>
                        <ChevronDown
                          className={`h-3.5 w-3.5 text-[#64748B] transition-transform duration-200 ${
                            isExpanded ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Baris Informasi Ringkas Bawah: Pelapor, Teknisi & SLA */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#F8FAFC] text-[12px]">
                    <div className="flex items-center gap-4 text-[#64748B]">
                      <span>
                        Pelapor: <strong className="text-[#0F172A]">{ticket.customer.name}</strong>
                      </span>
                      <span>
                        Teknisi:{" "}
                        {ticket.technician ? (
                          <strong className="text-[#1D4ED8]">{ticket.technician.name}</strong>
                        ) : (
                          <span className="text-[#DC2626] font-semibold bg-[#FEF2F2] px-2 py-0.5 rounded-[4px] border border-[#FECACA] text-[11px]">
                            Belum ditugaskan
                          </span>
                        )}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="rounded-[6px] bg-[#EFF6FF] border border-[#BFDBFE] px-2.5 py-1 text-[11px] text-[#1D4ED8] font-medium flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>SLA: {targetHours} Jam</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Dropdown Panel: Detail & Progres Laporan - Model Persis Seperti Container Customer */}
                {isExpanded && (
                  <div className="border-t border-[#F1F5F9] bg-[#F8FAFC] p-4 sm:p-5 space-y-5 animate-in fade-in-50 duration-200">
                    {/* 1. Alur Progres Stepper 5 Tahap */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[12px] font-bold text-[#0B2A6F] uppercase tracking-wider">
                          Tahapan Penanganan Gangguan
                        </span>
                        <span className="text-[11px] font-medium text-[#64748B]">
                          Tahap {currentIdx + 1} dari 5
                        </span>
                      </div>

                      {/* Responsive Step Tracker Kotak Modern */}
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

                    {/* 2. Grid Informasi Detail Laporan & Pelaksana */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                      {/* Kolom Kiri: Detail Informasi Pengaduan */}
                      <div className="space-y-3 bg-white p-3.5 rounded-[10px] border border-[#E2E8F0]">
                        <h4 className="text-[12px] font-bold text-[#0F172A] flex items-center gap-1.5 pb-2 border-b border-[#F1F5F9]">
                          <MessageSquare className="h-3.5 w-3.5 text-[#1D4ED8]" />
                          <span>Informasi Pengaduan</span>
                        </h4>

                        <div className="space-y-2 text-[12px]">
                          <div>
                            <span className="text-[#64748B]">Deskripsi Masalah:</span>
                            <p className="text-[#0F172A] mt-0.5 whitespace-pre-wrap leading-relaxed">
                              {ticket.description}
                            </p>
                          </div>

                          <div className="flex justify-between pt-1 border-t border-[#F8FAFC]">
                            <span className="text-[#64748B]">Pelapor:</span>
                            <span className="font-semibold text-[#0F172A]">
                              {ticket.customer.name} ({ticket.customer.email})
                            </span>
                          </div>

                          <div className="flex justify-between">
                            <span className="text-[#64748B]">Waktu Dibuat:</span>
                            <span className="font-medium text-[#0F172A]">
                              {formatDateTime(ticket.createdAt)}
                            </span>
                          </div>

                          {ticket.damagePhotoUrl && (
                            <div className="pt-2 border-t border-[#F8FAFC]">
                              <span className="text-[#64748B] block mb-1">
                                Foto Bukti Kerusakan:
                              </span>
                              <a
                                href={ticket.damagePhotoUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-block relative w-20 h-20 rounded-[6px] overflow-hidden border border-[#CBD5E1] hover:opacity-90"
                              >
                                <Image
                                  src={ticket.damagePhotoUrl}
                                  alt="Bukti kerusakan"
                                  fill
                                  className="object-cover"
                                />
                              </a>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Kolom Kanan: Pelaksana & Penyelesaian Teknisi (Fitur Role Admin) */}
                      <div className="space-y-3 bg-white p-3.5 rounded-[10px] border border-[#E2E8F0]">
                        <h4 className="text-[12px] font-bold text-[#0F172A] flex items-center gap-1.5 pb-2 border-b border-[#F1F5F9]">
                          <Wrench className="h-3.5 w-3.5 text-[#2563EB]" />
                          <span>Pelaksana & Hasil Kerja</span>
                        </h4>

                        <div className="space-y-2.5 text-[12px]">
                          {ticket.technician ? (
                            <div>
                              <span className="text-[#64748B]">Teknisi Penanggung Jawab:</span>
                              <div className="mt-0.5 font-semibold text-[#0F172A] flex items-center justify-between">
                                <span>{ticket.technician.name}</span>
                                <span className="text-[11px] text-[#64748B] font-normal">
                                  {ticket.technician.phone || ticket.technician.email}
                                </span>
                              </div>
                            </div>
                          ) : (
                            <div className="p-2.5 rounded-[6px] bg-[#FEF2F2] border border-[#FECACA] text-[12px] text-[#DC2626] font-medium">
                              Belum ada teknisi yang ditugaskan untuk tiket ini.
                            </div>
                          )}

                          {ticket.resolutionNotes && (
                            <div className="pt-2 border-t border-[#F8FAFC]">
                              <span className="text-[#1D4ED8] font-semibold block mb-0.5">
                                Catatan Perbaikan Teknisi:
                              </span>
                              <p className="text-[#0F172A] bg-[#EFF6FF] p-2.5 rounded-[6px] border border-[#BFDBFE] whitespace-pre-wrap">
                                {ticket.resolutionNotes}
                              </p>
                            </div>
                          )}

                          {ticket.resolvedPhotoUrl && (
                            <div className="pt-2 border-t border-[#F8FAFC]">
                              <span className="text-[#64748B] block mb-1">
                                Foto Bukti Hasil Kerja:
                              </span>
                              <a
                                href={ticket.resolvedPhotoUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-block relative w-20 h-20 rounded-[6px] overflow-hidden border border-[#BFDBFE] hover:opacity-90"
                              >
                                <Image
                                  src={ticket.resolvedPhotoUrl}
                                  alt="Bukti hasil kerja"
                                  fill
                                  className="object-cover"
                                />
                              </a>
                            </div>
                          )}

                          {ticket.feedback && (
                            <div className="pt-2 border-t border-[#F8FAFC]">
                              <div className="flex items-center gap-1.5 text-amber-500 font-bold">
                                <Star className="h-3.5 w-3.5 fill-current" />
                                <span>Ulasan Pelanggan: {ticket.feedback.rating}/5</span>
                              </div>
                              {ticket.feedback.comment && (
                                <p className="text-[11px] text-[#78350F] italic mt-0.5">
                                  &quot;{ticket.feedback.comment}&quot;
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* 3. Panel Aksi Role Admin di Bawah Dropdown */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-[#E2E8F0]">
                      <div className="flex items-center gap-2">
                        {ticket.status === "OPEN" ? (
                          <AssignTechnicianDialog
                            ticketId={ticket.id}
                            ticketNumber={ticket.ticketNumber}
                            ticketTitle={ticket.title}
                            currentTechnicianId={ticket.technicianId}
                            technicians={technicians}
                            isReassign={false}
                          />
                        ) : ticket.status === "ASSIGNED" ? (
                          <AssignTechnicianDialog
                            ticketId={ticket.id}
                            ticketNumber={ticket.ticketNumber}
                            ticketTitle={ticket.title}
                            currentTechnicianId={ticket.technicianId}
                            technicians={technicians}
                            isReassign={true}
                          />
                        ) : null}
                      </div>

                      <Link href={`/admin/tickets/${ticket.id}`}>
                        <button
                          type="button"
                          className="h-[36px] px-3.5 rounded-[8px] bg-white border border-[#CBD5E1] hover:bg-[#F8FAFC] text-[12px] font-semibold text-[#0F172A] inline-flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                        >
                          <span>Buka Detail Penuh</span>
                          <ExternalLink className="h-3.5 w-3.5 text-[#64748B]" />
                        </button>
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
