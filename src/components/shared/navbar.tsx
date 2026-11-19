"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { LogOut, Ticket, Wrench, User, ShieldCheck } from "lucide-react";

interface NavbarProps {
  user?: {
    name?: string | null;
    email?: string | null;
    role?: "ADMIN" | "TEKNISI" | "CUSTOMER";
  } | null;
}

export function Navbar({ user }: NavbarProps) {
  const pathname = usePathname();
  const isAdmin = user?.role === "ADMIN";

  // If on admin route, the AdminSidebar handles admin navigation, so top navbar is minimal or integrated
  const isAdminPage = pathname.startsWith("/admin");

  return (
    <header className="sticky top-0 z-40 border-b border-[#E2E8F0] bg-white h-[64px] flex items-center px-4 sm:px-6">
      <div className="w-full flex items-center justify-between">
        {/* Left: Brand */}
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="flex items-center gap-2 font-bold text-[18px] tracking-tight text-[#0B2A6F]"
          >
            <Ticket className="h-5 w-5 text-[#1D4ED8]" />
            <span>Service Tracker</span>
          </Link>

          {/* Navigation for Customer & Technician when logged in */}
          {user && !isAdminPage && (
            <nav className="hidden md:flex items-center gap-2 text-[14px]">
              {user.role === "CUSTOMER" && (
                <>
                  <Link
                    href="/customer"
                    className={`px-3 py-1.5 rounded-[8px] font-medium transition-colors ${
                      pathname === "/customer"
                        ? "bg-[#EFF6FF] text-[#1D4ED8]"
                        : "text-[#475569] hover:text-[#0F172A]"
                    }`}
                  >
                    Portal Pelanggan
                  </Link>
                </>
              )}

              {user.role === "TEKNISI" && (
                <>
                  <Link
                    href="/technician"
                    className={`px-3 py-1.5 rounded-[8px] font-medium transition-colors ${
                      pathname === "/technician"
                        ? "bg-[#EFF6FF] text-[#1D4ED8]"
                        : "text-[#475569] hover:text-[#0F172A]"
                    }`}
                  >
                    Portal Teknisi
                  </Link>
                  <Link
                    href="/technician/tasks"
                    className={`px-3 py-1.5 rounded-[8px] font-medium transition-colors ${
                      pathname.startsWith("/technician/tasks")
                        ? "bg-[#EFF6FF] text-[#1D4ED8]"
                        : "text-[#475569] hover:text-[#0F172A]"
                    }`}
                  >
                    Daftar Tugas
                  </Link>
                </>
              )}

              {isAdmin && (
                <Link
                  href="/admin"
                  className="px-3 py-1.5 rounded-[8px] font-medium text-[#475569] hover:text-[#0F172A]"
                >
                  Masuk ke Portal Admin
                </Link>
              )}
            </nav>
          )}
        </div>

        {/* Right: User Profile & Role Chip & SignOut */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-[14px] font-semibold text-[#0F172A]">
                  {user.name}
                </span>
                <span className="text-[12px] text-[#475569]">{user.email}</span>
              </div>

              {/* Role Chip */}
              {user.role === "ADMIN" && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[12px] font-semibold bg-[#F1F5F9] text-[#0F172A] border border-[#CBD5E1]">
                  <ShieldCheck className="h-3.5 w-3.5 text-[#0B2A6F]" />
                  <span>Admin</span>
                </span>
              )}
              {user.role === "TEKNISI" && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[12px] font-semibold bg-[#EDE9FE] text-[#5B21B6] border border-[#DDD6FE]">
                  <Wrench className="h-3.5 w-3.5 text-[#5B21B6]" />
                  <span>Teknisi</span>
                </span>
              )}
              {user.role === "CUSTOMER" && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[12px] font-semibold bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE]">
                  <User className="h-3.5 w-3.5 text-[#1D4ED8]" />
                  <span>Pelanggan</span>
                </span>
              )}

              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/login" })}
                aria-label="Keluar dari akun"
                title="Keluar"
                className="h-[36px] w-[36px] inline-flex items-center justify-center rounded-[8px] text-[#475569] hover:bg-[#F1F5F9] hover:text-[#0F172A] transition-colors"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="h-[36px] px-3.5 inline-flex items-center justify-center rounded-[8px] bg-[#1D4ED8] text-white text-[14px] font-medium hover:bg-[#1E40AF]"
              >
                Masuk
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
