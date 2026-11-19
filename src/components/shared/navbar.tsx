"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { User, LogOut, ShieldCheck, Wrench, Check } from "lucide-react";
import { CreateTicketDialog } from "@/components/forms/create-ticket-dialog";

interface NavbarProps {
  user?: {
    name?: string | null;
    email?: string | null;
    role?: "ADMIN" | "TEKNISI" | "CUSTOMER";
  } | null;
}

export function Navbar({ user }: NavbarProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Determine display role subtitle matching reference UI
  let roleSubtitle = "Civitas Akademik / Pelapor";
  if (user?.role === "TEKNISI") {
    roleSubtitle = "Teknisi Lapangan / Pelaksana";
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

  return (
    <header className="sticky top-0 z-40 border-b border-[#E2E8F0]/70 bg-white h-[68px] flex items-center px-4 sm:px-6">
      <div className="w-full max-w-[1120px] mx-auto flex items-center justify-between">
        {/* Left: Campus Logo + Greeting + Role Subtitle */}
        <div className="flex items-center gap-3">
          <Link
            href={homeHref}
            className="flex items-center shrink-0 hover:opacity-90 transition-opacity"
            aria-label="Kembali ke Beranda"
          >
            <Image
              src="/app-logo.png"
              alt="Logo Universitas"
              width={38}
              height={38}
              className="h-9 w-auto object-contain"
              priority
            />
          </Link>

          <div className="flex flex-col leading-tight">
            <h1 className="text-[18px] sm:text-[20px] font-bold text-[#064E3B] tracking-tight">
              Halo, {displayName}
            </h1>
            <p className="text-[12px] sm:text-[13px] text-[#64748B]">
              {roleSubtitle}
            </p>
          </div>
        </div>

        {/* Right: User Avatar Dropdown & Action Button */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                aria-expanded={dropdownOpen}
                aria-label="Menu akun pengguna"
                className="h-[38px] w-[38px] rounded-full border border-[#CBD5E1] bg-white flex items-center justify-center text-[#475569] hover:border-[#94A3B8] hover:bg-[#F8FAFC] transition-colors cursor-pointer shadow-xs"
              >
                <User className="h-4 w-4 text-[#334155]" />
              </button>

              {/* User Dropdown Menu */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-[10px] bg-white border border-[#E2E8F0] shadow-lg py-1.5 z-50 text-[#0F172A] text-[13px]">
                  <div className="px-3.5 py-2 border-b border-[#F1F5F9]">
                    <p className="font-semibold text-[#0F172A] truncate">
                      {user.name}
                    </p>
                    <p className="text-[12px] text-[#64748B] truncate">
                      {user.email}
                    </p>
                    <span className="inline-block mt-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-[#F1F5F9] text-[#475569]">
                      {user.role === "CUSTOMER"
                        ? "Civitas Pelapor"
                        : user.role === "TEKNISI"
                        ? "Teknisi Lapangan"
                        : "Administrator"}
                    </span>
                  </div>

                  {user.role === "ADMIN" && (
                    <Link
                      href="/admin"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 px-3.5 py-2 text-[#475569] hover:bg-[#F8FAFC] hover:text-[#0F172A] transition-colors"
                    >
                      <ShieldCheck className="h-4 w-4 text-[#0B2A6F]" />
                      <span>Portal Admin</span>
                    </Link>
                  )}

                  {user.role === "TEKNISI" && (
                    <>
                      <Link
                        href="/technician"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-3.5 py-2 text-[#475569] hover:bg-[#F8FAFC] hover:text-[#0F172A] transition-colors"
                      >
                        <Wrench className="h-4 w-4 text-[#5B21B6]" />
                        <span>Portal Teknisi</span>
                      </Link>
                      <Link
                        href="/technician/tasks"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-3.5 py-2 text-[#475569] hover:bg-[#F8FAFC] hover:text-[#0F172A] transition-colors"
                      >
                        <Check className="h-4 w-4 text-[#16A34A]" />
                        <span>Daftar Tugas</span>
                      </Link>
                    </>
                  )}

                  {user.role === "CUSTOMER" && (
                    <Link
                      href="/customer"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 px-3.5 py-2 text-[#475569] hover:bg-[#F8FAFC] hover:text-[#0F172A] transition-colors"
                    >
                      <User className="h-4 w-4 text-[#1D4ED8]" />
                      <span>Portal Pelanggan</span>
                    </Link>
                  )}

                  <div className="my-1 border-t border-[#F1F5F9]" />

                  <button
                    type="button"
                    onClick={() => signOut({ callbackUrl: "/login" })}
                    className="w-full flex items-center gap-2 px-3.5 py-2 text-[#DC2626] hover:bg-[#FEF2F2] transition-colors text-left font-medium cursor-pointer"
                  >
                    <LogOut className="h-4 w-4 text-[#DC2626]" />
                    <span>Keluar</span>
                  </button>
                </div>
              )}
            </div>
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
            <CreateTicketDialog buttonText="Buat Laporan" />
          ) : user?.role === "TEKNISI" ? (
            <Link
              href="/technician/tasks"
              className="h-[38px] px-3.5 rounded-[8px] bg-[#14532D] hover:bg-[#166534] text-white text-[13px] font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <span>Daftar Tugas</span>
            </Link>
          ) : user?.role === "ADMIN" ? (
            <Link
              href="/admin"
              className="h-[38px] px-3.5 rounded-[8px] bg-[#14532D] hover:bg-[#166534] text-white text-[13px] font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
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
