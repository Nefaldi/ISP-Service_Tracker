"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AssignTechnicianDialog } from "@/components/forms/assign-technician-dialog";
import { formatDateTime } from "@/lib/utils";
import { Search, Download, ExternalLink, RefreshCw } from "lucide-react";

export interface TicketRow {
  id: string;
  ticketNumber: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  category: string;
  technicianId?: string | null;
  createdAt: string | Date;
  resolvedAt?: string | Date | null;
  closedAt?: string | Date | null;
  customer: {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
  };
  technician?: {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
  } | null;
  feedback?: {
    rating: number;
    comment?: string | null;
  } | null;
}

interface TechnicianOption {
  id: string;
  name: string;
  email: string;
}

interface AdminTicketsTableProps {
  initialTickets: TicketRow[];
  technicians: TechnicianOption[];
}

export function AdminTicketsTable({
  initialTickets,
  technicians,
}: AdminTicketsTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    initialTickets.forEach((t) => set.add(t.category));
    return Array.from(set);
  }, [initialTickets]);

  // Filtered tickets
  const filteredTickets = useMemo(() => {
    return initialTickets.filter((ticket) => {
      // Keyword match
      const keyword = searchTerm.toLowerCase().trim();
      const matchKeyword =
        !keyword ||
        ticket.ticketNumber.toLowerCase().includes(keyword) ||
        ticket.title.toLowerCase().includes(keyword) ||
        ticket.customer.name.toLowerCase().includes(keyword) ||
        (ticket.technician?.name || "").toLowerCase().includes(keyword);

      // Status match
      const matchStatus = statusFilter === "ALL" || ticket.status === statusFilter;

      // Priority match
      const matchPriority =
        priorityFilter === "ALL" || ticket.priority === priorityFilter;

      // Category match
      const matchCategory =
        categoryFilter === "ALL" || ticket.category === categoryFilter;

      return matchKeyword && matchStatus && matchPriority && matchCategory;
    });
  }, [initialTickets, searchTerm, statusFilter, priorityFilter, categoryFilter]);

  // Export CSV handler
  const handleExportCSV = () => {
    const headers = [
      "No. Tiket",
      "Judul Masalah",
      "Kategori",
      "Prioritas",
      "Status",
      "Pelanggan",
      "Email Pelanggan",
      "Teknisi",
      "Waktu Dibuat",
      "Waktu Selesai",
      "Durasi SLA (Jam)",
      "Rating CSAT",
      "Komentar CSAT",
    ];

    const rows = filteredTickets.map((t) => {
      let slaHours = "-";
      if (t.resolvedAt) {
        const start = new Date(t.createdAt).getTime();
        const end = new Date(t.resolvedAt).getTime();
        slaHours = ((end - start) / (1000 * 60 * 60)).toFixed(1);
      }

      return [
        `"${t.ticketNumber}"`,
        `"${t.title.replace(/"/g, '""')}"`,
        `"${t.category}"`,
        `"${t.priority}"`,
        `"${t.status}"`,
        `"${t.customer.name}"`,
        `"${t.customer.email}"`,
        `"${t.technician?.name || "-"}"`,
        `"${formatDateTime(t.createdAt)}"`,
        `"${t.resolvedAt ? formatDateTime(t.resolvedAt) : "-"}"`,
        `"${slaHours}"`,
        `"${t.feedback?.rating ? t.feedback.rating + "/5" : "-"}"`,
        `"${(t.feedback?.comment || "").replace(/"/g, '""')}"`,
      ].join(",");
    });

    const csvContent =
      "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(","), ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `rekap-tiket-helpdesk-${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setStatusFilter("ALL");
    setPriorityFilter("ALL");
    setCategoryFilter("ALL");
  };

  return (
    <div className="space-y-4">
      {/* Search & Filter Toolbar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs">
        <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-2">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Cari tiket, judul, atau nama..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs px-2.5 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="ALL">Semua Status</option>
            <option value="OPEN">Open</option>
            <option value="ASSIGNED">Assigned</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
          </select>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="text-xs px-2.5 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="ALL">Semua Prioritas</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs px-2.5 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 focus:outline-none focus:ring-1 focus:ring-blue-500 max-w-[160px] truncate"
          >
            <option value="ALL">Semua Kategori</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {(searchTerm || statusFilter !== "ALL" || priorityFilter !== "ALL" || categoryFilter !== "ALL") && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResetFilters}
              className="text-xs text-zinc-500 hover:text-zinc-800"
            >
              <RefreshCw className="h-3.5 w-3.5 mr-1" />
              <span>Reset</span>
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            className="text-xs gap-1.5 border-zinc-300 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800"
          >
            <Download className="h-3.5 w-3.5 text-zinc-600" />
            <span>Export CSV</span>
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-zinc-200 bg-zinc-50/50 text-xs font-semibold uppercase text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/50">
            <tr>
              <th className="px-4 py-3">No. Tiket & Masalah</th>
              <th className="px-4 py-3">Pelanggan</th>
              <th className="px-4 py-3">Prioritas</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Penugasan Teknisi</th>
              <th className="px-4 py-3">Waktu Lapor</th>
              <th className="px-4 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {filteredTickets.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-zinc-500 text-xs">
                  Tidak ditemukan tiket yang sesuai dengan kriteria filter pencarian.
                </td>
              </tr>
            ) : (
              filteredTickets.map((t) => (
                <tr
                  key={t.id}
                  className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
                      #{t.ticketNumber}
                    </div>
                    <div className="font-semibold text-zinc-900 dark:text-zinc-100 line-clamp-1">
                      {t.title}
                    </div>
                    <div className="text-xs text-zinc-500">{t.category}</div>
                  </td>

                  <td className="px-4 py-3">
                    <div className="font-medium text-zinc-800 dark:text-zinc-200">
                      {t.customer.name}
                    </div>
                    <div className="text-xs text-zinc-500">{t.customer.email}</div>
                  </td>

                  <td className="px-4 py-3">
                    <Badge variant="priority" value={t.priority} />
                  </td>

                  <td className="px-4 py-3">
                    <Badge variant="status" value={t.status} />
                  </td>

                  <td className="px-4 py-3">
                    {t.status === "CLOSED" ? (
                      <span className="text-xs text-zinc-500 font-medium">
                        {t.technician?.name || "Selesai"}
                      </span>
                    ) : (
                      <AssignTechnicianDialog
                        ticketId={t.id}
                        currentTechnicianId={t.technicianId}
                        technicians={technicians}
                      />
                    )}
                  </td>

                  <td className="px-4 py-3 text-xs text-zinc-500 whitespace-nowrap">
                    {formatDateTime(t.createdAt)}
                  </td>

                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/customer/track/${t.id}`}
                      className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium"
                    >
                      <span>Tracker</span>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-xs text-zinc-500 px-1">
        <span>
          Menampilkan <strong>{filteredTickets.length}</strong> dari {initialTickets.length} total tiket
        </span>
      </div>
    </div>
  );
}
