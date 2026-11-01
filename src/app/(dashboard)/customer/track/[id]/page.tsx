import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CustomerReviewCard } from "@/components/forms/customer-review-card";
import { formatDateTime } from "@/lib/utils";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Wrench,
  Activity,
  FileCheck,
  Image as ImageIcon,
} from "lucide-react";

interface TrackPageProps {
  params: Promise<{ id: string }>;
}

const LIFECYCLE_STEPS = [
  { key: "OPEN", label: "1. Open", desc: "Laporan Diterima", icon: Clock },
  { key: "ASSIGNED", label: "2. Assigned", desc: "Teknisi Ditugaskan", icon: Wrench },
  { key: "IN_PROGRESS", label: "3. In Progress", desc: "Perbaikan Berjalan", icon: Activity },
  { key: "RESOLVED", label: "4. Resolved", desc: "Pekerjaan Selesai", icon: CheckCircle2 },
  { key: "CLOSED", label: "5. Closed", desc: "Verifikasi & CSAT", icon: FileCheck },
];

function getStepIndex(status: string): number {
  switch (status) {
    case "OPEN":
      return 0;
    case "ASSIGNED":
      return 1;
    case "IN_PROGRESS":
      return 2;
    case "RESOLVED":
      return 3;
    case "CLOSED":
      return 4;
    default:
      return 0;
  }
}

export default async function CustomerTrackTicketPage({ params }: TrackPageProps) {
  const { id } = await params;

  const ticket = await prisma.ticket.findUnique({
    where: { id },
    include: {
      customer: { select: { id: true, name: true, email: true, phone: true } },
      technician: { select: { id: true, name: true, email: true, phone: true } },
      logs: {
        orderBy: { createdAt: "asc" },
        include: { user: { select: { name: true, role: true } } },
      },
      feedback: true,
    },
  });

  if (!ticket) {
    notFound();
  }

  const currentStep = getStepIndex(ticket.status);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <Link
          href="/customer"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 mb-2"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Kembali ke Portal Pelanggan</span>
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-bold text-blue-600">
                #{ticket.ticketNumber}
              </span>
              <Badge variant="priority" value={ticket.priority} />
              <Badge variant="status" value={ticket.status} />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 mt-1">
              {ticket.title}
            </h1>
          </div>
          <span className="text-xs text-zinc-500">
            Dibuat pada: {formatDateTime(ticket.createdAt)}
          </span>
        </div>
      </div>

      {/* Real-time Lifecycle Tracker Progress Stepper */}
      <Card className="border-blue-100 bg-white dark:bg-zinc-900 shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold uppercase tracking-wider text-zinc-500">
            Status Alur Pengerjaan (Live SSE Tracker)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
            {LIFECYCLE_STEPS.map((step, idx) => {
              const Icon = step.icon;
              const isPast = idx < currentStep;
              const isCurrent = idx === currentStep;

              return (
                <div
                  key={step.key}
                  className={`flex flex-col items-center text-center p-3 rounded-xl border transition-all ${
                    isCurrent
                      ? "border-blue-500 bg-blue-50/70 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 ring-2 ring-blue-500/20"
                      : isPast
                      ? "border-emerald-300 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300"
                      : "border-zinc-200 bg-zinc-50/50 dark:border-zinc-800 dark:bg-zinc-950/30 text-zinc-400"
                  }`}
                >
                  <div
                    className={`h-9 w-9 rounded-full flex items-center justify-center mb-2 ${
                      isCurrent
                        ? "bg-blue-600 text-white animate-pulse"
                        : isPast
                        ? "bg-emerald-500 text-white"
                        : "bg-zinc-200 text-zinc-500 dark:bg-zinc-800"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-bold leading-tight">{step.label}</span>
                  <span className="text-[11px] opacity-80 mt-0.5">{step.desc}</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Ticket Details & Evidence Photos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informasi Gangguan & Penanganan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="text-xs font-semibold uppercase text-zinc-500 mb-1">
                  Deskripsi Kendala
                </h4>
                <p className="text-sm text-zinc-800 dark:text-zinc-200 whitespace-pre-line bg-zinc-50 dark:bg-zinc-900 p-3 rounded-lg">
                  {ticket.description}
                </p>
              </div>

              {ticket.resolutionNotes && (
                <div>
                  <h4 className="text-xs font-semibold uppercase text-emerald-600 mb-1">
                    Catatan Perbaikan Teknisi
                  </h4>
                  <p className="text-sm text-zinc-800 dark:text-zinc-200 whitespace-pre-line bg-emerald-50/50 border border-emerald-200 dark:border-emerald-900 p-3 rounded-lg">
                    {ticket.resolutionNotes}
                  </p>
                </div>
              )}

              {/* Photos Gallery */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <h4 className="text-xs font-semibold uppercase text-zinc-500 mb-2 flex items-center gap-1.5">
                    <ImageIcon className="h-3.5 w-3.5" />
                    <span>Foto Bukti Kerusakan</span>
                  </h4>
                  {ticket.damagePhotoUrl ? (
                    <a
                      href={ticket.damagePhotoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-3 rounded-lg border border-dashed border-zinc-300 hover:border-blue-500 text-xs text-blue-600 truncate dark:border-zinc-700"
                    >
                      Buka Foto S3 Kerusakan ↗
                    </a>
                  ) : (
                    <div className="p-3 rounded-lg border border-zinc-200 text-xs text-zinc-400 dark:border-zinc-800">
                      Tidak ada foto lampiran
                    </div>
                  )}
                </div>

                <div>
                  <h4 className="text-xs font-semibold uppercase text-zinc-500 mb-2 flex items-center gap-1.5">
                    <ImageIcon className="h-3.5 w-3.5" />
                    <span>Foto Hasil Kerja Teknisi</span>
                  </h4>
                  {ticket.resolvedPhotoUrl ? (
                    <a
                      href={ticket.resolvedPhotoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-3 rounded-lg border border-dashed border-emerald-300 hover:border-emerald-500 text-xs text-emerald-600 truncate dark:border-emerald-800"
                    >
                      Buka Foto S3 Bukti Selesai ↗
                    </a>
                  ) : (
                    <div className="p-3 rounded-lg border border-zinc-200 text-xs text-zinc-400 dark:border-zinc-800">
                      Menunggu foto penyelesaian
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customer Verification & CSAT Review Card (Shows when resolved or closed) */}
          {(ticket.status === "RESOLVED" || ticket.status === "CLOSED") && (
            <CustomerReviewCard
              ticketId={ticket.id}
              isClosed={ticket.status === "CLOSED"}
              existingRating={ticket.feedback?.rating}
              existingComment={ticket.feedback?.comment}
            />
          )}

          {/* Audit Logs Trail */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Histori Aktivitas & Audit SLA</CardTitle>
              <CardDescription>
                Pencatatan setiap mutasi status yang divalidasi oleh Prisma ORM
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-zinc-200 dark:before:bg-zinc-800">
                {ticket.logs.map((log) => (
                  <div key={log.id} className="relative text-xs">
                    <div className="absolute -left-6 top-1 h-3 w-3 rounded-full bg-blue-500 border-2 border-white dark:border-zinc-950" />
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                        {log.action}
                      </span>
                      <span className="text-zinc-400">•</span>
                      <span className="text-zinc-500">{log.user.name} ({log.user.role})</span>
                      <span className="text-zinc-400">•</span>
                      <span className="text-zinc-400">{formatDateTime(log.createdAt)}</span>
                    </div>
                    {log.notes && (
                      <p className="text-zinc-600 dark:text-zinc-400 mt-0.5">{log.notes}</p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold uppercase tracking-wider text-zinc-500">
                Pihak Terkait
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div>
                <span className="text-zinc-400 font-medium">Pelapor / Pelanggan</span>
                <p className="font-bold text-zinc-800 dark:text-zinc-200 text-sm mt-0.5">
                  {ticket.customer.name}
                </p>
                <p className="text-zinc-500">{ticket.customer.email}</p>
                <p className="text-zinc-500">{ticket.customer.phone || "-"}</p>
              </div>

              <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800">
                <span className="text-zinc-400 font-medium">Teknisi Lapangan</span>
                {ticket.technician ? (
                  <>
                    <p className="font-bold text-zinc-800 dark:text-zinc-200 text-sm mt-0.5">
                      {ticket.technician.name}
                    </p>
                    <p className="text-zinc-500">{ticket.technician.email}</p>
                    <p className="text-zinc-500">{ticket.technician.phone || "-"}</p>
                  </>
                ) : (
                  <p className="text-zinc-400 italic mt-0.5">Belum ditugaskan oleh Admin</p>
                )}
              </div>

              <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800">
                <span className="text-zinc-400 font-medium">Kategori & Layanan</span>
                <p className="font-semibold text-zinc-800 dark:text-zinc-200 mt-0.5">
                  {ticket.category}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
