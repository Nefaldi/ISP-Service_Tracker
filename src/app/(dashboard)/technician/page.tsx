import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TechnicianActions } from "@/components/forms/technician-actions";
import { formatDateTime } from "@/lib/utils";
import { Wrench, CheckCircle, Clock, ArrowRight, AlertTriangle } from "lucide-react";

export default async function TechnicianOverviewPage() {
  const session = await auth();
  const techId = session?.user?.id;

  const [assignedCount, inProgressCount, completedCount, activeTasks] = await Promise.all([
    prisma.ticket.count({
      where: { technicianId: techId, status: "ASSIGNED" },
    }),
    prisma.ticket.count({
      where: { technicianId: techId, status: "IN_PROGRESS" },
    }),
    prisma.ticket.count({
      where: { technicianId: techId, status: { in: ["RESOLVED", "CLOSED"] } },
    }),
    prisma.ticket.findMany({
      where: {
        technicianId: techId,
        status: { in: ["ASSIGNED", "IN_PROGRESS"] },
      },
      include: {
        customer: { select: { name: true, phone: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Wrench className="h-6 w-6 text-blue-600" />
            <span>Portal Teknisi Lapangan</span>
          </h1>
          <p className="text-sm text-zinc-500">
            Selamat datang, {session?.user?.name}. Pantau dan kelola penugasan perbaikan Anda.
          </p>
        </div>

        <Link href="/technician/tasks">
          <Button variant="primary" className="gap-2">
            <span>Lihat Semua Tugas</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500">
              Tugas Baru (Assigned)
            </CardTitle>
            <Clock className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{assignedCount}</div>
            <p className="text-xs text-zinc-500 mt-1">Perlu segera dimulai</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500">
              Sedang Dikerjakan
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{inProgressCount}</div>
            <p className="text-xs text-zinc-500 mt-1">Pengerjaan di lokasi</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-emerald-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500">
              Selesai Dikerjakan
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{completedCount}</div>
            <p className="text-xs text-zinc-500 mt-1">Tiket resolved / closed</p>
          </CardContent>
        </Card>
      </div>

      {/* Immediate Tasks List (Mobile-First Cards) */}
      <Card>
        <CardHeader>
          <CardTitle>Tugas Aktif Lapangan ({activeTasks.length})</CardTitle>
          <CardDescription>
            Gunakan tombol aksi untuk mengubah status menjadi In Progress dan Selesaikan Tiket
          </CardDescription>
        </CardHeader>
        <CardContent>
          {activeTasks.length === 0 ? (
            <div className="text-center py-8 text-zinc-500 text-sm">
              Tidak ada tugas aktif saat ini. Anda telah menyelesaikan seluruh penugasan!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeTasks.map((task) => (
                <div
                  key={task.id}
                  className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-xs font-bold text-blue-600">
                        #{task.ticketNumber}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <Badge variant="priority" value={task.priority} />
                        <Badge variant="status" value={task.status} />
                      </div>
                    </div>

                    <h4 className="font-semibold text-zinc-900 dark:text-zinc-100">
                      {task.title}
                    </h4>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2">
                      {task.description}
                    </p>

                    <div className="text-xs text-zinc-500 space-y-0.5 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                      <div>Pelanggan: <span className="font-medium text-zinc-700 dark:text-zinc-300">{task.customer.name}</span> ({task.customer.phone || "-"})</div>
                      <div>Kategori: {task.category}</div>
                      <div>Waktu Lapor: {formatDateTime(task.createdAt)}</div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                    <Link
                      href={`/customer/track/${task.id}`}
                      className="text-xs text-blue-600 hover:underline font-medium"
                    >
                      Detail Pelacak
                    </Link>
                    <TechnicianActions ticketId={task.id} status={task.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
