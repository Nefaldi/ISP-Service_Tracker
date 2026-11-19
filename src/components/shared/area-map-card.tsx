"use client";

import dynamic from "next/dynamic";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface AreaMapCardProps {
  locationTag?: string;
}

// Dynamically import Leaflet interactive map with ssr: false
const InteractiveAreaMap = dynamic(
  () => import("@/components/shared/interactive-area-map"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[260px] bg-[#F8FAFC] flex flex-col items-center justify-center gap-2 text-[#64748B]">
        <Loader2 className="h-5 w-5 animate-spin text-[#059669]" />
        <span className="text-[12px] font-medium">Memuat peta interaktif...</span>
      </div>
    ),
  }
);

export function AreaMapCard({
  locationTag = "Fakultas Teknik",
}: AreaMapCardProps) {
  return (
    <Card className="overflow-hidden border border-[#E2E8F0] bg-white shadow-xs rounded-[12px]">
      <CardHeader className="py-3 px-4 border-b border-[#E2E8F0]">
        <div className="flex items-center justify-between">
          <CardTitle className="text-[15px] font-bold text-[#064E3B]">
            Peta Area Pengawasan
          </CardTitle>
          <span className="text-[12px] font-medium text-[#64748B]">
            {locationTag}
          </span>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <InteractiveAreaMap />
      </CardContent>
    </Card>
  );
}
