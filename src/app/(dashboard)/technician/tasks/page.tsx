import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TechnicianTasksList } from "@/components/shared/technician-tasks-list";

export const metadata = {
  title: "Tugas Hari Ini - Service Tracker Teknisi",
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
  const techName = session?.user?.name || "Teknisi";

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
    <div className="space-y-4">
      {/* Sapaan kecil & Judul "Tugas hari ini" (24px) - UI_CONTEXT 4.4 */}
      <div>
        <p className="text-[13px] text-[#475569] font-medium">
          Halo, {techName}
        </p>
        <h1 className="text-[24px] font-bold tracking-tight text-[#0F172A]">
          Tugas hari ini
        </h1>
      </div>

      <TechnicianTasksList initialTasks={formattedTasks} />
    </div>
  );
}
