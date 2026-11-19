import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CustomerTicketsList } from "@/components/shared/customer-tickets-list";
import { CreateTicketDialog } from "@/components/forms/create-ticket-dialog";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Daftar Laporan Gangguan - Service Tracker",
};

export default async function CustomerReportsPage() {
  const session = await auth();
  const dbUser = session?.user?.email
    ? await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true },
      })
    : null;
  const customerId = dbUser?.id || session?.user?.id;

  const tickets = await prisma.ticket.findMany({
    where: { customerId },
    include: {
      technician: { select: { name: true, phone: true } },
      feedback: { select: { rating: true, comment: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/customer"
            className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#475569] hover:text-[#0F172A] mb-2 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Kembali ke Beranda</span>
          </Link>
          <h1 className="text-[28px] font-bold tracking-tight text-[#0F172A]">
            Daftar Laporan Gangguan
          </h1>
          <p className="text-[14px] text-[#475569] mt-1">
            Pantau dan kelola seluruh riwayat laporan gangguan jaringan yang telah Anda ajukan
          </p>
        </div>

        <div className="shrink-0">
          <CreateTicketDialog buttonText="Buat Laporan Baru" />
        </div>
      </div>

      <Card className="border border-[#E2E8F0]/60 bg-white shadow-2xs rounded-[12px]">
        <CardHeader className="px-5 pt-3.5 pb-2 border-b border-[#F1F5F9]">
          <CardTitle className="text-[16px] font-bold text-[#0B2A6F] leading-snug">
            Semua Laporan Anda
          </CardTitle>
          <CardDescription className="text-[12px] text-[#64748B] mt-0.5">
            Gunakan filter status atau kotak pencarian untuk menemukan tiket laporan dengan cepat
          </CardDescription>
        </CardHeader>
        <CardContent className="px-5 pb-5 pt-3">
          <CustomerTicketsList initialTickets={tickets} limit={0} />
        </CardContent>
      </Card>
    </div>
  );
}
