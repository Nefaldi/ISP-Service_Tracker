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
    <div className="space-y-6">
      {/* Page Title (Consistent with Customer Portal) */}
      <div>
        <h1 className="text-[28px] font-bold tracking-tight text-[#0F172A]">
          Portal Teknisi Lapangan
        </h1>
        <p className="text-[14px] text-[#475569] mt-1">
          Pantau penugasan tiket, kelola progres pengerjaan di lapangan, dan laporkan bukti penyelesaian perbaikan secara real-time
        </p>
      </div>

      {/* 2-Column Responsive Layout (Consistent with Customer Portal & Reference UI) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left / Main Column: Task List */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="pb-3 border-b border-[#E2E8F0] mb-4">
              <CardTitle className="text-[18px]">
                Tugas Terakhir Anda ({tasks.length})
              </CardTitle>
              <CardDescription className="text-[14px]">
                Pantau tahapan penanganan tugas lapangan Anda
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TechnicianTasksList initialTasks={formattedTasks} />
            </CardContent>
          </Card>
        </div>

        {/* Right / Sidebar Column: Summary, Map, & Profile */}
        <div className="lg:col-span-1 space-y-5">
          {/* Ringkasan Tugas (Consistent with Reference UI) */}
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

          {/* Peta Area Pengawasan (Consistent with Reference UI) */}
          <AreaMapCard
            locationTag="Fakultas Teknik"
            subtitle="Wilayah Distribusi Jaringan FO Kampus"
          />

          {/* Technician Profile Card */}
          <Card>
            <CardHeader className="pb-3 border-b border-[#E2E8F0]">
              <CardTitle className="text-[16px] font-bold text-[#0F172A] flex items-center gap-2">
                <Wrench className="h-4 w-4 text-[#1D4ED8]" />
                <span>Profil Teknisi</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-3.5">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-full bg-[#EDE9FE] text-[#5B21B6] flex items-center justify-center font-bold text-base border border-[#DDD6FE] shrink-0">
                  <Wrench className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-[15px] text-[#0F172A] truncate">
                    {techUser?.name || "Teknisi Jaringan"}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#EDE9FE] text-[#5B21B6] border border-[#DDD6FE]">
                      <ShieldCheck className="h-3 w-3" />
                      <span>Teknisi Lapangan</span>
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#D1FAE5] text-[#065F46] border border-[#A7F3D0]">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#059669]"></span>
                      <span>Aktif</span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-[#E2E8F0] space-y-2 text-[13px] text-[#475569]">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-[#64748B] shrink-0" />
                  <span className="truncate">{techUser?.email || "teknisi@tracker.com"}</span>
                </div>
                {techUser?.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-[#64748B] shrink-0" />
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
