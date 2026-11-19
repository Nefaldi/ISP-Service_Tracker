import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { TicketStepper } from "@/components/shared/ticket-stepper";
import {
  AssignTechnicianDialog,
  TechnicianOption,
} from "@/components/forms/assign-technician-dialog";
import { formatDateTime } from "@/lib/utils";
import {
  Clock,
  Wrench,
  User,
  ImageIcon,
  Star,
  CheckCircle2,
  Calendar,
  Phone,
  Mail,
  FileText,
} from "lucide-react";

export const dynamic = "force-dynamic";

interface AdminTicketDetailPageProps {
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

export default async function AdminTicketDetailPage({ params }: AdminTicketDetailPageProps) {
  const resolvedParams = await params;
  const id = resolvedParams.id;

  const [ticket, technicians] = await Promise.all([
    prisma.ticket.findUnique({
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
    }),
    prisma.user.findMany({
      where: { role: "TEKNISI" },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        assignedTickets: {
          where: { status: { in: ["ASSIGNED", "IN_PROGRESS"] } },
          select: { id: true },
        },
      },
      orderBy: { name: "asc" },
    }),
  ]);

  if (!ticket) {
    notFound();
  }

  const technicianOptions: TechnicianOption[] = technicians.map((t) => ({
    id: t.id,
    name: t.name,
    email: t.email,
    phone: t.phone,
    activeTaskCount: t.assignedTickets ? t.assignedTickets.length : 0,
  }));

  // Target SLA standar: CRITICAL=2 jam, HIGH=4 jam, MEDIUM=8 jam, LOW=24 jam
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

  const isOverdue = elapsedHours > targetHours;

  return (
    <div className="space-y-6">
      {/* Header Halaman Detail */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E2E8F0]">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="font-mono text-sm font-bold text-[#1D4ED8]">
              #{ticket.ticketNumber}
            </span>
            <StatusBadge status={ticket.status} />
            <Badge variant="priority" value={ticket.priority} />
            <span className="text-xs text-[#64748B] bg-[#F1F5F9] px-2.5 py-0.5 rounded-full font-medium">
              {ticket.category}
            </span>
          </div>
          <h1 className="text-[24px] sm:text-[28px] font-bold text-[#0F172A] tracking-tight leading-tight">
            {ticket.title}
          </h1>
          <p className="text-[13px] text-[#64748B] mt-1 flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>Dilaporkan pada {formatDateTime(ticket.createdAt)}</span>
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/admin/tickets"
            className="h-[38px] px-3.5 rounded-[8px] border border-[#CBD5E1] bg-white text-[13px] font-semibold text-[#0F172A] hover:bg-[#F8FAFC] transition-colors inline-flex items-center gap-1.5"
          >
            <span>Daftar Tiket</span>
          </Link>

          {ticket.status === "OPEN" ? (
            <AssignTechnicianDialog
              ticketId={ticket.id}
              ticketNumber={ticket.ticketNumber}
              ticketTitle={ticket.title}
              currentTechnicianId={ticket.technicianId}
              technicians={technicianOptions}
              isReassign={false}
            />
          ) : ticket.status === "ASSIGNED" ? (
            <AssignTechnicianDialog
              ticketId={ticket.id}
              ticketNumber={ticket.ticketNumber}
              ticketTitle={ticket.title}
              currentTechnicianId={ticket.technicianId}
              technicians={technicianOptions}
              isReassign={true}
            />
          ) : null}
        </div>
      </div>

      {/* Grid 2 Kolom: Detail Laporan, Progres & Hasil Kerja */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Kolom Kiri (2 Kolom Lebar) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stepper Progres Penanganan */}
          <Card className="border border-[#E2E8F0]/80 shadow-2xs">
            <CardHeader className="border-b border-[#F1F5F9] pb-3">
              <CardTitle className="text-[16px] font-bold text-[#0B2A6F]">
                Progres Penanganan Layanan
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 pb-6">
              <TicketStepper currentStatus={ticket.status} />
            </CardContent>
          </Card>

          {/* Detail Gangguan & Dokumentasi Kerusakan */}
          <Card className="border border-[#E2E8F0]/80 shadow-2xs">
            <CardHeader className="border-b border-[#F1F5F9] pb-3">
              <CardTitle className="text-[16px] font-bold text-[#0B2A6F] flex items-center gap-2">
                <FileText className="h-4 w-4 text-[#1D4ED8]" />
                <span>Detail Laporan Gangguan</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div>
                <span className="block text-xs font-semibold uppercase tracking-wider text-[#64748B] mb-1.5">
                  Deskripsi Kerusakan / Masalah
                </span>
                <p className="text-[14px] text-[#0F172A] bg-[#F8FAFC] p-4 rounded-[8px] border border-[#E2E8F0] whitespace-pre-wrap leading-relaxed">
                  {ticket.description}
                </p>
              </div>

              {/* Foto Bukti Kerusakan Pelanggan */}
              <div>
                <span className="block text-xs font-semibold uppercase tracking-wider text-[#64748B] mb-2 flex items-center gap-1.5">
                  <ImageIcon className="h-4 w-4 text-[#1D4ED8]" />
                  <span>Foto Bukti Kerusakan dari Pelanggan</span>
                </span>
                {ticket.damagePhotoUrl ? (
                  <div className="space-y-2">
                    <div className="aspect-video max-w-md rounded-[8px] overflow-hidden border border-[#E2E8F0] bg-[#F1F5F9]">
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
                      className="text-[13px] text-[#1D4ED8] hover:underline font-medium inline-flex items-center gap-1"
                    >
                      Buka Gambar Asli &rarr;
                    </a>
                  </div>
                ) : (
                  <div className="p-4 rounded-[8px] border border-dashed border-[#CBD5E1] text-[13px] text-[#64748B] text-center bg-[#F8FAFC]">
                    Pelanggan tidak melampirkan foto kerusakan saat melapor.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Hasil Pengerjaan & Bukti Perbaikan Teknisi */}
          <Card className="border border-[#E2E8F0]/80 shadow-2xs">
            <CardHeader className="border-b border-[#F1F5F9] pb-3">
              <CardTitle className="text-[16px] font-bold text-[#0B2A6F] flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-[#2563EB]" />
                <span>Hasil Pengerjaan Teknisi Lapangan</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              {ticket.resolutionNotes ? (
                <div>
                  <span className="block text-xs font-semibold uppercase tracking-wider text-[#1D4ED8] mb-1.5">
                    Catatan Perbaikan / Tindakan Teknisi
                  </span>
                  <p className="text-[14px] text-[#0F172A] bg-[#EFF6FF] p-4 rounded-[8px] border border-[#BFDBFE] whitespace-pre-wrap leading-relaxed">
                    {ticket.resolutionNotes}
                  </p>
                </div>
              ) : (
                <div className="p-3.5 rounded-[8px] bg-[#F8FAFC] border border-[#E2E8F0] text-[13px] text-[#64748B]">
                  Teknisi belum menginput catatan penyelesaian pengerjaan.
                </div>
              )}

              {/* Foto Bukti Hasil Kerja */}
              <div>
                <span className="block text-xs font-semibold uppercase tracking-wider text-[#64748B] mb-2 flex items-center gap-1.5">
                  <ImageIcon className="h-4 w-4 text-[#2563EB]" />
                  <span>Foto Bukti Hasil Perbaikan Lapangan</span>
                </span>
                {ticket.resolvedPhotoUrl ? (
                  <div className="space-y-2">
                    <div className="aspect-video max-w-md rounded-[8px] overflow-hidden border border-[#BFDBFE] bg-[#EFF6FF]">
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
                      className="text-[13px] text-[#1D4ED8] hover:underline font-medium inline-flex items-center gap-1"
                    >
                      Buka Gambar Hasil Kerja &rarr;
                    </a>
                  </div>
                ) : (
                  <div className="p-4 rounded-[8px] border border-dashed border-[#CBD5E1] text-[13px] text-[#64748B] text-center bg-[#F8FAFC]">
                    Foto bukti hasil kerja akan ditampilkan setelah teknisi menyelesaikan penanganan.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Ulasan & Rating Kepuasan Pelanggan (CSAT) */}
          {ticket.feedback && (
            <Card className="border border-[#FDE68A] bg-[#FEF3C7]/20 shadow-2xs">
              <CardHeader className="border-b border-[#FDE68A]/60 pb-3">
                <CardTitle className="text-[16px] font-bold text-[#92400E] flex items-center gap-2">
                  <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                  <span>Ulasan & Penilaian Pelanggan (CSAT)</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="flex items-center text-amber-500">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-5 w-5 ${
                          star <= (ticket.feedback?.rating || 0)
                            ? "fill-amber-400 text-amber-500"
                            : "text-[#CBD5E1]"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-[16px] font-bold text-[#92400E]">
                    {ticket.feedback.rating} dari 5 Bintang
                  </span>
                </div>
                {ticket.feedback.comment && (
                  <p className="text-[14px] text-[#78350F] italic bg-white p-3 rounded-[8px] border border-[#FDE68A]">
                    &quot;{ticket.feedback.comment}&quot;
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Riwayat Kronologis Aktivitas */}
          <Card className="border border-[#E2E8F0]/80 shadow-2xs">
            <CardHeader className="border-b border-[#F1F5F9] pb-3">
              <CardTitle className="text-[16px] font-bold text-[#0B2A6F] flex items-center gap-2">
                <Clock className="h-4 w-4 text-[#1D4ED8]" />
                <span>Riwayat Kronologis Penanganan</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              {ticket.logs.length === 0 ? (
                <p className="text-center text-[13px] text-[#64748B] py-4">
                  Belum ada catatan aktivitas tercatat.
                </p>
              ) : (
                <div className="relative pl-6 space-y-5 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-[#E2E8F0]">
                  {ticket.logs.map((log) => (
                    <div key={log.id} className="relative">
                      <div className="absolute -left-6 top-1 h-3.5 w-3.5 rounded-full border-2 border-white bg-[#1D4ED8]" />
                      <div className="text-[13px]">
                        <span className="font-semibold text-[#0F172A]">
                          {formatLogAction(log.action)}
                        </span>
                        <div className="text-[12px] text-[#64748B] mt-0.5">
                          {formatDateTime(log.createdAt)} oleh{" "}
                          <span className="font-medium text-[#0F172A]">
                            {log.user.name} ({log.user.role})
                          </span>
                        </div>
                        {log.notes && (
                          <p className="text-[13px] text-[#334155] bg-[#F8FAFC] border border-[#E2E8F0] p-2.5 rounded-[6px] mt-1.5 whitespace-pre-wrap">
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
        </div>

        {/* Kolom Kanan (1 Kolom Samping): Pelapor, Teknisi, SLA */}
        <div className="lg:col-span-1 space-y-5">
          {/* Informasi Pelapor (Pelanggan) */}
          <Card className="border border-[#E2E8F0]/80 shadow-2xs">
            <CardHeader className="border-b border-[#F1F5F9] pb-3">
              <CardTitle className="text-[15px] font-bold text-[#0B2A6F] flex items-center gap-2">
                <User className="h-4 w-4 text-[#1D4ED8]" />
                <span>Data Pelapor (Pelanggan)</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3 text-[13px]">
              <div>
                <span className="text-[11px] font-semibold text-[#64748B] uppercase block">
                  Nama Lengkap
                </span>
                <span className="font-bold text-[#0F172A] text-[14px]">
                  {ticket.customer.name}
                </span>
              </div>
              <div className="flex items-center gap-2 text-[#475569]">
                <Mail className="h-4 w-4 text-[#64748B] shrink-0" />
                <span className="truncate">{ticket.customer.email}</span>
              </div>
              {ticket.customer.phone && (
                <div className="flex items-center gap-2 text-[#475569]">
                  <Phone className="h-4 w-4 text-[#64748B] shrink-0" />
                  <span>{ticket.customer.phone}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Teknisi Penanggung Jawab */}
          <Card className="border border-[#E2E8F0]/80 shadow-2xs">
            <CardHeader className="border-b border-[#F1F5F9] pb-3">
              <CardTitle className="text-[15px] font-bold text-[#0B2A6F] flex items-center gap-2">
                <Wrench className="h-4 w-4 text-[#1D4ED8]" />
                <span>Teknisi Penanggung Jawab</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3 text-[13px]">
              {ticket.technician ? (
                <>
                  <div>
                    <span className="text-[11px] font-semibold text-[#64748B] uppercase block">
                      Nama Teknisi
                    </span>
                    <span className="font-bold text-[#0F172A] text-[14px]">
                      {ticket.technician.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[#475569]">
                    <Mail className="h-4 w-4 text-[#64748B] shrink-0" />
                    <span className="truncate">{ticket.technician.email}</span>
                  </div>
                  {ticket.technician.phone && (
                    <div className="flex items-center gap-2 text-[#475569]">
                      <Phone className="h-4 w-4 text-[#64748B] shrink-0" />
                      <span>{ticket.technician.phone}</span>
                    </div>
                  )}
                </>
              ) : (
                <div className="p-3 text-center bg-[#FEF2F2] rounded-[8px] border border-[#FECACA]">
                  <span className="text-[13px] font-bold text-[#DC2626] block">
                    Belum Ditugaskan
                  </span>
                  <p className="text-[11px] text-[#991B1B] mt-1">
                    Pilih teknisi di tombol penugasan di atas.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Kepatuhan SLA Layanan */}
          <Card className="border border-[#E2E8F0]/80 shadow-2xs">
            <CardHeader className="border-b border-[#F1F5F9] pb-3">
              <CardTitle className="text-[15px] font-bold text-[#0B2A6F] flex items-center gap-2">
                <Clock className="h-4 w-4 text-[#1D4ED8]" />
                <span>Target & Durasi SLA</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3 text-[13px]">
              <div className="flex items-center justify-between pb-2 border-b border-[#F1F5F9]">
                <span className="text-[#64748B]">Batas Target SLA:</span>
                <span className="font-bold text-[#0F172A]">{targetHours} Jam</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-[#F1F5F9]">
                <span className="text-[#64748B]">Waktu Berjalan:</span>
                <span className="font-bold text-[#0F172A]">
                  {elapsedHours.toFixed(1)} Jam
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#64748B]">Status SLA:</span>
                <span
                  className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                    isOverdue
                      ? "bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA]"
                      : "bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE]"
                  }`}
                >
                  {isOverdue ? "Melebihi Target SLA" : "Sesuai Standar SLA"}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
