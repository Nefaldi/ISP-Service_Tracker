import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
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
    <div className="w-full">
      {/* 2-Column Responsive Layout matching reference UI */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column (Wide 2 spans): Laporan Terakhir Anda */}
        <div className="lg:col-span-2">
          <Card className="border border-[#E2E8F0]/60 bg-white shadow-2xs rounded-[12px] min-h-[460px]">
            <CardHeader className="px-5 pt-3.5 pb-2">
              <CardTitle className="text-[16px] font-bold text-[#0B2A6F] leading-snug">
                Laporan Terakhir Anda
              </CardTitle>
              <CardDescription className="text-[12px] text-[#64748B] mt-0.5">
                Pantau tahapan penanganan laporan Anda
              </CardDescription>
            </CardHeader>
            <CardContent className="px-5 pb-5 pt-1">
              <CustomerTicketsList initialTickets={tickets} limit={3} />
            </CardContent>
          </Card>
        </div>

        {/* Right Column (1 span): Ringkasan Laporan & Peta Area Pengawasan */}
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
            locationTag="Update 15 Jan 2026"
          />
        </div>
      </div>
    </div>
  );
}
