import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CreateTicketForm } from "@/components/forms/create-ticket-form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/utils";
import { ArrowRight, UserCheck } from "lucide-react";

export default async function CustomerPortalPage() {
  const session = await auth();
  const customerId = session?.user?.id;

  const tickets = await prisma.ticket.findMany({
    where: { customerId },
    include: {
      technician: { select: { name: true, phone: true } },
      feedback: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
          <UserCheck className="h-6 w-6 text-emerald-600" />
          <span>Portal Pelanggan & Helpdesk</span>
        </h1>
        <p className="text-sm text-zinc-500">
          Laporkan kendala jaringan atau layanan Anda dan pantau status perbaikannya secara real-time
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Form Laporan Baru */}
        <div className="lg:col-span-1">
          <CreateTicketForm />
        </div>

        {/* Right Column: Riwayat Tiket Pelanggan */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Riwayat Tiket Pelaporan Anda ({tickets.length})</CardTitle>
              <CardDescription>
                Klik pada tiket untuk melihat Live Tracker status perbaikan langsung via SSE
              </CardDescription>
            </CardHeader>
            <CardContent>
              {tickets.length === 0 ? (
                <div className="text-center py-10 text-sm text-zinc-500">
                  Anda belum memiliki laporan tiket. Silakan buat laporan baru melalui formulir di samping.
                </div>
              ) : (
                <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {tickets.map((t) => (
                    <div
                      key={t.id}
                      className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 rounded-lg px-2 transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-blue-600">
                            #{t.ticketNumber}
                          </span>
                          <Badge variant="priority" value={t.priority} />
                          <Badge variant="status" value={t.status} />
                        </div>
                        <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">
                          {t.title}
                        </h4>
                        <p className="text-xs text-zinc-500">
                          {t.category} • Dilaporkan {formatDateTime(t.createdAt)}
                        </p>
                        {t.technician && (
                          <p className="text-xs text-blue-600 font-medium">
                            Teknisi Bertugas: {t.technician.name}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        <Link
                          href={`/customer/track/${t.id}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-950/50 dark:text-blue-300 dark:hover:bg-blue-900/50 text-xs font-semibold transition-colors"
                        >
                          <span>Live Tracker</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
