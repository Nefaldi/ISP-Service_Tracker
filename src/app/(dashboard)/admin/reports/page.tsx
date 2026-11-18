import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, BarChart3, Clock, CheckCircle2, Star, TrendingUp, Users } from "lucide-react";

export const metadata = {
  title: "Laporan & Analitik SLA - Admin Helpdesk",
};

export default async function AdminReportsPage() {
  const [tickets, technicians, feedbacks] = await Promise.all([
    prisma.ticket.findMany({
      include: {
        customer: { select: { name: true } },
        technician: { select: { id: true, name: true } },
        feedback: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.findMany({
      where: { role: "TEKNISI" },
      include: {
        assignedTickets: {
          include: { feedback: true },
        },
      },
    }),
    prisma.feedback.findMany({
      select: { rating: true, comment: true, createdAt: true },
    }),
  ]);

  // Calculations:
  const total = tickets.length;
  const closedTickets = tickets.filter((t) => t.status === "CLOSED" || t.status === "RESOLVED");

  // Calculate Average Resolution Time (SLA in hours)
  let totalResolutionHours = 0;
  let resolvedCount = 0;
  tickets.forEach((t) => {
    if (t.resolvedAt) {
      const hours =
        (new Date(t.resolvedAt).getTime() - new Date(t.createdAt).getTime()) /
        (1000 * 60 * 60);
      totalResolutionHours += hours;
      resolvedCount++;
    }
  });

  const avgSlaHours = resolvedCount > 0 ? (totalResolutionHours / resolvedCount).toFixed(1) : "-";

  // Category Distribution
  const categoryMap: Record<string, number> = {};
  tickets.forEach((t) => {
    categoryMap[t.category] = (categoryMap[t.category] || 0) + 1;
  });

  // CSAT Average & Distribution
  const avgCsat =
    feedbacks.length > 0
      ? (feedbacks.reduce((acc, f) => acc + f.rating, 0) / feedbacks.length).toFixed(1)
      : "0.0";

  const ratingCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  feedbacks.forEach((f) => {
    if (f.rating >= 1 && f.rating <= 5) {
      ratingCounts[f.rating as 1 | 2 | 3 | 4 | 5]++;
    }
  });

  // Technician Performance Matrix
  const techPerformance = technicians.map((tech) => {
    const assignedCount = tech.assignedTickets.length;
    const resolvedTechTickets = tech.assignedTickets.filter(
      (t) => t.status === "RESOLVED" || t.status === "CLOSED"
    );
    const techFeedbacks = tech.assignedTickets
      .map((t) => t.feedback?.rating)
      .filter((r): r is number => typeof r === "number");

    const techAvgRating =
      techFeedbacks.length > 0
        ? (techFeedbacks.reduce((a, b) => a + b, 0) / techFeedbacks.length).toFixed(1)
        : "-";

    return {
      id: tech.id,
      name: tech.name,
      email: tech.email,
      phone: tech.phone,
      totalAssigned: assignedCount,
      completed: resolvedTechTickets.length,
      completionRate:
        assignedCount > 0
          ? Math.round((resolvedTechTickets.length / assignedCount) * 100)
          : 0,
      avgRating: techAvgRating,
    };
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 mb-2"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Kembali ke Overview Admin</span>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-blue-600" />
            <span>Laporan Analitik Kepatuhan SLA & Performa Teknisi</span>
          </h1>
          <p className="text-sm text-zinc-500">
            Rekapitulasi komprehensif efisiensi waktu penanganan gangguan dan kepuasan pelanggan
          </p>
        </div>

        <Link href="/admin/tickets">
          <Badge className="px-3 py-1.5 text-xs bg-blue-50 text-blue-700 border-blue-200">
            Total {total} Tiket Teregistrasi
          </Badge>
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-t-4 border-t-blue-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium uppercase text-zinc-500 flex items-center justify-between">
              <span>Rata-Rata Waktu SLA</span>
              <Clock className="h-4 w-4 text-blue-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
              {avgSlaHours} <span className="text-sm font-normal text-zinc-500">Jam</span>
            </div>
            <p className="text-xs text-zinc-500 mt-1">
              Dari {resolvedCount} tiket yang berhasil diselesaikan
            </p>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-emerald-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium uppercase text-zinc-500 flex items-center justify-between">
              <span>Tingkat Penyelesaian</span>
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-600">
              {total > 0 ? Math.round((closedTickets.length / total) * 100) : 0}%
            </div>
            <p className="text-xs text-zinc-500 mt-1">
              {closedTickets.length} dari {total} tiket terselesaikan
            </p>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-yellow-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium uppercase text-zinc-500 flex items-center justify-between">
              <span>Skor Kepuasan CSAT</span>
              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1">
              <span>{avgCsat}</span>
              <span className="text-sm font-normal text-zinc-500">/ 5.0</span>
            </div>
            <p className="text-xs text-zinc-500 mt-1">
              Berdasarkan {feedbacks.length} ulasan pelanggan
            </p>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-purple-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium uppercase text-zinc-500 flex items-center justify-between">
              <span>Teknisi Aktif</span>
              <Users className="h-4 w-4 text-purple-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">{technicians.length}</div>
            <p className="text-xs text-zinc-500 mt-1">Staf operasional lapangan</p>
          </CardContent>
        </Card>
      </div>

      {/* Technician Performance Matrix */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            <span>Matriks Kinerja & Kecepatan Teknisi Lapangan</span>
          </CardTitle>
          <CardDescription>
            Evaluasi beban kerja, rasio penyelesaian, dan rating kepuasan pelanggan masing-masing teknisi
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-zinc-200 bg-zinc-50/50 text-xs font-semibold uppercase text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/50">
                <tr>
                  <th className="px-4 py-3">Nama Teknisi</th>
                  <th className="px-4 py-3">Kontak</th>
                  <th className="px-4 py-3">Total Ditugaskan</th>
                  <th className="px-4 py-3">Selesai</th>
                  <th className="px-4 py-3">Rasio Penyelesaian</th>
                  <th className="px-4 py-3">Rata-Rata CSAT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {techPerformance.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-zinc-500 text-xs">
                      Belum ada teknisi yang terdaftar di sistem.
                    </td>
                  </tr>
                ) : (
                  techPerformance.map((tech) => (
                    <tr key={tech.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-zinc-900 dark:text-zinc-100">{tech.name}</div>
                        <div className="text-xs text-zinc-500">{tech.email}</div>
                      </td>
                      <td className="px-4 py-3 text-xs text-zinc-600 dark:text-zinc-400">
                        {tech.phone || "-"}
                      </td>
                      <td className="px-4 py-3 font-semibold text-zinc-800 dark:text-zinc-200">
                        {tech.totalAssigned} Tugas
                      </td>
                      <td className="px-4 py-3 text-emerald-600 font-semibold">
                        {tech.completed} Tiket
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 w-24 bg-zinc-200 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                            <div
                              className="bg-emerald-500 h-full rounded-full"
                              style={{ width: `${tech.completionRate}%` }}
                            />
                          </div>
                          <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                            {tech.completionRate}%
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {tech.avgRating !== "-" ? (
                          <div className="inline-flex items-center gap-1 text-xs font-bold text-yellow-600 bg-yellow-50 dark:bg-yellow-950/40 px-2 py-0.5 rounded-full border border-yellow-200 dark:border-yellow-900">
                            <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                            <span>{tech.avgRating} / 5.0</span>
                          </div>
                        ) : (
                          <span className="text-xs text-zinc-400 italic">Belum ada rating</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Category Breakdown & CSAT Distribution Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Distribusi Kategori Masalah Terbanyak</CardTitle>
            <CardDescription>
              Frekuensi pelaporan berdasarkan tipe kerusakan jaringan dan hardware
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(categoryMap).length === 0 ? (
              <p className="text-xs text-zinc-500 py-4 text-center">Belum ada data kategori.</p>
            ) : (
              Object.entries(categoryMap)
                .sort((a, b) => b[1] - a[1])
                .map(([category, count]) => {
                  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                  return (
                    <div key={category} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                        <span>{category}</span>
                        <span>{count} tiket ({pct}%)</span>
                      </div>
                      <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-blue-600 h-full rounded-full transition-all duration-300"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })
            )}
          </CardContent>
        </Card>

        {/* CSAT Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Distribusi Bintang Kepuasan (CSAT)</CardTitle>
            <CardDescription>
              Penilaian kualitas penyelesaian oleh pelanggan yang telah menutup tiket
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[5, 4, 3, 2, 1].map((stars) => {
              const count = ratingCounts[stars as 1 | 2 | 3 | 4 | 5];
              const pct = feedbacks.length > 0 ? Math.round((count / feedbacks.length) * 100) : 0;
              return (
                <div key={stars} className="flex items-center gap-3 text-xs">
                  <div className="flex items-center gap-1 w-20 font-semibold text-zinc-700 dark:text-zinc-300">
                    <span>{stars}</span>
                    <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                  </div>
                  <div className="flex-1 bg-zinc-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-yellow-400 h-full rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-16 text-right font-medium text-zinc-500">
                    {count} ({pct}%)
                  </span>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
