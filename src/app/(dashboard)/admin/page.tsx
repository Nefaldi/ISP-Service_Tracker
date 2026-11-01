import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/utils";
import { Ticket, Clock, Star, ArrowRight, ShieldCheck, Activity } from "lucide-react";

export default async function AdminDashboardPage() {
  // Aggregate statistics using Prisma
  const [totalTickets, openTickets, inProgressTickets, resolvedTickets, feedbacks, recentLogs] =
    await Promise.all([
      prisma.ticket.count(),
      prisma.ticket.count({ where: { status: "OPEN" } }),
      prisma.ticket.count({ where: { status: "IN_PROGRESS" } }),
      prisma.ticket.count({ where: { status: { in: ["RESOLVED", "CLOSED"] } } }),
      prisma.feedback.aggregate({
        _avg: { rating: true },
        _count: { rating: true },
      }),
      prisma.ticketLog.findMany({
        take: 6,
        orderBy: { createdAt: "desc" },
        include: {
          ticket: { select: { ticketNumber: true, title: true } },
          user: { select: { name: true, role: true } },
        },
      }),
    ]);

  const avgRating = feedbacks._avg.rating ? feedbacks._avg.rating.toFixed(1) : "0.0";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <ShieldCheck className="h-7 w-7 text-purple-600" />
            <span>Dashboard Admin Helpdesk</span>
          </h1>
          <p className="text-sm text-zinc-500">
            Monitoring performa SLA, penugasan teknisi, dan alur siklus hidup tiket
          </p>
        </div>
        <Link href="/admin/tickets">
          <Button variant="primary" className="gap-2">
            <span>Kelola Semua Tiket</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500">
              Total Tiket Masuk
            </CardTitle>
            <Ticket className="h-4 w-4 text-zinc-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTickets}</div>
            <p className="text-xs text-zinc-500 mt-1">{resolvedTickets} tiket terselesaikan</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500">
              Perlu Penugasan (Open)
            </CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{openTickets}</div>
            <p className="text-xs text-zinc-500 mt-1">Menunggu penugasan teknisi</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500">
              Sedang Dikerjakan
            </CardTitle>
            <Activity className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{inProgressTickets}</div>
            <p className="text-xs text-zinc-500 mt-1">Teknisi aktif di lapangan</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500">
              Kepuasan CSAT
            </CardTitle>
            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
              <span>{avgRating}</span>
              <span className="text-sm font-normal text-zinc-500">/ 5.0</span>
            </div>
            <p className="text-xs text-zinc-500 mt-1">
              Dari {feedbacks._count.rating} ulasan pelanggan
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Activity Audit Logs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-zinc-600" />
            <span>Audit Trail & Histori Log Tiket Terbaru</span>
          </CardTitle>
          <CardDescription>
            Pencatatan kepatuhan SLA dan aktivitas penanganan perbaikan sistem
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {recentLogs.length === 0 ? (
              <p className="text-sm text-zinc-500 py-4 text-center">
                Belum ada aktivitas tercatat di sistem.
              </p>
            ) : (
              recentLogs.map((log) => (
                <div key={log.id} className="py-3 flex items-start justify-between gap-4">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-blue-600">
                        #{log.ticket.ticketNumber}
                      </span>
                      <Badge variant="default" className="text-[10px] py-0 px-2 uppercase">
                        {log.action}
                      </Badge>
                      <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                        {log.user.name} ({log.user.role})
                      </span>
                    </div>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400">
                      {log.notes || "Aktivitas diperbarui"}
                    </p>
                  </div>
                  <span className="text-xs text-zinc-400 shrink-0">
                    {formatDateTime(log.createdAt)}
                  </span>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
