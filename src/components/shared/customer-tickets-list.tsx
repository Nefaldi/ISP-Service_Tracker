"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/utils";
import { Search, ArrowRight, Clock, CheckCircle2 } from "lucide-react";

export interface CustomerTicketItem {
  id: string;
  ticketNumber: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  category: string;
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
}

export function CustomerTicketsList({ initialTickets }: CustomerTicketsListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [tab, setTab] = useState<"ACTIVE" | "HISTORY" | "ALL">("ACTIVE");

  const counts = useMemo(() => {
    return {
      all: initialTickets.length,
      active: initialTickets.filter((t) => t.status !== "CLOSED").length,
      history: initialTickets.filter((t) => t.status === "CLOSED").length,
    };
  }, [initialTickets]);

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

  return (
    <div className="space-y-4">
      {/* Search and Tabs */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-3 border-b border-[#E2E8F0]">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setTab("ACTIVE")}
            className={`h-[36px] px-3.5 rounded-[8px] text-[13px] font-semibold transition-colors flex items-center gap-1.5 ${
              tab === "ACTIVE"
                ? "bg-[#1D4ED8] text-white"
                : "bg-[#F1F5F9] text-[#475569] hover:bg-[#E2E8F0]"
            }`}
          >
            <Clock className="h-4 w-4" />
            <span>Sedang Berjalan ({counts.active})</span>
          </button>
          <button
            type="button"
            onClick={() => setTab("HISTORY")}
            className={`h-[36px] px-3.5 rounded-[8px] text-[13px] font-semibold transition-colors flex items-center gap-1.5 ${
              tab === "HISTORY"
                ? "bg-[#0F172A] text-white"
                : "bg-[#F1F5F9] text-[#475569] hover:bg-[#E2E8F0]"
            }`}
          >
            <CheckCircle2 className="h-4 w-4" />
            <span>Riwayat Selesai ({counts.history})</span>
          </button>
          <button
            type="button"
            onClick={() => setTab("ALL")}
            className={`h-[36px] px-2.5 text-[13px] font-medium text-[#64748B] hover:text-[#0F172A] ${
              tab === "ALL" ? "underline font-bold text-[#0F172A]" : ""
            }`}
          >
            Semua ({counts.all})
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
            className="w-full h-[36px] pl-9 pr-3 rounded-[8px] border border-[#94A3B8] bg-white text-[13px] text-[#0F172A] placeholder:text-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]"
          />
        </div>
      </div>

      {/* List of Tickets */}
      {filteredTickets.length === 0 ? (
        <div className="py-12 text-center rounded-[12px] border border-[#E2E8F0] bg-white">
          <Clock className="h-8 w-8 text-[#94A3B8] mx-auto mb-2" />
          <h4 className="text-[16px] font-semibold text-[#0F172A]">
            Belum ada tiket
          </h4>
          <p className="text-[13px] text-[#64748B] mt-1">
            {tab === "ACTIVE"
              ? "Tidak ada laporan gangguan yang sedang aktif."
              : "Belum ada riwayat tiket yang terselesaikan."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTickets.map((ticket) => (
            <Link
              key={ticket.id}
              href={`/customer/track/${ticket.id}`}
              className="block rounded-[12px] border border-[#E2E8F0] bg-white p-4 sm:p-5 hover:border-[#1D4ED8] hover:shadow-xs transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#1D4ED8]">
                      #{ticket.ticketNumber}
                    </span>
                    <StatusBadge status={ticket.status} />
                    <Badge variant="priority" value={ticket.priority} />
                    <span className="text-xs text-[#64748B] hidden sm:inline">
                      &bull; {ticket.category}
                    </span>
                  </div>

                  <h3 className="text-[16px] font-semibold text-[#0F172A]">
                    {ticket.title}
                  </h3>

                  <p className="text-[13px] text-[#475569] line-clamp-2">
                    {ticket.description}
                  </p>
                </div>

                <div className="flex items-center justify-between sm:flex-col sm:items-end gap-2 pt-2 sm:pt-0 border-t sm:border-0 border-[#E2E8F0]">
                  <span className="text-[12px] text-[#64748B]">
                    {formatDateTime(ticket.createdAt)}
                  </span>

                  <span className="inline-flex items-center gap-1 text-[13px] font-medium text-[#1D4ED8] group-hover:translate-x-1 transition-transform">
                    <span>Pantau Live</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
