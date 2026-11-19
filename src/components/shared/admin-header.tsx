"use client";

import { signOut } from "next-auth/react";
import { LogOut, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AdminHeaderProps {
  user?: {
    name?: string | null;
    email?: string | null;
    role?: string | null;
  } | null;
}

export function AdminHeader({ user }: AdminHeaderProps) {
  const handleSignOut = () => {
    signOut({ callbackUrl: "/login" });
  };

  return (
    <header className="h-[64px] bg-white border-b border-[#E2E8F0] px-4 sm:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-2 text-sm text-[#475569]">
        <span className="font-semibold text-[#0B2A6F]">Service Tracker</span>
        <span>/</span>
        <span className="text-[#0F172A] font-medium">Portal Administrator</span>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden sm:flex flex-col text-right">
          <span className="text-[14px] font-semibold text-[#0F172A] leading-tight">
            {user?.name || "Admin Helpdesk"}
          </span>
          <span className="text-[12px] text-[#475569]">
            {user?.email || "admin@tracker.com"}
          </span>
        </div>

        <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE]">
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>Admin</span>
        </span>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleSignOut}
          className="h-[36px] px-3 border-[#CBD5E1] text-[#DC2626] hover:bg-[#FEF2F2] hover:border-[#FCA5A5] text-[13px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <LogOut className="h-4 w-4 text-[#DC2626]" />
          <span>Keluar</span>
        </Button>
      </div>
    </header>
  );
}
