import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TechnicianActions } from "@/components/forms/technician-actions";
import { formatDateTime } from "@/lib/utils";
import { ArrowLeft, Wrench, ExternalLink } from "lucide-react";

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
          Riwayat lengkap penugasan perbaikan jaringan dan hardware helpdesk
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tasks.length === 0 ? (
          <div className="col-span-full py-12 text-center text-sm text-zinc-500">
            Belum ada tugas yang dialokasikan kepada Anda.
          </div>
        ) : (
          tasks.map((task) => (
            <Card key={task.id} className="flex flex-col justify-between">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
                    #{task.ticketNumber}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <Badge variant="priority" value={task.priority} />
                    <Badge variant="status" value={task.status} />
                  </div>
                </div>
                <CardTitle className="text-base mt-2 line-clamp-1">{task.title}</CardTitle>
                <CardDescription className="line-clamp-2 text-xs">
                  {task.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4 pt-0">
                <div className="text-xs text-zinc-500 space-y-1 rounded-lg bg-zinc-50 dark:bg-zinc-900 p-2.5">
                  <div>Pelanggan: <span className="font-semibold text-zinc-800 dark:text-zinc-200">{task.customer.name}</span></div>
                  <div>Kontak: {task.customer.phone || "-"}</div>
                  <div>Kategori: {task.category}</div>
                  <div>Dilaporkan: {formatDateTime(task.createdAt)}</div>
                  {task.resolvedAt && (
                    <div className="text-emerald-600 dark:text-emerald-400 font-medium">
                      Diselesaikan: {formatDateTime(task.resolvedAt)}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800">
                  <Link
                    href={`/customer/track/${task.id}`}
                    className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium"
                  >
                    <span>Tracker</span>
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                  <TechnicianActions ticketId={task.id} status={task.status} />
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
