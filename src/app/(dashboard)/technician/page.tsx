import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TechnicianTasksList } from "@/components/shared/technician-tasks-list";
import { ReportSummaryCard } from "@/components/shared/report-summary-card";
import { AreaMapCard } from "@/components/shared/area-map-card";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Wrench, Phone, Mail, ShieldCheck } from "lucide-react";

export const metadata = {
  title: "Portal Teknisi - Service Tracker",
};

export default async function TechnicianOverviewPage() {
  const session = await auth();
  const dbUser = session?.user?.email
    ? await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true, name: true, email: true, phone: true },
      })
    : null;

  const techId = dbUser?.id || session?.user?.id;
  const techUser = dbUser || session?.user;
  const isTech = session?.user?.role === "TEKNISI";

  const [assignedCount, inProgressCount, completedCount, tasks] = await Promise.all([
    prisma.ticket.count({
      where: isTech && techId ? { technicianId: techId, status: "ASSIGNED" } : { status: "ASSIGNED" },
    }),
    prisma.ticket.count({
      where: isTech && techId ? { technicianId: techId, status: "IN_PROGRESS" } : { status: "IN_PROGRESS" },
    }),
    prisma.ticket.count({
      where: isTech && techId
        ? { technicianId: techId, status: { in: ["RESOLVED", "CLOSED"] } }
        : { status: { in: ["RESOLVED", "CLOSED"] } },
    }),
    prisma.ticket.findMany({
      where: isTech && techId ? { technicianId: techId } : {},
      include: {
        customer: { select: { name: true, phone: true } },
        logs: {
          where: { action: "ASSIGNED" },
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { notes: true, user: { select: { name: true } } },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const formattedTasks = tasks.map((task) => ({
    id: task.id,
    ticketNumber: task.ticketNumber,
    title: task.title,
    description: task.description,
    status: task.status,
    priority: task.priority,
    category: task.category,
    damagePhotoUrl: task.damagePhotoUrl,
    resolvedPhotoUrl: task.resolvedPhotoUrl,
    resolutionNotes: task.resolutionNotes,
    createdAt: task.createdAt,
    resolvedAt: task.resolvedAt,
    customer: task.customer,
    adminNotes: task.logs[0]?.notes || null,
  }));

  return (
    <div className="w-full">
      {/* 2-Column Responsive Layout consistent with Customer Dashboard & Reference UI */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column (Wide 2 spans): Tugas Terakhir Anda */}
        <div className="lg:col-span-2">
          <Card className="border border-[#E2E8F0]/60 bg-white shadow-2xs rounded-[12px] min-h-[460px]">
            <CardHeader className="px-5 pt-3.5 pb-2">
              <CardTitle className="text-[16px] font-bold text-[#0B2A6F] leading-snug">
                Tugas Terakhir Anda
              </CardTitle>
              <CardDescription className="text-[12px] text-[#64748B] mt-0.5">
                Pantau tahapan penanganan tugas lapangan Anda
              </CardDescription>
            </CardHeader>
            <CardContent className="px-5 pb-5 pt-1">
              <TechnicianTasksList initialTasks={formattedTasks} limit={3} />
            </CardContent>
          </Card>
        </div>

        {/* Right Column (1 span): Ringkasan Tugas & Peta Area Pengawasan */}
        <div className="lg:col-span-1 space-y-5">
          {/* Ringkasan Tugas */}
          <ReportSummaryCard
            title="Ringkasan Tugas"
            historyHref="/technician/tasks"
            totalLabel="Total Tugas"
            totalCount={tasks.length}
            inProgressLabel="Sedang Diproses"
            inProgressCount={assignedCount + inProgressCount}
            resolvedLabel="Selesai"
            resolvedCount={completedCount}
          />

          {/* Peta Area Pengawasan */}
          <AreaMapCard
            locationTag="Update 15 Jan 2026"
          />

          {/* Profil Teknisi */}
          <Card className="border border-[#E2E8F0]/60 bg-white shadow-2xs rounded-[12px]">
            <CardHeader className="py-2.5 px-4 border-b border-[#F1F5F9]">
              <div className="flex items-center justify-between">
                <CardTitle className="text-[14px] font-bold text-[#0B2A6F] flex items-center gap-2">
                  <Wrench className="h-4 w-4 text-[#1D4ED8]" />
                  <span>Profil Pelaksana</span>
                </CardTitle>
                <Link
                  href="/technician/profile"
                  className="text-[12px] font-medium text-[#1D4ED8] hover:underline"
                >
                  Kelola
                </Link>
              </div>
            </CardHeader>
            <CardContent className="p-3.5 space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-[#EDE9FE] text-[#5B21B6] flex items-center justify-center font-bold text-sm border border-[#DDD6FE] shrink-0">
                  <Wrench className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-[14px] text-[#0F172A] truncate">
                    {techUser?.name || "Teknisi Jaringan"}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="inline-flex items-center gap-1 px-2 py-0.2 text-[11px] font-semibold bg-[#EDE9FE] text-[#5B21B6] rounded-full border border-[#DDD6FE]">
                      <ShieldCheck className="h-3 w-3" />
                      <span>Teknisi Lapangan</span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-[#F1F5F9] space-y-1.5 text-[12px] text-[#64748B]">
                <div className="flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5 text-[#64748B] shrink-0" />
                  <span className="truncate">{techUser?.email || "teknisi@tracker.com"}</span>
                </div>
                {techUser?.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5 text-[#64748B] shrink-0" />
                    <span>{techUser.phone}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
