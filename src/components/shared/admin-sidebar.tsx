"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  Ticket,
  Wrench,
  Users,
  Clock,
  Star,
  LogOut,
  Menu,
  X,
  LayoutDashboard,
} from "lucide-react";

interface AdminSidebarProps {
  user?: {
    name?: string | null;
    email?: string | null;
  } | null;
}

export function AdminSidebar({ user }: AdminSidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    {
      label: "Ikhtisar",
      href: "/admin",
      icon: LayoutDashboard,
      active: pathname === "/admin",
    },
    {
      label: "Tiket",
      href: "/admin/tickets",
      icon: Ticket,
      active: pathname.startsWith("/admin/tickets"),
    },
    {
      label: "Teknisi",
      href: "/admin/users?role=TEKNISI",
      icon: Wrench,
      active: pathname.startsWith("/admin/users") && typeof window !== "undefined" && window.location.search.includes("role=TEKNISI"),
    },
    {
      label: "Pelanggan",
      href: "/admin/users?role=CUSTOMER",
      icon: Users,
      active: pathname.startsWith("/admin/users") && (typeof window === "undefined" || !window.location.search.includes("role=TEKNISI")),
    },
    {
      label: "Laporan SLA",
      href: "/admin/reports",
      icon: Clock,
      active: pathname === "/admin/reports",
    },
    {
      label: "Analitik CSAT",
      href: "/admin/reports#csat",
      icon: Star,
      active: false,
    },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full justify-between p-4 bg-[#0B2A6F] text-white select-none">
      <div>
        {/* Brand / Logo */}
        <div className="flex items-center justify-between pb-6 pt-2 px-2 border-b border-[#1E3A8A]">
          <Link href="/admin" className="flex items-center gap-2.5">
            <Image src="/Logo.jpeg" alt="Logo" width={32} height={32} className="h-8 w-8 rounded-[8px] object-cover shrink-0" />
            <div>
              <span className="block text-[15px] font-bold tracking-tight text-white leading-tight">
                Service Tracker
              </span>
              <span className="block text-[11px] text-[#93C5FD]">
                Portal Admin Helpdesk
              </span>
            </div>
          </Link>
          {/* Mobile close button */}
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            aria-label="Tutup menu navigasi"
            className="md:hidden text-[#BFDBFE] hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="mt-6 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 text-[14px] font-medium transition-colors ${
                  item.active
                    ? "bg-[#1D4ED8] text-white rounded-[8px]"
                    : "text-[#BFDBFE] hover:bg-[#1E3A8A] hover:text-white rounded-[8px]"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User profile & Logout */}
      <div className="pt-4 border-t border-[#1E3A8A]">
        <Link
          href="/admin/profile"
          onClick={() => setMobileOpen(false)}
          className="block px-2 py-2 mb-2 rounded-[6px] hover:bg-[#1E3A8A] transition-colors"
        >
          <p className="text-[13px] font-semibold text-white truncate">
            {user?.name || "Admin Helpdesk"}
          </p>
          <p className="text-[11px] text-[#93C5FD] truncate">
            {user?.email || "admin@tracker.com"}
          </p>
        </Link>
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-[13px] font-semibold text-white bg-red-600/90 hover:bg-red-700 rounded-[8px] transition-colors shadow-xs cursor-pointer"
        >
          <LogOut className="h-4 w-4" />
          <span>Keluar dari Akun</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Top Bar with Hamburger & Direct Logout */}
      <div className="md:hidden flex items-center justify-between bg-[#0B2A6F] text-white px-4 py-3 border-b border-[#1E3A8A]">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Buka menu admin"
            className="p-1 rounded-[6px] text-white hover:bg-[#1E3A8A]"
          >
            <Menu className="h-6 w-6" />
          </button>
          <span className="font-bold text-[16px]">Service Tracker</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[12px] bg-[#1E3A8A] px-2.5 py-0.5 rounded-full text-[#BFDBFE]">
            Admin
          </span>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/login" })}
            title="Keluar"
            aria-label="Keluar dari akun admin"
            className="p-1.5 rounded-[6px] text-red-300 hover:bg-red-900/50 hover:text-white transition-colors cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Mobile Slide-out Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <div className="relative w-[232px] h-full z-10 shadow-xl">
            {sidebarContent}
          </div>
        </div>
      )}

      {/* Desktop Sticky Sidebar 232px */}
      <aside className="hidden md:flex flex-col w-[232px] shrink-0 min-h-screen border-r border-[#1E3A8A] sticky top-0 h-screen">
        {sidebarContent}
      </aside>
    </>
  );
}
