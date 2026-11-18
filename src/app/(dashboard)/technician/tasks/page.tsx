import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TechnicianTasksList } from "@/components/shared/technician-tasks-list";
import { ArrowLeft, Wrench } from "lucide-react";

export const metadata = {
  title: "Daftar Tugas Teknisi - Helpdesk",
};

export default async function TechnicianTasksPage() {
  const session = await auth();
  const techId = session?.user?.id;

  const tasks = await prisma.ticket.findMany({
    where: { technicianId: techId },
    include: {
      customer: { select: { name: true, phone: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/technician"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 mb-2"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Kembali ke Overview Teknisi</span>
        </Link>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
          <Wrench className="h-6 w-6 text-blue-600" />
          <span>Daftar Seluruh Tugas Teknisi ({tasks.length})</span>
        </h1>
        <p className="text-sm text-zinc-500">
          Kelola penugasan, hubungi pelanggan langsung via WhatsApp/Telpon, dan selesaikan tiket
        </p>
      </div>

      <TechnicianTasksList initialTasks={tasks} />
    </div>
  );
}
