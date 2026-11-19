"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, ArrowLeft } from "lucide-react";
import { CreateTicketDialog } from "@/components/forms/create-ticket-dialog";

interface NavbarProps {
  user?: {
    name?: string | null;
    email?: string | null;
    role?: "ADMIN" | "TEKNISI" | "CUSTOMER";
  } | null;
}

export function Navbar({ user }: NavbarProps) {
  const pathname = usePathname();
  const isTechnicianTasks = pathname?.startsWith("/technician/tasks");
  const isCustomerReports =
    pathname?.startsWith("/customer/reports") ||
    pathname?.startsWith("/customer/tickets") ||
    pathname?.startsWith("/customer/track");

  // Determine display role subtitle matching reference UI
  let roleSubtitle = "Civitas Akademik / Pelapor";
  if (user?.role === "TEKNISI") {
    roleSubtitle = "Teknisi Lapangan";
  } else if (user?.role === "ADMIN") {
    roleSubtitle = "Administrator Sistem";
  } else if (!user) {
    roleSubtitle = "Sistem Layanan Jaringan Kampus";
  }

  // Greeting name
  const displayName = user?.name ? user.name.split(" ")[0] : "Civitas";

  // Portal home link
  const homeHref =
    user?.role === "ADMIN"
      ? "/admin"
      : user?.role === "TEKNISI"
      ? "/technician"
      : "/customer";

  // Direct profile page link based on role
  const profileHref =
    user?.role === "ADMIN"
      ? "/admin/profile"
      : user?.role === "TEKNISI"
      ? "/technician/profile"
      : "/customer/profile";

  return (
    <header className="sticky top-0 z-40 border-b border-[#E2E8F0]/70 bg-white h-[68px] flex items-center px-4 sm:px-6">
      <div className="w-full max-w-[1120px] mx-auto flex items-center justify-between">
        {/* Left: Brand Logo + Greeting + Role Subtitle */}
        <div className="flex items-center gap-3.5">
          <Link
            href={homeHref}
            className="flex items-center shrink-0 hover:opacity-90 transition-opacity py-1"
            aria-label="Kembali ke Beranda"
          >
            <Image
              src="/logo-zipnet.png"
              alt="Logo ZipNet"
              width={140}
              height={44}
              className="h-[40px] sm:h-[44px] w-auto object-contain"
              priority
            />
          </Link>

          <div className="hidden sm:block h-8 w-[1px] bg-[#E2E8F0]" />

          <div className="flex flex-col leading-tight">
            <h1 className="text-[17px] sm:text-[19px] font-bold text-[#0B2A6F] tracking-tight">
              Halo, {displayName}
            </h1>
            <p className="text-[12px] sm:text-[13px] text-[#64748B]">
              {roleSubtitle}
            </p>
          </div>
        </div>

        {/* Right: User Avatar Link & Action Button */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {user ? (
            <Link
              href={profileHref}
              aria-label="Profil Pengguna"
              title="Profil Saya"
              className="h-[38px] w-[38px] rounded-full border border-[#CBD5E1] bg-white flex items-center justify-center text-[#475569] hover:border-[#2563EB] hover:text-[#2563EB] hover:bg-[#F8FAFC] transition-all shadow-xs active:scale-95 cursor-pointer"
            >
              <User className="h-4 w-4" />
            </Link>
          ) : (
            <Link
              href="/login"
              className="h-[38px] px-3.5 rounded-[8px] border border-[#CBD5E1] bg-white text-[13px] font-semibold text-[#0F172A] hover:bg-[#F8FAFC] transition-colors flex items-center"
            >
              Masuk
            </Link>
          )}

          {/* Action Button: "+ Buat Laporan" for customer, or Portal Link */}
          {user?.role === "CUSTOMER" ? (
            <div className="flex items-center gap-2">
              {isCustomerReports ? (
                <Link
                  href="/customer"
                  className="h-[38px] px-3.5 rounded-[8px] border border-[#CBD5E1] bg-white text-[13px] font-semibold text-[#0F172A] hover:bg-[#F8FAFC] hover:border-[#94A3B8] transition-colors flex items-center gap-1.5 shadow-2xs"
                >
                  <ArrowLeft className="h-4 w-4 text-[#64748B]" />
                  <span>Kembali</span>
                </Link>
              ) : (
                <Link
                  href="/customer/reports"
                  className="h-[38px] px-3.5 rounded-[8px] border border-[#CBD5E1] bg-white text-[13px] font-semibold text-[#0F172A] hover:bg-[#F8FAFC] hover:border-[#94A3B8] transition-colors hidden sm:flex items-center"
                >
                  <span>Daftar Laporan</span>
                </Link>
              )}
              <CreateTicketDialog buttonText="Buat Laporan" />
            </div>
          ) : user?.role === "TEKNISI" ? (
            isTechnicianTasks ? (
              <Link
                href="/technician"
                className="h-[38px] px-3.5 rounded-[8px] border border-[#CBD5E1] bg-white text-[13px] font-semibold text-[#0F172A] hover:bg-[#F8FAFC] hover:border-[#94A3B8] transition-colors flex items-center gap-1.5 shadow-2xs"
              >
                <ArrowLeft className="h-4 w-4 text-[#64748B]" />
                <span>Kembali</span>
              </Link>
            ) : (
              <Link
                href="/technician/tasks"
                className="h-[38px] px-3.5 rounded-[8px] bg-[#1D4ED8] hover:bg-[#1E40AF] text-white text-[13px] font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <span>Daftar Tugas</span>
              </Link>
            )
          ) : user?.role === "ADMIN" ? (
            <Link
              href="/admin"
              className="h-[38px] px-3.5 rounded-[8px] bg-[#1D4ED8] hover:bg-[#1E40AF] text-white text-[13px] font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <span>Portal Admin</span>
            </Link>
          ) : (
            <CreateTicketDialog buttonText="Buat Laporan" />
          )}
        </div>
      </div>
    </header>
  );
}
