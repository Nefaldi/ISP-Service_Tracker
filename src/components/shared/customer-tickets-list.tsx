"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/utils";
import { Search, ArrowRight, Clock, CheckCircle2, Inbox } from "lucide-react";

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
  limit?: number;
}

export function CustomerTicketsList({
  initialTickets,
  limit = 3,
}: CustomerTicketsListProps) {
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
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-3 border-b border-[#E2E8F0]">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setTab("ACTIVE")}
            className={`h-[36px] px-3.5 rounded-[8px] text-[13px] font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
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
            className={`h-[36px] px-3.5 rounded-[8px] text-[13px] font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
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
            className={`h-[36px] px-2.5 text-[13px] font-medium text-[#64748B] hover:text-[#0F172A] cursor-pointer ${
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
        <div className="space-y-3">
          {displayedTickets.map((ticket) => (
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
