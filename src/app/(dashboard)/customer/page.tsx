import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CreateTicketForm } from "@/components/forms/create-ticket-form";
import { CustomerTicketsList } from "@/components/shared/customer-tickets-list";
import { ReportSummaryCard } from "@/components/shared/report-summary-card";
import { AreaMapCard } from "@/components/shared/area-map-card";
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

  const inProgressCount = tickets.filter(
    (t) => t.status === "OPEN" || t.status === "ASSIGNED" || t.status === "IN_PROGRESS"
  ).length;
  const resolvedCount = tickets.filter(
    (t) => t.status === "RESOLVED" || t.status === "CLOSED"
  ).length;

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-[28px] font-bold tracking-tight text-[#0F172A]">
          Portal Pelanggan
        </h1>
        <p className="text-[14px] text-[#475569] mt-1">
          Laporkan kendala jaringan atau layanan Anda dan pantau status perbaikannya secara real-time
        </p>
      </div>

      {/* 2-Column Responsive Layout matching reference UI */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left / Main Column (2 spans): Laporan Terakhir Anda */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="pb-3 border-b border-[#E2E8F0] mb-4">
              <CardTitle className="text-[18px]">
                Laporan Terakhir Anda ({tickets.length})
              </CardTitle>
              <CardDescription className="text-[14px]">
                Pantau tahapan penanganan laporan Anda dan buka Live Tracker untuk memantau pengerjaan
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CustomerTicketsList initialTickets={tickets} />
            </CardContent>
          </Card>
        </div>

        {/* Right / Sidebar Column (1 span): Ringkasan Laporan, Peta Area, & Form Buat Tiket */}
        <div className="lg:col-span-1 space-y-5">
          {/* Ringkasan Laporan Card */}
          <ReportSummaryCard
            title="Ringkasan Laporan"
            historyHref="/customer"
            totalLabel="Total Laporan"
            totalCount={tickets.length}
            inProgressLabel="Sedang Diproses"
            inProgressCount={inProgressCount}
            resolvedLabel="Selesai"
            resolvedCount={resolvedCount}
          />

          {/* Peta Area Pengawasan Card */}
          <AreaMapCard
            locationTag="Fakultas Teknik"
            subtitle="Wilayah Distribusi Jaringan FO Kampus"
          />

          {/* Form Buat Laporan Baru */}
          <CreateTicketForm />
        </div>
      </div>
    </div>
  );
}
