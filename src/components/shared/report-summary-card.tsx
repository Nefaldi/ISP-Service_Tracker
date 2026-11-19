import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Megaphone, Hourglass, CheckSquare } from "lucide-react";

interface ReportSummaryCardProps {
  title?: string;
  historyHref?: string;
  totalLabel?: string;
  totalCount: number;
  inProgressLabel?: string;
  inProgressCount: number;
  resolvedLabel?: string;
  resolvedCount: number;
}

export function ReportSummaryCard({
  title = "Ringkasan Laporan",
  historyHref,
  totalLabel = "Total Laporan",
  totalCount,
  inProgressLabel = "Sedang Diproses",
  inProgressCount,
  resolvedLabel = "Selesai",
  resolvedCount,
}: ReportSummaryCardProps) {
  return (
    <Card className="border border-[#E2E8F0]/60 bg-white shadow-2xs rounded-[12px]">
      <CardHeader className="py-2.5 px-4 border-b border-[#F1F5F9]">
        <div className="flex items-center justify-between">
          <CardTitle className="text-[14px] font-bold text-[#064E3B]">
            {title}
          </CardTitle>
          {historyHref && (
            <Link
              href={historyHref}
              className="text-[12px] font-medium text-[#0F172A] hover:underline"
            >
              Riwayat
            </Link>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-2.5 p-3.5">
        {/* Row 1: Total */}
        <div className="rounded-[8px] border border-[#F1F5F9] bg-[#F8FAFC] px-3.5 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Megaphone className="h-4 w-4 text-[#64748B] shrink-0" />
            <span className="text-[13px] font-medium text-[#475569]">
              {totalLabel}
            </span>
          </div>
          <span className="text-[16px] font-bold text-[#0F172A]">
            {totalCount}
          </span>
        </div>

        {/* Row 2: Sedang Diproses */}
        <div className="rounded-[8px] border border-[#FED7AA]/60 bg-[#FFF7ED] px-3.5 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Hourglass className="h-4 w-4 text-[#EA580C] shrink-0" />
            <span className="text-[13px] font-medium text-[#EA580C]">
              {inProgressLabel}
            </span>
          </div>
          <span className="text-[16px] font-bold text-[#EA580C]">
            {inProgressCount}
          </span>
        </div>

        {/* Row 3: Selesai */}
        <div className="rounded-[8px] border border-[#BBF7D0]/60 bg-[#F0FDF4] px-3.5 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <CheckSquare className="h-4 w-4 text-[#16A34A] shrink-0" />
            <span className="text-[13px] font-medium text-[#16A34A]">
              {resolvedLabel}
            </span>
          </div>
          <span className="text-[16px] font-bold text-[#16A34A]">
            {resolvedCount}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
