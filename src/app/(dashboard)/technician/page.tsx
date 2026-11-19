import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TechnicianTasksList } from "@/components/shared/technician-tasks-list";
import { ReportSummaryCard } from "@/components/shared/report-summary-card";
import { AreaMapCard } from "@/components/shared/area-map-card";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Portal Teknisi - Service Tracker",
};

export default async function TechnicianOverviewPage() {
  const session = await auth();
  const dbUser = session?.user?.email
    ? await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true },
      })
    : null;

  const techId = dbUser?.id || session?.user?.id;
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
        </div>
      </div>
    </div>
  );
}
