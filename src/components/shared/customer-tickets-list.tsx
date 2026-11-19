"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/utils";
import {
  Search,
  Inbox,
  ChevronDown,
  Check,
  Wrench,
  Phone,
  MessageSquare,
  Star,
  Activity,
} from "lucide-react";

export interface CustomerTicketItem {
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
  technician?: {
    name: string;
    phone?: string | null;
  } | null;
  feedback?: {
    rating: number;
    comment?: string | null;
  } | null;
}

interface CustomerTicketsListProps {
  initialTickets: CustomerTicketItem[];
  limit?: number;
}

const PROGRESS_STEPS = [
  { key: "OPEN", label: "Laporan Diterima", desc: "Menunggu verifikasi admin" },
  { key: "ASSIGNED", label: "Teknisi Ditugaskan", desc: "Admin menunjuk teknisi" },
  { key: "IN_PROGRESS", label: "Pengerjaan Lapangan", desc: "Teknisi menangani gangguan" },
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

export function CustomerTicketsList({
  initialTickets,
  limit = 3,
}: CustomerTicketsListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [tab, setTab] = useState<"ACTIVE" | "HISTORY" | "ALL">("ACTIVE");
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
        ticket.category.toLowerCase().includes(keyword);

      let matchTab = true;
      if (tab === "ACTIVE") matchTab = ticket.status !== "CLOSED";
      else if (tab === "HISTORY") matchTab = ticket.status === "CLOSED";

      return matchKeyword && matchTab;
    });
  }, [initialTickets, searchTerm, tab]);

  // Display only the latest `limit` tickets on the dashboard card
  const displayedTickets = useMemo(() => {
    return limit ? filteredTickets.slice(0, limit) : filteredTickets;
  }, [filteredTickets, limit]);

  // When user has no tickets at all, display clean empty state matching reference UI
  if (initialTickets.length === 0) {
    return (
      <div className="py-20 sm:py-24 flex flex-col items-center justify-center text-center">
        <div className="h-14 w-14 rounded-full bg-[#F1F5F9] text-[#94A3B8] flex items-center justify-center mb-3">
          <Inbox className="h-6 w-6 stroke-[1.75]" />
        </div>
        <p className="text-[14px] text-[#64748B]">
          Belum ada laporan yang Anda buat.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search and Tabs Filter */}
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
            onClick={() => setTab("HISTORY")}
            className={`h-[36px] px-3.5 rounded-[8px] text-[13px] font-semibold whitespace-nowrap transition-colors flex items-center justify-center cursor-pointer ${
              tab === "HISTORY"
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
            aria-label="Cari tiket saya"
            placeholder="Cari nomor atau judul tiket..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-[36px] pl-9 pr-3 rounded-[8px] border border-[#CBD5E1] bg-white text-[13px] text-[#0F172A] placeholder:text-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]"
          />
        </div>
      </div>

      {/* List of Tickets (Limited to 3 latest items) */}
      {displayedTickets.length === 0 ? (
        <div className="py-12 flex flex-col items-center justify-center text-center">
          <div className="h-12 w-12 rounded-full bg-[#F1F5F9] text-[#94A3B8] flex items-center justify-center mb-2">
            <Inbox className="h-5 w-5 stroke-[1.75]" />
          </div>
          <p className="text-[14px] text-[#64748B]">
            Tidak ada laporan yang sesuai pencarian.
          </p>
        </div>
      ) : (
        <div className="space-y-3.5">
          {displayedTickets.map((ticket) => {
            const isExpanded = !!expandedIds[ticket.id];
            const currentIdx = getStatusIndex(ticket.status);

            const cleanPhone = ticket.technician?.phone
              ? ticket.technician.phone.replace(/[^0-9]/g, "")
              : null;
            const waNumber = cleanPhone
              ? cleanPhone.startsWith("0")
                ? "62" + cleanPhone.slice(1)
                : cleanPhone
              : null;

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

                    {/* Tombol Dropdown: Detail & Progres */}
                    <div className="shrink-0 self-end sm:self-center">
                      <button
                        type="button"
                        onClick={() => toggleExpand(ticket.id)}
                        aria-expanded={isExpanded}
                        className="h-[34px] px-3.5 rounded-[8px] text-[12px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-[#CBD5E1] bg-[#F8FAFC] hover:bg-[#F1F5F9] text-[#0F172A] shadow-2xs"
                      >
                        <span>{isExpanded ? "Tutup Progres" : "Detail & Progres"}</span>
                        <ChevronDown
                          className={`h-3.5 w-3.5 text-[#64748B] transition-transform duration-200 ${
                            isExpanded ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Dropdown Panel: Detail & Progres Laporan */}
                {isExpanded && (
                  <div className="border-t border-[#F1F5F9] bg-[#F8FAFC] p-4 sm:p-5 space-y-5 animate-in fade-in-50 duration-200">
                    {/* 1. Alur Progres Stepper */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[12px] font-bold text-[#064E3B] uppercase tracking-wider">
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
                                  ? "bg-[#F0FDF4] border-[#BBF7D0]"
                                  : "bg-white border-[#E2E8F0] opacity-60"
                              }`}
                            >
                              <div className="flex items-center gap-2 mb-1">
                                {isDone && (
                                  <div className="h-5 w-5 rounded-full bg-[#059669] text-white flex items-center justify-center shrink-0">
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
                                      ? "text-[#065F46]"
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

                    {/* 2. Grid Informasi Detail Laporan */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                      {/* Kolom Kiri: Detail Pelaporan */}
                      <div className="space-y-3 bg-white p-3.5 rounded-[10px] border border-[#E2E8F0]">
                        <h4 className="text-[12px] font-bold text-[#0F172A] flex items-center gap-1.5 pb-2 border-b border-[#F1F5F9]">
                          <MessageSquare className="h-3.5 w-3.5 text-[#1D4ED8]" />
                          <span>Informasi Pengaduan</span>
                        </h4>

                        <div className="space-y-2 text-[12px]">
                          <div>
                            <span className="text-[#64748B]">Deskripsi Masalah:</span>
                            <p className="text-[#0F172A] mt-0.5 whitespace-pre-wrap">
                              {ticket.description}
                            </p>
                          </div>

                          <div className="flex justify-between pt-1">
                            <span className="text-[#64748B]">Waktu Dibuat:</span>
                            <span className="font-medium text-[#0F172A]">
                              {formatDateTime(ticket.createdAt)}
                            </span>
                          </div>

                          {ticket.damagePhotoUrl && (
                            <div className="pt-2">
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

                      {/* Kolom Kanan: Teknisi & Penyelesaian */}
                      <div className="space-y-3 bg-white p-3.5 rounded-[10px] border border-[#E2E8F0]">
                        <h4 className="text-[12px] font-bold text-[#0F172A] flex items-center gap-1.5 pb-2 border-b border-[#F1F5F9]">
                          <Wrench className="h-3.5 w-3.5 text-[#059669]" />
                          <span>Pelaksana & Penyelesaian</span>
                        </h4>

                        <div className="space-y-2.5 text-[12px]">
                          {/* Teknisi Info */}
                          <div>
                            <span className="text-[#64748B]">Teknisi Penanggung Jawab:</span>
                            {ticket.technician ? (
                              <div className="mt-1 flex items-center justify-between p-2 rounded-[6px] bg-[#F0FDF4] border border-[#DCFCE7]">
                                <div className="min-w-0">
                                  <p className="font-semibold text-[#065F46] truncate">
                                    {ticket.technician.name}
                                  </p>
                                  {ticket.technician.phone && (
                                    <p className="text-[11px] text-[#047857]">
                                      {ticket.technician.phone}
                                    </p>
                                  )}
                                </div>

                                {waNumber && (
                                  <a
                                    href={`https://wa.me/${waNumber}?text=Halo%20Teknisi%2C%20saya%20pelapor%20tiket%20%23${ticket.ticketNumber}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="px-2.5 py-1 rounded-[6px] bg-[#16A34A] text-white text-[11px] font-semibold flex items-center gap-1 hover:bg-[#15803D]"
                                  >
                                    <Phone className="h-3 w-3" />
                                    <span>WhatsApp</span>
                                  </a>
                                )}
                              </div>
                            ) : (
                              <p className="text-[12px] text-[#D97706] font-medium mt-0.5 bg-[#FFFBEB] p-2 rounded-[6px] border border-[#FEF3C7]">
                                Sedang menunggu penugasan teknisi oleh Administrator.
                              </p>
                            )}
                          </div>

                          {/* Catatan Penyelesaian (Jika ada) */}
                          {ticket.resolutionNotes && (
                            <div className="p-2.5 rounded-[6px] bg-[#F0FDF4] border border-[#BBF7D0]">
                              <span className="font-semibold text-[#065F46] block text-[11px]">
                                Catatan Penyelesaian Lapangan:
                              </span>
                              <p className="text-[#047857] text-[12px] mt-0.5">
                                {ticket.resolutionNotes}
                              </p>
                            </div>
                          )}

                          {/* Ulasan Pelanggan (Jika ada) */}
                          {ticket.feedback && (
                            <div className="p-2.5 rounded-[6px] bg-[#FFFBEB] border border-[#FDE68A]">
                              <div className="flex items-center gap-1 text-[#D97706] mb-0.5">
                                {[...Array(ticket.feedback.rating)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className="h-3.5 w-3.5 fill-[#D97706] text-[#D97706]"
                                  />
                                ))}
                                <span className="text-[11px] font-bold ml-1">
                                  {ticket.feedback.rating}/5
                                </span>
                              </div>
                              {ticket.feedback.comment && (
                                <p className="text-[11px] text-[#92400E]">
                                  &ldquo;{ticket.feedback.comment}&rdquo;
                                </p>
                              )}
                            </div>
                          )}
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
                              Lihat riwayat perbaikan, log aktivitas teknisi, dan verifikasi tiket
                            </p>
                          </div>
                        </div>

                        <Link
                          href={`/customer/track/${ticket.id}`}
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

          {/* Footer note when more tickets exist */}
          {limit && filteredTickets.length > limit && (
            <div className="pt-2 text-center border-t border-[#F1F5F9]">
              <p className="text-[12px] text-[#64748B]">
                Menampilkan {limit} laporan terakhir dari total {filteredTickets.length} laporan.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
