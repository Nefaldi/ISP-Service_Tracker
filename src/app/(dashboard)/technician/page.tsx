import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TechnicianTasksList } from "@/components/shared/technician-tasks-list";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Wrench,
  Clock,
  AlertTriangle,
  CheckCircle,
  Phone,
  Mail,
  ShieldCheck,
  Info,
} from "lucide-react";

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

      {/* 2-Column Responsive Layout (Consistent with Customer Portal) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column: Profile Card, Metrics, and SLA Guide */}
        <div className="lg:col-span-1 space-y-5">
          {/* Technician Profile Card */}
          <Card>
            <CardHeader className="pb-3 border-b border-[#E2E8F0] mb-3">
              <CardTitle className="text-[17px] flex items-center gap-2">
                <Wrench className="h-5 w-5 text-[#1D4ED8]" />
                <span>Profil Teknisi Lapangan</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3.5">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-[#EDE9FE] text-[#5B21B6] flex items-center justify-center font-bold text-lg border border-[#DDD6FE]">
                  <Wrench className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-[16px] text-[#0F172A]">
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

          {/* 3 Metric Summary Cards */}
          <div className="grid grid-cols-3 gap-2.5">
            <div className="rounded-[12px] border border-[#BFDBFE] bg-[#EFF6FF] p-3 text-center shadow-xs">
              <Clock className="h-4 w-4 text-[#1D4ED8] mx-auto mb-1" />
              <div className="text-[24px] font-bold text-[#1D4ED8] leading-tight">
                {assignedCount}
              </div>
              <span className="text-[11px] text-[#1E40AF] font-semibold block mt-0.5">
                Ditugaskan
              </span>
            </div>

            <div className="rounded-[12px] border border-[#DDD6FE] bg-[#EDE9FE] p-3 text-center shadow-xs">
              <AlertTriangle className="h-4 w-4 text-[#5B21B6] mx-auto mb-1" />
              <div className="text-[24px] font-bold text-[#5B21B6] leading-tight">
                {inProgressCount}
              </div>
              <span className="text-[11px] text-[#5B21B6] font-semibold block mt-0.5">
                Dikerjakan
              </span>
            </div>

            <div className="rounded-[12px] border border-[#A7F3D0] bg-[#D1FAE5] p-3 text-center shadow-xs">
              <CheckCircle className="h-4 w-4 text-[#065F46] mx-auto mb-1" />
              <div className="text-[24px] font-bold text-[#065F46] leading-tight">
                {completedCount}
              </div>
              <span className="text-[11px] text-[#065F46] font-semibold block mt-0.5">
                Selesai
              </span>
            </div>
          </div>

          {/* SLA Standard Reference Card */}
          <Card className="bg-[#F8FAFC]">
            <CardHeader className="pb-2">
              <CardTitle className="text-[15px] flex items-center gap-2 text-[#0F172A]">
                <Info className="h-4 w-4 text-[#1D4ED8]" />
                <span>Target Waktu Layanan (SLA)</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-[#E2E8F0]">
                <span className="font-semibold text-[#DC2626]">Critical (Mendesak)</span>
                <span className="font-mono font-bold text-[#0F172A]">2 Jam</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-[#E2E8F0]">
                <span className="font-semibold text-[#EA580C]">High (Penting)</span>
                <span className="font-mono font-bold text-[#0F172A]">4 Jam</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-[#E2E8F0]">
                <span className="font-semibold text-[#D97706]">Medium (Standar)</span>
                <span className="font-mono font-bold text-[#0F172A]">8 Jam</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="font-semibold text-[#2563EB]">Low (Normal)</span>
                <span className="font-mono font-bold text-[#0F172A]">24 Jam</span>
              </div>
              <p className="text-[11px] text-[#64748B] pt-1">
                Pastikan mengunggah foto bukti kerja sebelum menandai tiket selesai.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Main Task List */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="pb-3 border-b border-[#E2E8F0] mb-4">
              <CardTitle className="text-[18px]">
                Daftar Tugas Perbaikan ({tasks.length})
              </CardTitle>
              <CardDescription className="text-[14px]">
                Kelola penugasan tiket lapangan, hubungi pelanggan, dan laporkan penyelesaian perbaikan
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TechnicianTasksList initialTasks={formattedTasks} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
