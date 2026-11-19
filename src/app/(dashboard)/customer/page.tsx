import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CreateTicketForm } from "@/components/forms/create-ticket-form";
import { CustomerTicketsList } from "@/components/shared/customer-tickets-list";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export const metadata = {
  title: "Portal Pelanggan - Service Tracker",
};

export default async function CustomerPortalPage() {
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
      feedback: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[28px] font-bold tracking-tight text-[#0F172A]">
          Portal Pelanggan
        </h1>
        <p className="text-[14px] text-[#475569] mt-1">
          Laporkan kendala jaringan atau layanan Anda dan pantau status perbaikannya secara real-time
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column: Form Laporan Baru */}
        <div className="lg:col-span-1">
          <CreateTicketForm />
        </div>

        {/* Right Column: Daftar Tiket Pelanggan */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="pb-3 border-b border-[#E2E8F0] mb-4">
              <CardTitle className="text-[18px]">
                Daftar Tiket Pelaporan Anda ({tickets.length})
              </CardTitle>
              <CardDescription className="text-[14px]">
                Buka Live Tracker untuk memantau pengerjaan secara langsung dan memberikan ulasan setelah selesai
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CustomerTicketsList initialTickets={tickets} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
