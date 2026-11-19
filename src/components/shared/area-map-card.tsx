import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AreaMapCardProps {
  locationTag?: string;
}

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
        <div className="relative w-full h-[190px] bg-[#FEF9C3]/20 overflow-hidden">
          <Image
            src="/campus-map.png"
            alt="Peta Area Pengawasan Fakultas Teknik"
            width={243}
            height={187}
            className="w-full h-full object-cover"
            priority
          />
        </div>
      </CardContent>
    </Card>
  );
}
