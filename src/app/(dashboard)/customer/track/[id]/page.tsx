import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { TicketStepper } from "@/components/shared/ticket-stepper";
import { CustomerReviewCard } from "@/components/forms/customer-review-card";
import { formatDateTime } from "@/lib/utils";
import {
  ArrowLeft,
  Clock,
  Wrench,
  Plus,
  Phone,
  ImageIcon,
} from "lucide-react";

interface TrackPageProps {
  params: Promise<{ id: string }>;
}

function formatLogAction(action: string): string {
  switch (action) {
    case "CREATED":
      return "Tiket Pelaporan Dibuat";
    case "ASSIGNED":
      return "Teknisi Ditugaskan";
    case "IN_PROGRESS":
    case "STATUS_CHANGE":
      return "Pengerjaan Dimulai di Lapangan";
    case "RESOLVED":
      return "Perbaikan Diselesaikan";
    case "CLOSED":
      return "Tiket Ditutup & Ulasan Diberikan";
    default:
      return action;
  }
}

export default async function CustomerTrackTicketPage({ params }: TrackPageProps) {
  const [resolvedParams, session] = await Promise.all([
    params,
    auth(),
  ]);
  const id = resolvedParams.id;

  const ticket = await prisma.ticket.findUnique({
    where: { id },
    include: {
      customer: { select: { id: true, name: true, email: true, phone: true } },
      technician: { select: { id: true, name: true, email: true, phone: true } },
      logs: {
        orderBy: { createdAt: "desc" },
        include: { user: { select: { name: true, role: true } } },
      },
      feedback: true,
    },
  });

  if (!ticket) {
    notFound();
  }

  const role = session?.user?.role;
  const backHref =
    role === "ADMIN"
      ? "/admin/tickets"
      : role === "TEKNISI"
      ? "/technician/tasks"
      : "/customer";
  const backLabel =
    role === "ADMIN"
      ? "Kembali ke Manajemen Tiket"
      : role === "TEKNISI"
      ? "Kembali ke Daftar Tugas"
      : "Kembali ke Portal Pelanggan";

  // SLA Calculation
  // Standard target: CRITICAL=2h, HIGH=4h, MEDIUM=8h, LOW=24h
  const targetHours =
    ticket.priority === "CRITICAL"
      ? 2
      : ticket.priority === "HIGH"
      ? 4
      : ticket.priority === "MEDIUM"
      ? 8
      : 24;

  const createdTime = new Date(ticket.createdAt).getTime();
  const endTime = ticket.resolvedAt
    ? new Date(ticket.resolvedAt).getTime()
    // eslint-disable-next-line react-hooks/purity
    : Date.now();
  const elapsedMs = endTime - createdTime;
  const elapsedHours = elapsedMs / (1000 * 60 * 60);

  const remainingHours = Math.max(0, targetHours - elapsedHours);
  const remainingHoursFormatted =
    remainingHours >= 1
      ? `${Math.floor(remainingHours)} Jam ${Math.round((remainingHours % 1) * 60)} Mnt`
      : `${Math.round(remainingHours * 60)} Menit`;

  const isResolvedOrClosed =
    ticket.status === "RESOLVED" || ticket.status === "CLOSED";

  return (
    <div className="space-y-6">
      {/* 2. Judul Tiket (UI_CONTEXT 4.2) */}
      <div>
        <Link
          href={backHref}
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#475569] hover:text-[#0F172A] mb-3 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>{backLabel}</span>
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[14px] font-mono font-medium text-[#475569]">
                #{ticket.ticketNumber}
              </span>
              <StatusBadge status={ticket.status} />
              <Badge variant="priority" value={ticket.priority} />
            </div>
            <h1 className="text-[30px] font-bold text-[#0F172A] tracking-tight leading-tight">
              {ticket.title}
            </h1>
          </div>

          <div>
            {role === "ADMIN" ? (
              <Link
                href="/admin/tickets"
                className="h-[40px] px-4 rounded-[8px] border border-[#94A3B8] text-[#0F172A] hover:bg-[#F1F5F9] text-[14px] font-medium inline-flex items-center gap-1.5 transition-colors"
              >
                <span>Semua Tiket</span>
              </Link>
            ) : role === "TEKNISI" ? (
              <Link
                href="/technician/tasks"
                className="h-[40px] px-4 rounded-[8px] border border-[#94A3B8] text-[#0F172A] hover:bg-[#F1F5F9] text-[14px] font-medium inline-flex items-center gap-1.5 transition-colors"
              >
                <span>Daftar Tugas</span>
              </Link>
            ) : (
              <Link
                href="/customer"
                className="h-[40px] px-4 rounded-[8px] border border-[#94A3B8] text-[#0F172A] hover:bg-[#F1F5F9] text-[14px] font-medium inline-flex items-center gap-1.5 transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>+ Buat tiket baru</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* 3. Stepper 5 Tahap dalam Satu Kartu Putih (UI_CONTEXT 4.2) */}
      <TicketStepper currentStatus={ticket.status} />

      {/* 4. Grid Dua Kolom (UI_CONTEXT 4.2: auto-fit, min 320px) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Kolom Kiri: Riwayat Pengerjaan & Detail Kerusakan (Span 2) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Kartu Riwayat Pengerjaan */}
          <Card>
            <CardHeader className="border-b border-[#E2E8F0] pb-3 mb-4">
              <CardTitle className="text-[18px]">Riwayat Pengerjaan</CardTitle>
            </CardHeader>
            <CardContent>
              {ticket.logs.length === 0 ? (
                <p className="text-[14px] text-[#64748B] py-4 text-center">
                  Belum ada log peristiwa yang tercatat.
                </p>
              ) : (
                <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[2px] before:bg-[#E2E8F0]">
                  {ticket.logs.map((log) => (
                    <div key={log.id} className="relative">
                      {/* Log Dot */}
                      <div className="absolute -left-6 top-1.5 h-3.5 w-3.5 rounded-full bg-[#1D4ED8] ring-4 ring-white" />
                      <div>
                        <h4 className="text-[15px] font-semibold text-[#0F172A]">
                          {formatLogAction(log.action)}
                        </h4>
                        <p className="text-[13px] text-[#475569] mt-0.5">
                          {formatDateTime(log.createdAt)} &bull; Oleh {log.user.name} ({log.user.role})
                        </p>
                        {log.notes && (
                          <p className="text-[14px] text-[#0F172A] bg-[#F8FAFC] border border-[#E2E8F0] p-3 rounded-[8px] mt-2">
                            {log.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Kartu Informasi Kendala & Lampiran Bukti */}
          <Card>
            <CardHeader className="border-b border-[#E2E8F0] pb-3 mb-4">
              <CardTitle className="text-[18px]">Detail Gangguan & Dokumentasi</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <span className="block text-xs font-semibold uppercase tracking-wider text-[#64748B] mb-1">
                  Deskripsi Laporan
                </span>
                <p className="text-[15px] text-[#0F172A] bg-[#F8FAFC] p-3.5 rounded-[8px] border border-[#E2E8F0] whitespace-pre-line">
                  {ticket.description}
                </p>
              </div>

              {ticket.resolutionNotes && (
                <div>
                  <span className="block text-xs font-semibold uppercase tracking-wider text-[#1D4ED8] mb-1">
                    Catatan Penyelesaian Teknisi
                  </span>
                  <p className="text-[15px] text-[#0F172A] bg-[#EFF6FF] p-3.5 rounded-[8px] border border-[#BFDBFE] whitespace-pre-line">
                    {ticket.resolutionNotes}
                  </p>
                </div>
              )}

              {/* Foto Bukti Kerusakan & Bukti Hasil Kerja */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <span className="block text-xs font-semibold uppercase tracking-wider text-[#64748B] mb-2 flex items-center gap-1.5">
                    <ImageIcon className="h-4 w-4 text-[#1D4ED8]" />
                    <span>Foto Bukti Kerusakan</span>
                  </span>
                  {ticket.damagePhotoUrl ? (
                    <div className="space-y-2">
                      <div className="aspect-video rounded-[8px] overflow-hidden border border-[#E2E8F0] bg-[#F1F5F9]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={ticket.damagePhotoUrl}
                          alt="Foto Bukti Kerusakan"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <a
                        href={ticket.damagePhotoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[13px] text-[#1D4ED8] hover:underline inline-block font-medium"
                      >
                        Lihat Gambar Asli &rarr;
                      </a>
                    </div>
                  ) : (
                    <div className="p-4 rounded-[8px] border border-dashed border-[#CBD5E1] text-[13px] text-[#64748B] text-center">
                      Tidak ada foto kerusakan dilampirkan
                    </div>
                  )}
                </div>

                <div>
                  <span className="block text-xs font-semibold uppercase tracking-wider text-[#64748B] mb-2 flex items-center gap-1.5">
                    <ImageIcon className="h-4 w-4 text-[#1D4ED8]" />
                    <span>Foto Bukti Hasil Kerja</span>
                  </span>
                  {ticket.resolvedPhotoUrl ? (
                    <div className="space-y-2">
                      <div className="aspect-video rounded-[8px] overflow-hidden border border-[#E2E8F0] bg-[#F1F5F9]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={ticket.resolvedPhotoUrl}
                          alt="Foto Bukti Hasil Kerja"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <a
                        href={ticket.resolvedPhotoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[13px] text-[#1D4ED8] hover:underline inline-block font-medium"
                      >
                        Lihat Gambar Hasil Kerja &rarr;
                      </a>
                    </div>
                  ) : (
                    <div className="p-4 rounded-[8px] border border-dashed border-[#CBD5E1] text-[13px] text-[#64748B] text-center">
                      Foto perbaikan akan diunggah setelah teknisi selesai
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 6. Kartu Verifikasi Ulasan CSAT (Tahap Closed/Resolved) */}
          {isResolvedOrClosed && (
            <CustomerReviewCard
              ticketId={ticket.id}
              isClosed={ticket.status === "CLOSED"}
              existingRating={ticket.feedback?.rating}
              existingComment={ticket.feedback?.comment}
            />
          )}
        </div>

        {/* Kolom Kanan: Kartu Teknisi & Kartu SLA (UI_CONTEXT 4.2) */}
        <div className="space-y-6">
          {/* Kartu Teknisi */}
          <Card>
            <CardHeader className="border-b border-[#E2E8F0] pb-3 mb-4">
              <CardTitle className="text-[18px]">Teknisi Penanggung Jawab</CardTitle>
            </CardHeader>
            <CardContent>
              {ticket.technician ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-[#EDE9FE] text-[#5B21B6] flex items-center justify-center font-bold">
                      <Wrench className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-[16px] font-semibold text-[#0F172A]">
                        {ticket.technician.name}
                      </h4>
                      <p className="text-[13px] text-[#475569]">
                        Teknisi Lapangan
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#E2E8F0] space-y-2">
                    <div className="text-[13px] text-[#475569]">
                      <span className="font-medium text-[#0F172A]">Email: </span>
                      {ticket.technician.email}
                    </div>

                    {ticket.technician.phone && (
                      <div className="pt-1">
                        <a
                          href={`tel:${ticket.technician.phone}`}
                          className="h-[36px] w-full rounded-[8px] border border-[#BFDBFE] bg-[#EFF6FF] text-[#1D4ED8] hover:bg-[#DBEAFE] text-[13px] font-medium inline-flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <Phone className="h-3.5 w-3.5" />
                          <span>Hubungi Teknisi ({ticket.technician.phone})</span>
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <Clock className="h-8 w-8 text-[#94A3B8] mx-auto mb-2" />
                  <p className="text-[14px] font-medium text-[#0F172A]">
                    Menunggu Penugasan
                  </p>
                  <p className="text-[13px] text-[#64748B] mt-1">
                    Helpdesk sedang menentukan teknisi terdekat untuk menangani laporan Anda.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Kartu SLA (UI_CONTEXT 4.2: latar brand-50, border brand-border, hitung mundur 32px bold) */}
          <div className="rounded-[12px] border border-[#BFDBFE] bg-[#EFF6FF] p-6 text-[#0F172A]">
            <span className="block text-xs font-semibold uppercase tracking-wider text-[#1D4ED8] mb-1">
              Target Kepatuhan SLA
            </span>

            {isResolvedOrClosed ? (
              <div className="mt-3">
                <div className="text-[32px] font-bold text-[#1D4ED8] leading-none">
                  {elapsedHours <= targetHours ? "Tepat Waktu" : "Melewati Batas"}
                </div>
                <p className="text-[14px] text-[#475569] mt-2">
                  Total waktu penanganan: {elapsedHours.toFixed(1)} jam (Target: {targetHours} jam)
                </p>
              </div>
            ) : (
              <div className="mt-3">
                <div className="text-[32px] font-bold text-[#1D4ED8] leading-none">
                  {remainingHoursFormatted}
                </div>
                <p className="text-[14px] text-[#475569] mt-2">
                  Tersisa dari target {targetHours} jam ({ticket.priority})
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
