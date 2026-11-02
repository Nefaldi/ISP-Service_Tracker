import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { AdminTicketsTable } from "@/components/shared/admin-tickets-table";
import { ArrowLeft, Ticket } from "lucide-react";

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
            Pencarian, filter status/prioritas, penugasan teknisi, dan export rekap SLA
          </p>
        </div>
      </div>

      <AdminTicketsTable initialTickets={tickets} technicians={technicians} />
    </div>
  );
}
