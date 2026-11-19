import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Megaphone, Hourglass, CheckCircle2 } from "lucide-react";

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
    <Card>
      <CardHeader className="pb-3 border-b border-[#E2E8F0]">
        <div className="flex items-center justify-between">
          <CardTitle className="text-[16px] font-bold text-[#0F172A]">
            {title}
          </CardTitle>
          {historyHref && (
            <Link
              href={historyHref}
              className="text-[13px] font-semibold text-[#1D4ED8] hover:underline"
            >
              Riwayat
            </Link>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-2.5 pt-3.5">
        {/* Row 1: Total Laporan / Tugas */}
        <div className="rounded-[10px] border border-[#E2E8F0] bg-white p-3.5 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-[#F1F5F9] text-[#64748B] flex items-center justify-center shrink-0">
              <Megaphone className="h-4 w-4" />
            </div>
            <span className="text-[14px] font-semibold text-[#334155]">
              {totalLabel}
            </span>
          </div>
          <span className="text-[22px] font-bold text-[#0F172A]">
            {totalCount}
          </span>
        </div>

        {/* Row 2: Sedang Diproses */}
        <div className="rounded-[10px] border border-[#FED7AA] bg-[#FFF7ED] p-3.5 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-[#FFEDD5] text-[#EA580C] flex items-center justify-center shrink-0">
              <Hourglass className="h-4 w-4" />
            </div>
            <span className="text-[14px] font-semibold text-[#C2410C]">
              {inProgressLabel}
            </span>
          </div>
          <span className="text-[22px] font-bold text-[#EA580C]">
            {inProgressCount}
          </span>
        </div>

        {/* Row 3: Selesai */}
        <div className="rounded-[10px] border border-[#A7F3D0] bg-[#F0FDF4] p-3.5 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-[#D1FAE5] text-[#059669] flex items-center justify-center shrink-0">
              <CheckCircle2 className="h-4 w-4" />
            </div>
            <span className="text-[14px] font-semibold text-[#047857]">
              {resolvedLabel}
            </span>
          </div>
          <span className="text-[22px] font-bold text-[#059669]">
            {resolvedCount}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
