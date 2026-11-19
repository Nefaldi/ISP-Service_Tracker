import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TechnicianTasksList } from "@/components/shared/technician-tasks-list";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Daftar Tugas Lapangan - Service Tracker Teknisi",
};

export default async function TechnicianTasksPage() {
  const session = await auth();
  const dbUser = session?.user?.email
    ? await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true },
      })
    : null;
  const techId = dbUser?.id || session?.user?.id;

  const isTech = session?.user?.role === "TEKNISI";
  const whereClause = isTech && techId ? { technicianId: techId } : {};

  const tasks = await prisma.ticket.findMany({
    where: whereClause,
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
  });

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
      <div>
        <Link
          href="/technician"
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#475569] hover:text-[#0F172A] mb-2 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Kembali ke Portal Teknisi</span>
        </Link>
        <h1 className="text-[28px] font-bold tracking-tight text-[#0F172A]">
          Daftar Tugas Perbaikan Lapangan
        </h1>
        <p className="text-[14px] text-[#475569] mt-1">
          Kelola seluruh tugas perbaikan jaringan yang ditugaskan kepada Anda secara terperinci
        </p>
      </div>

      <Card className="border border-[#E2E8F0]/60 bg-white shadow-2xs rounded-[12px]">
        <CardHeader className="px-5 pt-3.5 pb-2 border-b border-[#F1F5F9]">
          <CardTitle className="text-[16px] font-bold text-[#0B2A6F] leading-snug">
            Semua Tugas Lapangan
          </CardTitle>
          <CardDescription className="text-[12px] text-[#64748B] mt-0.5">
            Gunakan filter status atau kotak pencarian untuk menemukan tiket dengan cepat
          </CardDescription>
        </CardHeader>
        <CardContent className="px-5 pb-5 pt-3">
          <TechnicianTasksList initialTasks={formattedTasks} />
        </CardContent>
      </Card>
    </div>
  );
}
