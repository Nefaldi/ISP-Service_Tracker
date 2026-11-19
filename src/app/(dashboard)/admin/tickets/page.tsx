import { prisma } from "@/lib/prisma";
import { AdminTicketsTable } from "@/components/shared/admin-tickets-table";

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

  const technicianOptions = technicians.map((t) => ({
    id: t.id,
    name: t.name,
    email: t.email,
    phone: t.phone,
    activeTaskCount: t.assignedTickets ? t.assignedTickets.length : 0,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[24px] sm:text-[28px] font-bold tracking-tight text-[#0B2A6F]">
          Manajemen Tiket Helpdesk
        </h1>
        <p className="text-[13px] sm:text-[14px] text-[#475569] mt-1">
          Daftar seluruh tiket gangguan layanan, penugasan teknisi, dan ekspor data CSV
        </p>
      </div>

      <AdminTicketsTable initialTickets={tickets} technicians={technicianOptions} />
    </div>
  );
}
