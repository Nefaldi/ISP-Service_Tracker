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
  User,
  Star,
  ExternalLink,
  Clock,
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

export function AdminTicketsList({
  initialTickets,
  technicians,
  limit,
}: AdminTicketsListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTab, setFilterTab] = useState<"ACTIVE" | "OPEN" | "IN_PROGRESS" | "RESOLVED" | "ALL">("ACTIVE");
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
      if (filterTab === "ACTIVE") {
        matchTab = ticket.status === "OPEN" || ticket.status === "ASSIGNED" || ticket.status === "IN_PROGRESS";
      } else if (filterTab === "OPEN") {
        matchTab = ticket.status === "OPEN";
      } else if (filterTab === "IN_PROGRESS") {
        matchTab = ticket.status === "ASSIGNED" || ticket.status === "IN_PROGRESS";
      } else if (filterTab === "RESOLVED") {
        matchTab = ticket.status === "RESOLVED" || ticket.status === "CLOSED";
      }

      return matchKeyword && matchTab;
    });
  }, [initialTickets, searchTerm, filterTab]);

  const displayedTickets = limit ? filteredTickets.slice(0, limit) : filteredTickets;

  return (
    <div className="space-y-4">
      {/* Search Input & Filter Tabs */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        {/* Search Input */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94A3B8]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari tiket, pelanggan, atau teknisi..."
            className="w-full h-[36px] pl-9 pr-3 text-[13px] rounded-[8px] border border-[#E2E8F0] bg-white placeholder-[#94A3B8] text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            type="button"
            onClick={() => setFilterTab("ACTIVE")}
            className={`px-3 py-1.5 text-[12px] font-semibold rounded-[6px] transition-colors whitespace-nowrap cursor-pointer ${
              filterTab === "ACTIVE"
                ? "bg-[#1D4ED8] text-white"
                : "bg-[#F1F5F9] text-[#64748B] hover:text-[#0F172A]"
            }`}
          >
            Aktif
          </button>
          <button
            type="button"
            onClick={() => setFilterTab("OPEN")}
            className={`px-3 py-1.5 text-[12px] font-semibold rounded-[6px] transition-colors whitespace-nowrap cursor-pointer ${
              filterTab === "OPEN"
                ? "bg-[#1D4ED8] text-white"
                : "bg-[#F1F5F9] text-[#64748B] hover:text-[#0F172A]"
            }`}
          >
            Perlu Ditugaskan
          </button>
          <button
            type="button"
            onClick={() => setFilterTab("IN_PROGRESS")}
            className={`px-3 py-1.5 text-[12px] font-semibold rounded-[6px] transition-colors whitespace-nowrap cursor-pointer ${
              filterTab === "IN_PROGRESS"
                ? "bg-[#1D4ED8] text-white"
                : "bg-[#F1F5F9] text-[#64748B] hover:text-[#0F172A]"
            }`}
          >
            Diproses
          </button>
          <button
            type="button"
            onClick={() => setFilterTab("RESOLVED")}
            className={`px-3 py-1.5 text-[12px] font-semibold rounded-[6px] transition-colors whitespace-nowrap cursor-pointer ${
              filterTab === "RESOLVED"
                ? "bg-[#1D4ED8] text-white"
                : "bg-[#F1F5F9] text-[#64748B] hover:text-[#0F172A]"
            }`}
          >
            Selesai
          </button>
          <button
            type="button"
            onClick={() => setFilterTab("ALL")}
            className={`px-3 py-1.5 text-[12px] font-semibold rounded-[6px] transition-colors whitespace-nowrap cursor-pointer ${
              filterTab === "ALL"
                ? "bg-[#1D4ED8] text-white"
                : "bg-[#F1F5F9] text-[#64748B] hover:text-[#0F172A]"
            }`}
          >
            Semua
          </button>
        </div>
      </div>

      {/* Ticket Cards List */}
      {displayedTickets.length === 0 ? (
        <div className="py-12 text-center rounded-[10px] border border-dashed border-[#CBD5E1] bg-[#F8FAFC]">
          <Inbox className="mx-auto h-8 w-8 text-[#94A3B8] mb-2" />
          <h4 className="text-[14px] font-bold text-[#475569]">
            Tidak ada tiket yang sesuai
          </h4>
          <p className="text-[12px] text-[#64748B] mt-1 max-w-sm mx-auto">
            {searchTerm
              ? `Tidak ditemukan tiket dengan kata kunci "${searchTerm}".`
              : "Belum ada tiket pada kategori filter ini."}
          </p>
        </div>
      ) : (
        <div className="space-y-3.5">
          {displayedTickets.map((ticket) => {
            const currentStepIdx = getStatusIndex(ticket.status);
            const isExpanded = !!expandedIds[ticket.id];

            return (
              <div
                key={ticket.id}
                className="rounded-[10px] border border-[#E2E8F0] bg-white p-4 transition-all hover:border-[#CBD5E1] hover:shadow-2xs"
              >
                {/* Header Card: Ticket Number, Badges, Date */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-[#F1F5F9]">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[13px] font-bold text-[#1D4ED8]">
                      #{ticket.ticketNumber}
                    </span>
                    <StatusBadge status={ticket.status} />
                    <Badge variant="priority" value={ticket.priority} className="text-[11px] py-0 px-2 font-medium" />
                    <span className="text-[11px] text-[#64748B] bg-[#F1F5F9] px-2 py-0.5 rounded-[4px]">
                      {ticket.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[12px] text-[#64748B]">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{formatDateTime(ticket.createdAt)}</span>
                  </div>
                </div>

                {/* Main Content: Title, Customer, Technician */}
                <div className="pt-3 pb-2">
                  <h3 className="text-[15px] font-bold text-[#0F172A] leading-snug">
                    {ticket.title}
                  </h3>

                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[13px] text-[#475569]">
                    <div className="flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5 text-[#64748B]" />
                      <span className="font-medium text-[#0F172A]">Pelapor:</span>
                      <span>{ticket.customer.name}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Wrench className="h-3.5 w-3.5 text-[#64748B]" />
                      <span className="font-medium text-[#0F172A]">Teknisi:</span>
                      {ticket.technician ? (
                        <span className="font-semibold text-[#1D4ED8]">
                          {ticket.technician.name}
                        </span>
                      ) : (
                        <span className="text-[#DC2626] font-medium bg-[#FEF2F2] px-2 py-0.5 rounded-[4px] border border-[#FECACA] text-[11px]">
                          Belum ditugaskan
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Stepper Progress Visual (5 Tahap Konsisten) */}
                <div className="mt-2 pt-2.5 pb-1 border-t border-[#F8FAFC]">
                  <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
                    {PROGRESS_STEPS.map((step, idx) => {
                      const isCompleted = idx < currentStepIdx;
                      const isCurrent = idx === currentStepIdx;

                      return (
                        <div key={step.key} className="flex flex-col items-center text-center">
                          <div
                            className={`h-6 w-6 rounded-full flex items-center justify-center text-[11px] font-bold transition-all ${
                              isCompleted
                                ? "bg-[#1D4ED8] text-white"
                                : isCurrent
                                ? "bg-[#DBEAFE] text-[#1D4ED8] ring-2 ring-[#1D4ED8]"
                                : "bg-[#F1F5F9] text-[#94A3B8]"
                            }`}
                          >
                            {isCompleted ? <Check className="h-3.5 w-3.5" /> : idx + 1}
                          </div>
                          <span
                            className={`mt-1 text-[10px] sm:text-[11px] font-medium leading-tight line-clamp-1 ${
                              isCurrent
                                ? "text-[#1D4ED8] font-bold"
                                : isCompleted
                                ? "text-[#0F172A]"
                                : "text-[#94A3B8]"
                            }`}
                          >
                            {step.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Expanded Details Section */}
                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-[#E2E8F0] space-y-3 text-[13px] bg-[#F8FAFC] -mx-4 -mb-4 p-4 rounded-b-[10px]">
                    <div>
                      <span className="font-semibold text-[#0F172A] block mb-1">
                        Deskripsi Gangguan:
                      </span>
                      <p className="text-[#334155] whitespace-pre-wrap leading-relaxed">
                        {ticket.description}
                      </p>
                    </div>

                    {/* Photos if any */}
                    <div className="flex flex-wrap gap-3 pt-1">
                      {ticket.damagePhotoUrl && (
                        <div>
                          <span className="text-[11px] font-semibold text-[#64748B] block mb-1">
                            Foto Laporan:
                          </span>
                          <div className="relative h-20 w-28 rounded-[6px] overflow-hidden border border-[#CBD5E1]">
                            <Image
                              src={ticket.damagePhotoUrl}
                              alt="Foto Laporan"
                              fill
                              className="object-cover"
                            />
                          </div>
                        </div>
                      )}

                      {ticket.resolvedPhotoUrl && (
                        <div>
                          <span className="text-[11px] font-semibold text-[#64748B] block mb-1">
                            Bukti Perbaikan:
                          </span>
                          <div className="relative h-20 w-28 rounded-[6px] overflow-hidden border border-[#CBD5E1]">
                            <Image
                              src={ticket.resolvedPhotoUrl}
                              alt="Bukti Perbaikan"
                              fill
                              className="object-cover"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Resolution Notes */}
                    {ticket.resolutionNotes && (
                      <div className="p-2.5 rounded-[6px] bg-white border border-[#E2E8F0]">
                        <span className="text-[12px] font-semibold text-[#0F172A] block mb-0.5">
                          Catatan Perbaikan Teknisi:
                        </span>
                        <p className="text-[12px] text-[#475569]">
                          {ticket.resolutionNotes}
                        </p>
                      </div>
                    )}

                    {/* Feedback Rating */}
                    {ticket.feedback && (
                      <div className="p-2.5 rounded-[6px] bg-[#FEF3C7]/40 border border-[#FDE68A] flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <Star className="h-4 w-4 fill-amber-400 text-amber-500" />
                          <span className="text-[12px] font-bold text-[#92400E]">
                            Ulasan Pelanggan: {ticket.feedback.rating}/5
                          </span>
                        </div>
                        {ticket.feedback.comment && (
                          <span className="text-[12px] text-[#78350F] italic">
                            &quot;{ticket.feedback.comment}&quot;
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Footer Actions */}
                <div className="mt-3 pt-2.5 border-t border-[#F1F5F9] flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => toggleExpand(ticket.id)}
                    className="inline-flex items-center gap-1 text-[12px] font-medium text-[#475569] hover:text-[#0F172A] cursor-pointer"
                  >
                    <span>{isExpanded ? "Tutup detail" : "Lihat detail"}</span>
                    <ChevronDown
                      className={`h-3.5 w-3.5 transition-transform ${
                        isExpanded ? "rotate-180" : ""
                      }`}
                    />
                  </button>

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

                    <Link href={`/admin/tickets/${ticket.id}`}>
                      <button
                        type="button"
                        className="h-[34px] px-3 rounded-[6px] border border-[#CBD5E1] bg-white text-[12px] font-semibold text-[#0F172A] hover:bg-[#F8FAFC] inline-flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <span>Pantau</span>
                        <ExternalLink className="h-3.5 w-3.5 text-[#64748B]" />
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
