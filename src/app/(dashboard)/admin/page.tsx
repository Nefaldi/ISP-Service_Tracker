import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/status-badge";
import { AssignTechnicianDialog } from "@/components/forms/assign-technician-dialog";
import { formatDateTime } from "@/lib/utils";
import {
  Clock,
  Star,
  Activity,
  ArrowRight,
  AlertTriangle,
  ExternalLink,
} from "lucide-react";

function getFourHoursAgo() {
  return new Date(Date.now() - 4 * 60 * 60 * 1000);
}

export default async function AdminDashboardPage() {
  // Aggregate statistics using Prisma
  const [
    openTicketsCount,
    inProgressTicketsCount,
    recentTickets,
    feedbacks,
    technicians,
  ] = await Promise.all([
    prisma.ticket.count({ where: { status: "OPEN" } }),
    prisma.ticket.count({ where: { status: "IN_PROGRESS" } }),
    prisma.ticket.findMany({
      take: 8,
      orderBy: { createdAt: "desc" },
      include: {
        customer: { select: { id: true, name: true, email: true } },
        technician: { select: { id: true, name: true, email: true } },
      },
    }),
    prisma.feedback.aggregate({
      _avg: { rating: true },
      _count: { rating: true },
    }),
    prisma.user.findMany({
      where: { role: "TEKNISI" },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        assignedTickets: {
          where: { status: { in: ["ASSIGNED", "IN_PROGRESS"] } },
          select: { id: true },
        },
      },
      orderBy: { name: "asc" },
    }),
  ]);

  const technicianOptions = technicians.map((t) => ({
    id: t.id,
    name: t.name,
    email: t.email,
    phone: t.phone,
    activeTaskCount: t.assignedTickets ? t.assignedTickets.length : 0,
  }));

  // SLA Warning Count: tickets open/in_progress older than 4 hours
  const fourHoursAgo = getFourHoursAgo();
  const slaWarningCount = await prisma.ticket.count({
    where: {
      status: { in: ["OPEN", "ASSIGNED", "IN_PROGRESS"] },
      createdAt: { lt: fourHoursAgo },
    },
  });

  const avgCsat = feedbacks._avg.rating ? feedbacks._avg.rating.toFixed(1) : "5.0";

  return (
    <div className="space-y-6">
      {/* Header Konten (UI_CONTEXT 4.3) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight text-[#0F172A]">
            Dashboard Helpdesk
          </h1>
          <p className="text-[14px] text-[#475569] mt-1">
            Pantau tiket masuk, penugasan teknisi, dan kepatuhan SLA layanan
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/tickets"
            className="h-[40px] px-4 rounded-[8px] bg-[#1D4ED8] hover:bg-[#1E40AF] text-white text-[14px] font-medium inline-flex items-center gap-2 shadow-xs transition-colors"
          >
            <span>Semua Tiket</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* 4 Kartu Ringkasan (Grid auto-fit min 180px, angka 32px bold - UI_CONTEXT 4.3) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Tiket Baru (Open) */}
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-[14px] font-medium text-[#475569]">
              Tiket Baru
            </span>
            <div className="h-8 w-8 rounded-full bg-[#FEF3C7] text-[#92400E] flex items-center justify-center">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-[32px] font-bold text-[#0F172A] leading-none">
              {openTicketsCount}
            </div>
            <p className="text-[13px] text-[#64748B] mt-1.5">
              Menunggu penugasan
            </p>
          </div>
        </Card>

        {/* Sedang Dikerjakan */}
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-[14px] font-medium text-[#475569]">
              Sedang Dikerjakan
            </span>
            <div className="h-8 w-8 rounded-full bg-[#EDE9FE] text-[#5B21B6] flex items-center justify-center">
              <Activity className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-[32px] font-bold text-[#0F172A] leading-none">
              {inProgressTicketsCount}
            </div>
            <p className="text-[13px] text-[#64748B] mt-1.5">
              Teknisi aktif di lapangan
            </p>
          </div>
        </Card>

        {/* Mendekati Batas SLA */}
        <Card className="p-5 bg-[#EFF6FF] border-[#BFDBFE]">
          <div className="flex items-center justify-between">
            <span className="text-[14px] font-medium text-[#1D4ED8]">
              Mendekati Batas SLA
            </span>
            <div className="h-8 w-8 rounded-full bg-[#DBEAFE] text-[#1D4ED8] flex items-center justify-center">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-[32px] font-bold text-[#1D4ED8] leading-none">
              {slaWarningCount}
            </div>
            <p className="text-[13px] text-[#1E40AF] mt-1.5">
              Perlu prioritas penanganan
            </p>
          </div>
        </Card>

        {/* Rata-rata CSAT */}
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-[14px] font-medium text-[#475569]">
              Rata-rata CSAT
            </span>
            <div className="h-8 w-8 rounded-full bg-[#FEF3C7] text-[#B45309] flex items-center justify-center">
              <Star className="h-4 w-4 fill-current" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-[32px] font-bold text-[#0F172A] leading-none">
              {avgCsat} <span className="text-[18px] text-[#64748B] font-normal">/ 5.0</span>
            </div>
            <p className="text-[13px] text-[#64748B] mt-1.5">
              Dari {feedbacks._count.rating} ulasan pelanggan
            </p>
          </div>
        </Card>
      </div>

      {/* Tabel Tiket Terbaru (UI_CONTEXT 4.3) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-[18px] font-semibold text-[#0F172A]">
            Tiket Masuk Terbaru
          </h2>
          <Link
            href="/admin/tickets"
            className="text-[14px] font-medium text-[#1D4ED8] hover:underline"
          >
            Lihat semua tiket &rarr;
          </Link>
        </div>

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
                {recentTickets.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-10 text-center text-[14px] text-[#64748B]"
                    >
                      Belum ada data tiket.
                    </td>
                  </tr>
                ) : (
                  recentTickets.map((ticket) => (
                    <tr
                      key={ticket.id}
                      className="hover:bg-[#F8FAFC] transition-colors"
                    >
                      <td className="py-3.5 px-4">
                        <div className="font-mono text-xs font-bold text-[#1D4ED8]">
                          #{ticket.ticketNumber}
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
                          <span className="text-[14px] font-medium text-[#0F172A]">
                            {ticket.technician.name}
                          </span>
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
                            technicians={technicianOptions}
                            isReassign={false}
                          />
                        ) : ticket.status === "ASSIGNED" ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <AssignTechnicianDialog
                              ticketId={ticket.id}
                              ticketNumber={ticket.ticketNumber}
                              ticketTitle={ticket.title}
                              currentTechnicianId={ticket.technicianId}
                              technicians={technicianOptions}
                              isReassign={true}
                            />
                            <Link href={`/customer/track/${ticket.id}`}>
                              <button
                                type="button"
                                className="h-[36px] px-3 rounded-[8px] border border-[#CBD5E1] text-[#0F172A] text-[13px] font-medium hover:bg-[#F1F5F9] inline-flex items-center gap-1 cursor-pointer"
                              >
                                <span>Pantau</span>
                                <ExternalLink className="h-3.5 w-3.5 text-[#64748B]" />
                              </button>
                            </Link>
                          </div>
                        ) : (
                          <Link href={`/customer/track/${ticket.id}`}>
                            <button
                              type="button"
                              className="h-[36px] px-3.5 rounded-[8px] border border-[#E2E8F0] text-[#0F172A] text-[13px] font-medium hover:bg-[#F1F5F9] inline-flex items-center gap-1 cursor-pointer"
                            >
                              <span>Pantau</span>
                              <ExternalLink className="h-3.5 w-3.5 text-[#64748B]" />
                            </button>
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
    </div>
  );
}
