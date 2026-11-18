import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CreateTicketForm } from "@/components/forms/create-ticket-form";
import { CustomerTicketsList } from "@/components/shared/customer-tickets-list";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { UserCheck } from "lucide-react";

export const metadata = {
  title: "Portal Pelanggan & Helpdesk",
};

export default async function CustomerPortalPage() {
  const session = await auth();
  const customerId = session?.user?.id;

  const tickets = await prisma.ticket.findMany({
    where: { customerId },
    include: {
      technician: { select: { name: true, phone: true } },
      feedback: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
          <UserCheck className="h-6 w-6 text-emerald-600" />
          <span>Portal Pelanggan & Layanan Helpdesk</span>
        </h1>
        <p className="text-sm text-zinc-500">
          Laporkan kendala jaringan atau layanan Anda dan pantau status perbaikannya secara real-time
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Form Laporan Baru */}
        <div className="lg:col-span-1 sticky top-20">
          <CreateTicketForm />
        </div>

        {/* Right Column: Riwayat & Pelacak Tiket Pelanggan */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Daftar Tiket Pelaporan Anda ({tickets.length})</CardTitle>
              <CardDescription>
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
