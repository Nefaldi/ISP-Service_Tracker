import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin } from "lucide-react";

interface AreaMapCardProps {
  locationTag?: string;
  subtitle?: string;
}

export function AreaMapCard({
  locationTag = "Fakultas Teknik",
  subtitle = "Wilayah Distribusi Jaringan FO Kampus",
}: AreaMapCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3 border-b border-[#E2E8F0]">
        <div className="flex items-center justify-between">
          <CardTitle className="text-[16px] font-bold text-[#0F172A] flex items-center gap-1.5">
            <MapPin className="h-4 w-4 text-[#1D4ED8]" />
            <span>Peta Area Pengawasan</span>
          </CardTitle>
          <span className="text-[12px] font-semibold text-[#64748B] bg-[#F1F5F9] px-2.5 py-0.5 rounded-full border border-[#E2E8F0]">
            {locationTag}
          </span>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="relative w-full h-[200px] bg-[#E2E8F0] overflow-hidden">
          {/* Map canvas view with OpenStreetMap tile */}
          <iframe
            title="Peta Area Pengawasan Jaringan"
            className="w-full h-full border-0 pointer-events-none"
            loading="lazy"
            src="https://www.openstreetmap.org/export/embed.html?bbox=106.822%2C-6.368%2C106.832%2C-6.360&layer=mapnik&marker=-6.364%2C106.827"
          />
          <div className="absolute bottom-2 left-2 right-2 bg-white/95 backdrop-blur-xs px-3 py-2 rounded-[8px] border border-[#CBD5E1] shadow-xs flex items-center justify-between text-[11px] text-[#475569]">
            <span className="font-semibold text-[#0F172A] truncate">
              {subtitle}
            </span>
            <span className="inline-flex items-center gap-1 font-semibold text-[#059669] shrink-0 ml-2">
              <span className="h-2 w-2 rounded-full bg-[#059669] animate-pulse"></span>
              <span>Online</span>
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
