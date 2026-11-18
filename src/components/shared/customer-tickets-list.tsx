"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/utils";
import { Search, ArrowRight, Clock, CheckCircle2, Ticket } from "lucide-react";

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
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-2 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setTab("ACTIVE")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              tab === "ACTIVE"
                ? "bg-blue-600 text-white"
                : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300"
            }`}
          >
            <Clock className="h-3.5 w-3.5" />
            <span>Sedang Berjalan ({counts.active})</span>
          </button>
          <button
            type="button"
            onClick={() => setTab("HISTORY")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              tab === "HISTORY"
                ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300"
            }`}
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Selesai & Riwayat ({counts.history})</span>
          </button>
          <button
            type="button"
            onClick={() => setTab("ALL")}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 ${
              tab === "ALL" ? "underline font-bold" : ""
            }`}
          >
            Semua ({counts.all})
          </button>
        </div>

        <div className="relative w-full sm:w-56">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
          <input
            type="text"
            placeholder="Cari nomor tiket / kendala..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Tickets List */}
      <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
        {filteredTickets.length === 0 ? (
          <div className="text-center py-12 text-sm text-zinc-500 space-y-2">
            <Ticket className="h-8 w-8 text-zinc-300 mx-auto" />
            <p>Tidak ada tiket pada kategori ini.</p>
          </div>
        ) : (
          filteredTickets.map((t) => (
            <div
              key={t.id}
              className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-zinc-50/70 dark:hover:bg-zinc-900/50 rounded-xl px-3 transition-colors"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
                    #{t.ticketNumber}
                  </span>
                  <Badge variant="priority" value={t.priority} />
                  <Badge variant="status" value={t.status} />
                </div>

                <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">
                  {t.title}
                </h4>

                <p className="text-xs text-zinc-500">
                  {t.category} • Dilaporkan {formatDateTime(t.createdAt)}
                </p>

                {t.technician && (
                  <p className="text-xs text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1">
                    <span>Teknisi Bertugas: {t.technician.name}</span>
                    {t.technician.phone && (
                      <span className="text-zinc-400">({t.technician.phone})</span>
                    )}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Link
                  href={`/customer/track/${t.id}`}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors"
                >
                  <span>Live Tracker</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="text-xs text-zinc-500 pt-2 px-1">
        Menampilkan <strong>{filteredTickets.length}</strong> tiket
      </div>
    </div>
  );
}
