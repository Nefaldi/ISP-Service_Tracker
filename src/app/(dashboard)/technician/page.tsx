import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatDateTime } from "@/lib/utils";
import { CheckCircle, Clock, ArrowRight, AlertTriangle } from "lucide-react";

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
  const techName = session?.user?.name || "Teknisi";
  const isTech = session?.user?.role === "TEKNISI";

  const [assignedCount, inProgressCount, completedCount, activeTasks] = await Promise.all([
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
      where: isTech && techId
        ? {
            technicianId: techId,
            status: { in: ["ASSIGNED", "IN_PROGRESS"] },
          }
        : { status: { in: ["ASSIGNED", "IN_PROGRESS"] } },
      include: {
        customer: { select: { name: true, phone: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <div className="space-y-4">
      {/* Sapaan & Judul */}
      <div>
        <p className="text-[13px] text-[#475569] font-medium">
          Halo, {techName}
        </p>
        <h1 className="text-[24px] font-bold tracking-tight text-[#0F172A]">
          Ikhtisar Pekerjaan
        </h1>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="rounded-[12px] border border-[#BFDBFE] bg-[#EFF6FF] p-3 text-center">
          <Clock className="h-4 w-4 text-[#1D4ED8] mx-auto mb-1" />
          <div className="text-[22px] font-bold text-[#1D4ED8] leading-tight">
            {assignedCount}
          </div>
          <span className="text-[11px] text-[#1E40AF] font-medium">Ditugaskan</span>
        </div>

        <div className="rounded-[12px] border border-[#DDD6FE] bg-[#EDE9FE] p-3 text-center">
          <AlertTriangle className="h-4 w-4 text-[#5B21B6] mx-auto mb-1" />
          <div className="text-[22px] font-bold text-[#5B21B6] leading-tight">
            {inProgressCount}
          </div>
          <span className="text-[11px] text-[#5B21B6] font-medium">Dikerjakan</span>
        </div>

        <div className="rounded-[12px] border border-[#A7F3D0] bg-[#D1FAE5] p-3 text-center">
          <CheckCircle className="h-4 w-4 text-[#065F46] mx-auto mb-1" />
          <div className="text-[22px] font-bold text-[#065F46] leading-tight">
            {completedCount}
          </div>
          <span className="text-[11px] text-[#065F46] font-medium">Selesai</span>
        </div>
      </div>

      {/* Button to tasks page */}
      <div>
        <Link
          href="/technician/tasks"
          className="w-full h-[48px] rounded-[10px] bg-[#1D4ED8] hover:bg-[#1E40AF] text-white text-[15px] font-semibold flex items-center justify-center gap-2 shadow-xs transition-colors"
        >
          <span>Buka Daftar Tugas ({assignedCount + inProgressCount})</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Active Tasks Preview */}
      <div className="pt-2 space-y-3">
        <h2 className="text-[16px] font-semibold text-[#0F172A]">
          Tugas Aktif Terkini
        </h2>

        {activeTasks.length === 0 ? (
          <div className="py-8 text-center rounded-[12px] border border-[#E2E8F0] bg-white p-4">
            <CheckCircle className="h-7 w-7 text-[#047857] mx-auto mb-1.5" />
            <p className="text-[14px] font-semibold text-[#0F172A]">
              Semua tugas telah terselesaikan
            </p>
            <p className="text-[12px] text-[#64748B] mt-0.5">
              Belum ada tugas baru yang ditugaskan kepada Anda.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {activeTasks.map((task) => (
              <Link
                key={task.id}
                href="/technician/tasks"
                className="block rounded-[12px] border border-[#E2E8F0] bg-white p-4 hover:border-[#1D4ED8] transition-colors"
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="font-mono text-xs font-bold text-[#1D4ED8]">
                    #{task.ticketNumber}
                  </span>
                  <StatusBadge status={task.status} />
                </div>
                <h3 className="text-[15px] font-semibold text-[#0F172A] line-clamp-1">
                  {task.title}
                </h3>
                <p className="text-[12px] text-[#64748B] mt-1">
                  {task.customer.name} &bull; {formatDateTime(task.createdAt)}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
