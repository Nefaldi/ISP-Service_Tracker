import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AssignTechnicianDialog } from "@/components/forms/assign-technician-dialog";
import { formatDateTime } from "@/lib/utils";
import { ArrowLeft, ExternalLink, Ticket } from "lucide-react";

export default async function AdminTicketsPage() {
  const [tickets, technicians] = await Promise.all([
    prisma.ticket.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        customer: { select: { id: true, name: true, email: true, phone: true } },
        technician: { select: { id: true, name: true, email: true, phone: true } },
        feedback: true,
      },
    }),
    prisma.user.findMany({
      where: { role: "TEKNISI" },
      select: { id: true, name: true, email: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 mb-2"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Kembali ke Overview</span>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Ticket className="h-6 w-6 text-blue-600" />
            <span>Manajemen Tiket Helpdesk</span>
          </h1>
          <p className="text-sm text-zinc-500">
            Daftar seluruh tiket layanan dan penugasan teknisi lapangan
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Tiket Layanan ({tickets.length})</CardTitle>
          <CardDescription>
            Pilih teknisi untuk memperbarui status tiket dari Open menjadi Assigned
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-zinc-200 bg-zinc-50/50 text-xs font-semibold uppercase text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/50">
                <tr>
                  <th className="px-4 py-3">No. Tiket & Masalah</th>
                  <th className="px-4 py-3">Pelanggan</th>
                  <th className="px-4 py-3">Prioritas</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Penugasan Teknisi</th>
                  <th className="px-4 py-3">Dibuat</th>
                  <th className="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {tickets.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-zinc-500">
                      Belum ada tiket bantuan yang dilaporkan.
                    </td>
                  </tr>
                ) : (
                  tickets.map((t) => (
                    <tr key={t.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
                          #{t.ticketNumber}
                        </div>
                        <div className="font-semibold text-zinc-900 dark:text-zinc-100 line-clamp-1">
                          {t.title}
                        </div>
                        <div className="text-xs text-zinc-500">{t.category}</div>
                      </td>

                      <td className="px-4 py-3">
                        <div className="font-medium text-zinc-800 dark:text-zinc-200">
                          {t.customer.name}
                        </div>
                        <div className="text-xs text-zinc-500">{t.customer.email}</div>
                      </td>

                      <td className="px-4 py-3">
                        <Badge variant="priority" value={t.priority} />
                      </td>

                      <td className="px-4 py-3">
                        <Badge variant="status" value={t.status} />
                      </td>

                      <td className="px-4 py-3">
                        {t.status === "CLOSED" ? (
                          <span className="text-xs text-zinc-500">
                            {t.technician?.name || "Selesai"}
                          </span>
                        ) : (
                          <AssignTechnicianDialog
                            ticketId={t.id}
                            currentTechnicianId={t.technicianId}
                            technicians={technicians}
                          />
                        )}
                      </td>

                      <td className="px-4 py-3 text-xs text-zinc-500 whitespace-nowrap">
                        {formatDateTime(t.createdAt)}
                      </td>

                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/customer/track/${t.id}`}
                          className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium"
                        >
                          <span>Tracker</span>
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
