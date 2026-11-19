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
  const isTechnicianSubpage =
    pathname?.startsWith("/technician/tasks") ||
    pathname?.startsWith("/technician/profile");
  const isCustomerSubpage =
    pathname?.startsWith("/customer/reports") ||
    pathname?.startsWith("/customer/tickets") ||
    pathname?.startsWith("/customer/track") ||
    pathname?.startsWith("/customer/profile");
  const isAdminSubpage =
    pathname?.startsWith("/admin/tickets") ||
    pathname?.startsWith("/admin/users") ||
    pathname?.startsWith("/admin/reports") ||
    pathname?.startsWith("/admin/profile");

  // Determine display role subtitle matching reference UI
  let roleSubtitle = "Civitas Akademik / Pelapor";
  if (user?.role === "TEKNISI") {
    roleSubtitle = "Teknisi Lapangan";
  } else if (user?.role === "ADMIN") {
    roleSubtitle = "Administrator Helpdesk";
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

  const renderActionButtons = (isMobile = false) => {
    if (user?.role === "CUSTOMER") {
      if (isMobile) {
        return (
          <div className="w-full flex items-center gap-2">
            {isCustomerSubpage && (
              <Link
                href="/customer"
                className="h-[38px] px-3.5 rounded-[8px] border border-[#CBD5E1] bg-white text-[13px] font-semibold text-[#0F172A] hover:bg-[#F8FAFC] hover:border-[#94A3B8] transition-colors flex items-center gap-1.5 shadow-2xs shrink-0"
              >
                <ArrowLeft className="h-4 w-4 text-[#64748B]" />
                <span>Kembali</span>
              </Link>
            )}
            <div className="flex-1">
              <CreateTicketDialog
                buttonText="Buat Laporan"
                className="w-full justify-center"
              />
            </div>
          </div>
        );
      }

      return (
        <div className="flex items-center gap-2">
          {isCustomerSubpage && (
            <Link
              href="/customer"
              className="h-[38px] px-3.5 rounded-[8px] border border-[#CBD5E1] bg-white text-[13px] font-semibold text-[#0F172A] hover:bg-[#F8FAFC] hover:border-[#94A3B8] transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <ArrowLeft className="h-4 w-4 text-[#64748B]" />
              <span>Kembali</span>
            </Link>
          )}
          <CreateTicketDialog buttonText="Buat Laporan" />
        </div>
      );
    }

    if (user?.role === "TEKNISI") {
      if (isMobile) {
        return (
          <div className="w-full">
            {isTechnicianSubpage ? (
              <Link
                href="/technician"
                className="w-full h-[38px] px-3.5 rounded-[8px] border border-[#CBD5E1] bg-white text-[13px] font-semibold text-[#0F172A] hover:bg-[#F8FAFC] hover:border-[#94A3B8] transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
              >
                <ArrowLeft className="h-4 w-4 text-[#64748B]" />
                <span>Kembali</span>
              </Link>
            ) : (
              <Link
                href="/technician/tasks"
                className="w-full h-[38px] px-3.5 rounded-[8px] bg-[#1D4ED8] hover:bg-[#1E40AF] text-white text-[13px] font-semibold flex items-center justify-center gap-1.5 shadow-xs transition-colors"
              >
                <span>Daftar Tugas</span>
              </Link>
            )}
          </div>
        );
      }

      return isTechnicianSubpage ? (
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
      );
    }

    if (user?.role === "ADMIN") {
      if (isMobile) {
        return (
          <div className="w-full">
            {isAdminSubpage ? (
              <Link
                href="/admin"
                className="w-full h-[38px] px-3.5 rounded-[8px] border border-[#CBD5E1] bg-white text-[13px] font-semibold text-[#0F172A] hover:bg-[#F8FAFC] hover:border-[#94A3B8] transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
              >
                <ArrowLeft className="h-4 w-4 text-[#64748B]" />
                <span>Kembali</span>
              </Link>
            ) : (
              <Link
                href="/admin/tickets"
                className="w-full h-[38px] px-3.5 rounded-[8px] bg-[#1D4ED8] hover:bg-[#1E40AF] text-white text-[13px] font-semibold flex items-center justify-center shadow-xs transition-colors"
              >
                <span>Daftar Tiket</span>
              </Link>
            )}
          </div>
        );
      }

      return isAdminSubpage ? (
        <Link
          href="/admin"
          className="h-[38px] px-3.5 rounded-[8px] border border-[#CBD5E1] bg-white text-[13px] font-semibold text-[#0F172A] hover:bg-[#F8FAFC] hover:border-[#94A3B8] transition-colors flex items-center justify-center shadow-2xs"
        >
          <span>Kembali</span>
        </Link>
      ) : (
        <Link
          href="/admin/tickets"
          className="h-[38px] px-3.5 rounded-[8px] bg-[#1D4ED8] hover:bg-[#1E40AF] text-white text-[13px] font-semibold flex items-center shadow-xs transition-colors"
        >
          <span>Daftar Tiket</span>
        </Link>
      );
    }

    // Guest / Tanpa Sesi
    if (isMobile) {
      return (
        <div className="w-full">
          <CreateTicketDialog
            buttonText="Buat Laporan"
            className="w-full justify-center"
          />
        </div>
      );
    }

    return <CreateTicketDialog buttonText="Buat Laporan" />;
  };

  return (
    <header className="sticky top-0 z-40 border-b border-[#E2E8F0]/70 bg-white">
      {/* Top Bar: Brand Logo, Greeting & Profile Link */}
      <div className="h-[64px] sm:h-[68px] px-4 sm:px-6 flex items-center">
        <div className="w-full max-w-[1120px] mx-auto flex items-center justify-between">
          {/* Left: Brand Logo + Greeting + Role Subtitle */}
          <div className="flex items-center gap-3 sm:gap-3.5">
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
                style={{ width: "auto" }}
                className="h-[38px] sm:h-[44px] w-auto object-contain"
                priority
              />
            </Link>

            <div className="hidden sm:block h-8 w-[1px] bg-[#E2E8F0]" />

            <div className="flex flex-col leading-tight">
              <h1 className="text-[16px] sm:text-[19px] font-bold text-[#0B2A6F] tracking-tight">
                Halo, {displayName}
              </h1>
              <p className="text-[12px] sm:text-[13px] text-[#64748B]">
                {roleSubtitle}
              </p>
            </div>
          </div>

          {/* Right: User Avatar Link & Desktop Action Buttons */}
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

            {/* Desktop Action Buttons */}
            <div className="hidden sm:flex items-center gap-2">
              {renderActionButtons(false)}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sub-Bar: Action Button directly below Navbar */}
      <div className="sm:hidden border-t border-[#F1F5F9] bg-[#F8FAFC]/95 px-4 py-2">
        <div className="w-full max-w-[1120px] mx-auto flex items-center">
          {renderActionButtons(true)}
        </div>
      </div>
    </header>
  );
}
