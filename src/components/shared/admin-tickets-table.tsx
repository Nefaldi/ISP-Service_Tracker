"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AssignTechnicianDialog,
  TechnicianOption,
} from "@/components/forms/assign-technician-dialog";
import { formatDateTime } from "@/lib/utils";
import { Search, Download, ExternalLink } from "lucide-react";

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

  // Filtered tickets
  const filteredTickets = useMemo(() => {
    return initialTickets.filter((ticket) => {
      const keyword = searchTerm.toLowerCase().trim();
      const matchKeyword =
        !keyword ||
        ticket.ticketNumber.toLowerCase().includes(keyword) ||
        ticket.title.toLowerCase().includes(keyword) ||
        ticket.customer.name.toLowerCase().includes(keyword) ||
        (ticket.technician?.name || "").toLowerCase().includes(keyword);

      const matchStatus = statusFilter === "ALL" || ticket.status === statusFilter;
      const matchPriority =
        priorityFilter === "ALL" || ticket.priority === priorityFilter;

      return matchKeyword && matchStatus && matchPriority;
    });
  }, [initialTickets, searchTerm, statusFilter, priorityFilter]);

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
      "Rating CSAT",
    ];

    const rows = filteredTickets.map((t) => [
      `#${t.ticketNumber}`,
      `"${t.title.replace(/"/g, '""')}"`,
      `"${t.category}"`,
      t.priority,
      t.status,
      `"${t.customer.name}"`,
      t.customer.email,
      `"${t.technician?.name || "Belum ditugaskan"}"`,
      formatDateTime(t.createdAt),
      t.resolvedAt ? formatDateTime(t.resolvedAt) : "-",
      t.feedback?.rating ? `${t.feedback.rating}/5` : "-",
    ]);

    const csvContent = [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `rekap-tiket-helpdesk-${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Kolom cari lebar 280px sesuai UI_CONTEXT 4.3 */}
        <div className="relative w-full sm:w-[280px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#64748B]" />
          <input
            type="text"
            aria-label="Cari tiket"
            placeholder="Cari tiket, pelanggan, teknisi..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-[40px] pl-10 pr-3.5 rounded-[8px] border border-[#94A3B8] bg-white text-[14px] text-[#0F172A] placeholder:text-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]"
          />
        </div>

        {/* Filters & Export */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Filter status tiket"
            className="h-[40px] px-3 rounded-[8px] border border-[#94A3B8] bg-white text-[13px] text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]"
          >
            <option value="ALL">Semua Status</option>
            <option value="OPEN">Open</option>
            <option value="ASSIGNED">Assigned</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            aria-label="Filter prioritas tiket"
            className="h-[40px] px-3 rounded-[8px] border border-[#94A3B8] bg-white text-[13px] text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]"
          >
            <option value="ALL">Semua Prioritas</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            className="h-[40px] px-3.5 gap-1.5 border-[#94A3B8] text-[#0F172A] hover:bg-[#F1F5F9]"
            title="Download Rekap CSV"
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Export CSV</span>
          </Button>
        </div>
      </div>

      {/* Tabel Tiket dalam Kartu Putih dengan overflow-x: auto (UI_CONTEXT 4.3) */}
      <div className="rounded-[12px] border border-[#E2E8F0] bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
                <th className="py-3.5 px-4 text-[14px] font-medium text-[#475569]">
                  Tiket
                </th>
                <th className="py-3.5 px-4 text-[14px] font-medium text-[#475569]">
                  Pelanggan
                </th>
                <th className="py-3.5 px-4 text-[14px] font-medium text-[#475569]">
                  Status
                </th>
                <th className="py-3.5 px-4 text-[14px] font-medium text-[#475569]">
                  Teknisi
                </th>
                <th className="py-3.5 px-4 text-[14px] font-medium text-[#475569] text-right">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {filteredTickets.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="py-12 text-center text-[14px] text-[#64748B]"
                  >
                    Tidak ada tiket yang sesuai dengan pencarian atau filter.
                  </td>
                </tr>
              ) : (
                filteredTickets.map((ticket) => (
                  <tr
                    key={ticket.id}
                    className="hover:bg-[#F8FAFC] transition-colors"
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-xs font-bold text-[#1D4ED8]">
                          #{ticket.ticketNumber}
                        </span>
                        <Badge variant="priority" value={ticket.priority} />
                      </div>
                      <div className="font-medium text-[15px] text-[#0F172A] line-clamp-1">
                        {ticket.title}
                      </div>
                      <div className="text-[12px] text-[#64748B]">
                        {formatDateTime(ticket.createdAt)}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-medium text-[14px] text-[#0F172A]">
                        {ticket.customer.name}
                      </div>
                      <div className="text-[12px] text-[#64748B]">
                        {ticket.customer.email}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <StatusBadge status={ticket.status} />
                    </td>

                    <td className="py-3.5 px-4">
                      {ticket.technician ? (
                        <div>
                          <div className="text-[14px] font-medium text-[#0F172A]">
                            {ticket.technician.name}
                          </div>
                          <div className="text-[12px] text-[#64748B]">
                            {ticket.technician.email}
                          </div>
                        </div>
                      ) : (
                        <span className="text-[13px] text-[#94A3B8] italic">
                          Belum ditugaskan
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
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
                        <div className="flex items-center justify-end gap-1.5">
                          <AssignTechnicianDialog
                            ticketId={ticket.id}
                            ticketNumber={ticket.ticketNumber}
                            ticketTitle={ticket.title}
                            currentTechnicianId={ticket.technicianId}
                            technicians={technicians}
                            isReassign={true}
                          />
                          <Link href={`/customer/track/${ticket.id}`}>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-[36px] text-[13px] border-[#CBD5E1] text-[#0F172A] hover:bg-[#F1F5F9]"
                            >
                              <span>Pantau</span>
                              <ExternalLink className="h-3.5 w-3.5 ml-1 text-[#64748B]" />
                            </Button>
                          </Link>
                        </div>
                      ) : (
                        <Link href={`/customer/track/${ticket.id}`}>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-[36px] text-[13px] border-[#E2E8F0] text-[#0F172A] hover:bg-[#F1F5F9]"
                          >
                            <span>Pantau</span>
                            <ExternalLink className="h-3.5 w-3.5 ml-1 text-[#64748B]" />
                          </Button>
                        </Link>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
