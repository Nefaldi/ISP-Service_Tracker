import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { AdminTicketsTable } from "@/components/shared/admin-tickets-table";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Manajemen Tiket - Service Tracker Admin",
};

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
      <div>
        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#475569] hover:text-[#0F172A] mb-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Kembali ke Ikhtisar</span>
        </Link>
        <h1 className="text-[28px] font-bold tracking-tight text-[#0F172A]">
          Manajemen Tiket Helpdesk
        </h1>
        <p className="text-[14px] text-[#475569] mt-1">
          Daftar seluruh tiket gangguan layanan, penugasan teknisi, dan ekspor data CSV
        </p>
      </div>

      <AdminTicketsTable initialTickets={tickets} technicians={technicians} />
    </div>
  );
}
