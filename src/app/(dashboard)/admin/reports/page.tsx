import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, Clock, CheckCircle2, Star, Users } from "lucide-react";

export const metadata = {
  title: "Laporan SLA & CSAT - Service Tracker Admin",
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
      : "5.0";

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
      {/* Header */}
      <div>
        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#475569] hover:text-[#0F172A] mb-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Kembali ke Ikhtisar</span>
        </Link>
        <h1 className="text-[28px] font-bold tracking-tight text-[#0F172A]">
          Laporan Kepatuhan SLA & Analitik CSAT
        </h1>
        <p className="text-[14px] text-[#475569] mt-1">
          Rekapitulasi durasi penanganan gangguan, performa teknisi lapangan, dan skor kepuasan pelanggan
        </p>
      </div>

      {/* 4 Summary Cards (Grid auto-fit min 180px, angka 32px bold - UI_CONTEXT 2) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-[14px] font-medium text-[#475569]">
              Rata-rata Waktu SLA
            </span>
            <div className="h-8 w-8 rounded-full bg-[#EFF6FF] text-[#1D4ED8] flex items-center justify-center">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-[32px] font-bold text-[#0F172A] leading-none">
              {avgSlaHours} <span className="text-[16px] text-[#64748B] font-normal">Jam</span>
            </div>
            <p className="text-[13px] text-[#64748B] mt-1.5">
              Dari {resolvedCount} tiket yang diselesaikan
            </p>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-[14px] font-medium text-[#475569]">
              Tingkat Penyelesaian
            </span>
            <div className="h-8 w-8 rounded-full bg-[#DBEAFE] text-[#1D4ED8] flex items-center justify-center">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-[32px] font-bold text-[#0F172A] leading-none">
              {total > 0 ? Math.round((closedTickets.length / total) * 100) : 0}%
            </div>
            <p className="text-[13px] text-[#64748B] mt-1.5">
              {closedTickets.length} dari {total} tiket selesai
            </p>
          </div>
        </Card>

        <Card className="p-5 bg-[#EFF6FF] border-[#BFDBFE]">
          <div className="flex items-center justify-between">
            <span className="text-[14px] font-medium text-[#1D4ED8]">
              Skor Kepuasan CSAT
            </span>
            <div className="h-8 w-8 rounded-full bg-[#FEF3C7] text-[#B45309] flex items-center justify-center">
              <Star className="h-4 w-4 fill-current" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-[32px] font-bold text-[#1D4ED8] leading-none">
              {avgCsat} <span className="text-[16px] text-[#1E40AF] font-normal">/ 5.0</span>
            </div>
            <p className="text-[13px] text-[#1E40AF] mt-1.5">
              Dari {feedbacks.length} feedback pelanggan
            </p>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-[14px] font-medium text-[#475569]">
              Teknisi Aktif
            </span>
            <div className="h-8 w-8 rounded-full bg-[#EDE9FE] text-[#5B21B6] flex items-center justify-center">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-[32px] font-bold text-[#0F172A] leading-none">
              {technicians.length}
            </div>
            <p className="text-[13px] text-[#64748B] mt-1.5">
              Staf teknisi lapangan terdaftar
            </p>
          </div>
        </Card>
      </div>

      {/* Grid: Matriks Performa Teknisi & Distribusi Rating CSAT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Matriks Performa Teknisi (Span 2) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-[12px] border border-[#E2E8F0] bg-white overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-[#E2E8F0]">
              <h2 className="text-[18px] font-semibold text-[#0F172A]">
                Matriks Produktivitas Teknisi
              </h2>
              <p className="text-[14px] text-[#475569] mt-0.5">
                Beban penugasan, persentase keberhasilan perbaikan, dan skor kepuasan individu
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
                    <th className="py-3 px-4 text-[13px] font-medium text-[#475569]">
                      Nama Teknisi
                    </th>
                    <th className="py-3 px-4 text-[13px] font-medium text-[#475569] text-center">
                      Ditugaskan
                    </th>
                    <th className="py-3 px-4 text-[13px] font-medium text-[#475569] text-center">
                      Terselesaikan
                    </th>
                    <th className="py-3 px-4 text-[13px] font-medium text-[#475569] text-center">
                      Rasio Sukses
                    </th>
                    <th className="py-3 px-4 text-[13px] font-medium text-[#475569] text-right">
                      Rata-rata Rating
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  {techPerformance.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-sm text-[#64748B]">
                        Belum ada staf teknisi yang terdaftar.
                      </td>
                    </tr>
                  ) : (
                    techPerformance.map((tech) => (
                      <tr key={tech.id} className="hover:bg-[#F8FAFC]">
                        <td className="py-3.5 px-4">
                          <span className="font-semibold text-[14px] text-[#0F172A] block">
                            {tech.name}
                          </span>
                          <span className="text-[12px] text-[#64748B]">
                            {tech.email}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center text-[14px] font-medium text-[#0F172A]">
                          {tech.totalAssigned}
                        </td>
                        <td className="py-3.5 px-4 text-center text-[14px] font-semibold text-[#1D4ED8]">
                          {tech.completed}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-semibold bg-[#EFF6FF] text-[#1D4ED8]">
                            {tech.completionRate}%
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="inline-flex items-center gap-1 font-semibold text-[14px] text-[#0F172A]">
                            <Star className="h-4 w-4 text-[#F59E0B] fill-[#F59E0B]" />
                            <span>{tech.avgRating}</span>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* CSAT Rating Breakdown Card */}
        <div id="csat" className="space-y-6">
          <Card>
            <CardHeader className="border-b border-[#E2E8F0] pb-3 mb-4">
              <CardTitle className="text-[18px]">Distribusi Bintang CSAT</CardTitle>
              <CardDescription className="text-[14px]">
                Sebaran penilaian kepuasan dari pelanggan yang telah memverifikasi tiket
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = ratingCounts[star as 1 | 2 | 3 | 4 | 5];
                const pct = feedbacks.length > 0 ? Math.round((count / feedbacks.length) * 100) : 0;

                return (
                  <div key={star} className="flex items-center gap-3">
                    <div className="flex items-center gap-1 w-16 text-[13px] font-medium text-[#0F172A]">
                      <span>{star}</span>
                      <Star className="h-3.5 w-3.5 text-[#F59E0B] fill-[#F59E0B]" />
                    </div>
                    <div className="flex-1 h-2 rounded-full bg-[#E2E8F0] overflow-hidden">
                      <div
                        className="h-full bg-[#F59E0B] rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="w-12 text-right text-[12px] text-[#64748B]">
                      {count} ({pct}%)
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Breakdown Kategori Tiket */}
          <Card>
            <CardHeader className="border-b border-[#E2E8F0] pb-3 mb-4">
              <CardTitle className="text-[18px]">Breakdown Kategori Gangguan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {Object.entries(categoryMap).map(([cat, count]) => {
                const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                return (
                  <div key={cat} className="space-y-1">
                    <div className="flex items-center justify-between text-[13px]">
                      <span className="font-medium text-[#0F172A]">{cat}</span>
                      <span className="text-[#64748B]">
                        {count} ({pct}%)
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-[#E2E8F0] overflow-hidden">
                      <div
                        className="h-full bg-[#1D4ED8] rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
