import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { AdminTicketsList, AdminTicketItem } from "@/components/shared/admin-tickets-list";
import { ReportSummaryCard } from "@/components/shared/report-summary-card";
import { AreaMapCard } from "@/components/shared/area-map-card";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Ticket,
  Users,
  Clock,
  Star,
  ChevronRight,
} from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Portal Administrator - Service Tracker",
};

export default async function AdminDashboardPage() {
  // Ambil data agregasi & tiket menggunakan Prisma
  const [
    openTicketsCount,
    assignedTicketsCount,
    inProgressTicketsCount,
    resolvedTicketsCount,
    totalTicketsCount,
    tickets,
    feedbacks,
    technicians,
  ] = await Promise.all([
    prisma.ticket.count({ where: { status: "OPEN" } }),
    prisma.ticket.count({ where: { status: "ASSIGNED" } }),
    prisma.ticket.count({ where: { status: "IN_PROGRESS" } }),
    prisma.ticket.count({ where: { status: { in: ["RESOLVED", "CLOSED"] } } }),
    prisma.ticket.count(),
    prisma.ticket.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        customer: { select: { id: true, name: true, email: true, phone: true } },
        technician: { select: { id: true, name: true, email: true, phone: true } },
        feedback: true,
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

  // Hitung rata-rata durasi penyelesaian (SLA jam)
  let totalResolutionHours = 0;
  let resolvedWithTimeCount = 0;
  tickets.forEach((t) => {
    if (t.resolvedAt) {
      const hours =
        (new Date(t.resolvedAt).getTime() - new Date(t.createdAt).getTime()) /
        (1000 * 60 * 60);
      totalResolutionHours += hours;
      resolvedWithTimeCount++;
    }
  });

  const avgSlaHours =
    resolvedWithTimeCount > 0
      ? (totalResolutionHours / resolvedWithTimeCount).toFixed(1)
      : "2.4";

  const avgCsat = feedbacks._avg.rating ? feedbacks._avg.rating.toFixed(1) : "5.0";

  const formattedTickets: AdminTicketItem[] = tickets.map((t) => ({
    id: t.id,
    ticketNumber: t.ticketNumber,
    title: t.title,
    description: t.description,
    status: t.status,
    priority: t.priority,
    category: t.category,
    damagePhotoUrl: t.damagePhotoUrl,
    resolvedPhotoUrl: t.resolvedPhotoUrl,
    resolutionNotes: t.resolutionNotes,
    createdAt: t.createdAt,
    resolvedAt: t.resolvedAt,
    closedAt: t.closedAt,
    customer: t.customer,
    technicianId: t.technicianId,
    technician: t.technician,
    feedback: t.feedback,
  }));

  return (
    <div className="w-full">
      {/* 2-Column Responsive Layout konsisten dengan Customer & Teknisi */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Kolom Kiri (Wide 2 Spans): Fitur Utama & Tiket Masuk Terbaru */}
        <div className="lg:col-span-2 space-y-6">
          {/* Pusat Fitur & Akses Cepat Admin */}
          <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Modul 1: Manajemen Tiket */}
              <Link
                href="/admin/tickets"
                className="group p-4 rounded-[12px] border border-[#E2E8F0] bg-white hover:border-[#BFDBFE] hover:shadow-xs transition-all flex items-start gap-3.5"
              >
                <div className="h-10 w-10 rounded-[10px] bg-[#EFF6FF] text-[#1D4ED8] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Ticket className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[14px] font-bold text-[#0F172A] group-hover:text-[#1D4ED8] transition-colors">
                      Manajemen Tiket
                    </span>
                    <ChevronRight className="h-4 w-4 text-[#94A3B8] group-hover:text-[#1D4ED8] transition-colors" />
                  </div>
                  <p className="text-[12px] text-[#64748B] mt-1 line-clamp-2">
                    Daftar tiket, penugasan teknisi, filter status, dan ekspor data CSV
                  </p>
                  <div className="mt-2.5 flex items-center gap-2">
                    {openTicketsCount > 0 ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA]">
                        {openTicketsCount} tiket baru
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#EFF6FF] text-[#1D4ED8]">
                        Semua tertugaskan
                      </span>
                    )}
                  </div>
                </div>
              </Link>

              {/* Modul 2: Kelola Pengguna */}
              <Link
                href="/admin/users"
                className="group p-4 rounded-[12px] border border-[#E2E8F0] bg-white hover:border-[#C7D2FE] hover:shadow-xs transition-all flex items-start gap-3.5"
              >
                <div className="h-10 w-10 rounded-[10px] bg-[#EEF2FF] text-[#4F46E5] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Users className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[14px] font-bold text-[#0F172A] group-hover:text-[#4F46E5] transition-colors">
                      Manajemen Pengguna
                    </span>
                    <ChevronRight className="h-4 w-4 text-[#94A3B8] group-hover:text-[#4F46E5] transition-colors" />
                  </div>
                  <p className="text-[12px] text-[#64748B] mt-1 line-clamp-2">
                    Kelola akun teknisi lapangan, pelanggan, dan staf admin helpdesk
                  </p>
                  <div className="mt-2.5 flex items-center gap-2">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#EEF2FF] text-[#4F46E5]">
                      {technicians.length} Teknisi Lapangan
                    </span>
                  </div>
                </div>
              </Link>

              {/* Modul 3: Laporan SLA */}
              <Link
                href="/admin/reports"
                className="group p-4 rounded-[12px] border border-[#E2E8F0] bg-white hover:border-[#FED7AA] hover:shadow-xs transition-all flex items-start gap-3.5"
              >
                <div className="h-10 w-10 rounded-[10px] bg-[#FFF7ED] text-[#EA580C] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Clock className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[14px] font-bold text-[#0F172A] group-hover:text-[#EA580C] transition-colors">
                      Laporan & Kepatuhan SLA
                    </span>
                    <ChevronRight className="h-4 w-4 text-[#94A3B8] group-hover:text-[#EA580C] transition-colors" />
                  </div>
                  <p className="text-[12px] text-[#64748B] mt-1 line-clamp-2">
                    Pantau durasi penyelesaian tiket dan rasio kepatuhan batas respon
                  </p>
                  <div className="mt-2.5 flex items-center gap-2">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#FFF7ED] text-[#EA580C]">
                      Rata-rata {avgSlaHours} Jam
                    </span>
                  </div>
                </div>
              </Link>

              {/* Modul 4: Analitik CSAT */}
              <Link
                href="/admin/reports#csat"
                className="group p-4 rounded-[12px] border border-[#E2E8F0] bg-white hover:border-[#FDE68A] hover:shadow-xs transition-all flex items-start gap-3.5"
              >
                <div className="h-10 w-10 rounded-[10px] bg-[#FEF3C7] text-[#D97706] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Star className="h-5 w-5 fill-current" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[14px] font-bold text-[#0F172A] group-hover:text-[#D97706] transition-colors">
                      Analitik Kepuasan (CSAT)
                    </span>
                    <ChevronRight className="h-4 w-4 text-[#94A3B8] group-hover:text-[#D97706] transition-colors" />
                  </div>
                  <p className="text-[12px] text-[#64748B] mt-1 line-clamp-2">
                    Evaluasi rating kepuasan pelanggan dan ulasan umpan balik layanan
                  </p>
                  <div className="mt-2.5 flex items-center gap-2">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#FEF3C7] text-[#B45309]">
                      Skor {avgCsat} / 5.0
                    </span>
                  </div>
                </div>
              </Link>
            </div>
          </div>

          {/* Card Tiket Masuk Terbaru */}
          <Card className="border border-[#E2E8F0]/60 bg-white shadow-2xs rounded-[12px] min-h-[460px]">
            <CardHeader className="px-5 pt-3.5 pb-2">
              <CardTitle className="text-[16px] font-bold text-[#0B2A6F] leading-snug">
                Tiket Masuk Terbaru
              </CardTitle>
              <CardDescription className="text-[12px] text-[#64748B] mt-0.5">
                Pantau tahapan penanganan laporan dan kelola penugasan teknisi
              </CardDescription>
            </CardHeader>
            <CardContent className="px-5 pb-5 pt-1">
              <AdminTicketsList
                initialTickets={formattedTickets}
                technicians={technicianOptions}
                limit={3}
              />
            </CardContent>
          </Card>
        </div>

        {/* Kolom Kanan (1 Span): Ringkasan Tiket dan Peta Pengawasan */}
        <div className="lg:col-span-1 space-y-5">
          {/* Ringkasan Tiket Card */}
          <ReportSummaryCard
            title="Ringkasan Tiket"
            historyHref="/admin/tickets"
            totalLabel="Total Tiket"
            totalCount={totalTicketsCount}
            inProgressLabel="Sedang Diproses"
            inProgressCount={openTicketsCount + assignedTicketsCount + inProgressTicketsCount}
            resolvedLabel="Selesai"
            resolvedCount={resolvedTicketsCount}
          />

          {/* Peta Area Pengawasan Card (Konsisten dengan Customer & Teknisi) */}
          <AreaMapCard
            locationTag="Update 15 Jan 2026"
          />
        </div>
      </div>
    </div>
  );
}
