import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { AuthContainer } from "@/components/forms/auth-container";
import { Wrench, User, ShieldCheck } from "lucide-react";

export const metadata = {
  title: "Daftar Akun - Service Tracker",
};

export default function RegisterPage() {
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-white">
      {/* Brand Panel (Kiri di desktop dengan Background Server Rack ZipNet) */}
      <div className="relative hidden lg:flex flex-col justify-between overflow-hidden p-12 lg:p-16 text-white min-h-screen">
        <Image
          src="/4f992cf6d1ed8b70b47ad218a49dd046.jpg"
          alt="Server Rack Jaringan ZipNet"
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover object-center"
        />
        {/* Lapisan overlay agar teks tetap terbaca sangat kontras dan profesional */}
        <div className="absolute inset-0 bg-[#0B2A6F]/75 mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B2A6F] via-[#0B2A6F]/65 to-[#0B2A6F]/40" />

        {/* Header Logo */}
        <div className="relative z-10">
          <Link
            href="/login"
            className="inline-flex items-center gap-3 text-sm font-semibold tracking-wider text-[#BFDBFE] hover:text-white transition-colors"
          >
            <div className="bg-white px-2.5 py-1.5 rounded-[10px] shadow-sm flex items-center justify-center">
              <Image
                src="/logo-zipnet.png"
                alt="Logo ZipNet"
                width={70}
                height={28}
                style={{ width: "auto" }}
                className="h-6 w-auto object-contain"
              />
            </div>
            <span className="font-bold text-[16px] text-white drop-shadow-xs">Service Tracker</span>
          </Link>

          <div className="mt-20 max-w-lg">
            <h2 className="text-[42px] font-bold leading-tight tracking-tight text-white drop-shadow-sm">
              Sistem Manajemen Layanan & Tiket Helpdesk
            </h2>
            <p className="mt-6 text-[16px] leading-relaxed text-[#DBEAFE] drop-shadow-xs">
              Solusi terpadu untuk pelacakan gangguan jaringan secara real-time,
              penugasan teknisi lapangan terukur, dan kepatuhan SLA berstandar tinggi.
            </p>
          </div>
        </div>

        {/* 3 Role Chips di bagian bawah */}
        <div className="relative z-10">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#93C5FD] mb-3">
            Akses Multi-Peran (RBAC):
          </p>
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-[#0B2A6F]/80 backdrop-blur-md border border-[#3B82F6]/50 text-sm font-medium text-white shadow-xs">
              <User className="h-4 w-4 text-[#93C5FD]" />
              <span>Pelanggan</span>
            </div>
            <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-[#0B2A6F]/80 backdrop-blur-md border border-[#3B82F6]/50 text-sm font-medium text-white shadow-xs">
              <Wrench className="h-4 w-4 text-[#93C5FD]" />
              <span>Teknisi</span>
            </div>
            <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-[#0B2A6F]/80 backdrop-blur-md border border-[#3B82F6]/50 text-sm font-medium text-white shadow-xs">
              <ShieldCheck className="h-4 w-4 text-[#93C5FD]" />
              <span>Admin Helpdesk</span>
            </div>
          </div>
        </div>
      </div>

      {/* Form Panel (Kanan) */}
      <div className="flex flex-col justify-center items-center px-6 py-12 lg:px-12 bg-white">
        {/* Mobile Header Banner with the same Server Rack Background */}
        <div className="lg:hidden w-full max-w-[420px] mb-6 relative rounded-[14px] overflow-hidden p-5 text-white shadow-sm">
          <Image
            src="/4f992cf6d1ed8b70b47ad218a49dd046.jpg"
            alt="ZipNet Network"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-[#0B2A6F]/80 mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B2A6F] to-[#0B2A6F]/60" />
          <div className="relative z-10 flex items-center justify-between">
            <div className="bg-white px-2.5 py-1.5 rounded-[8px] shadow-xs flex items-center justify-center">
              <Image
                src="/logo-zipnet.png"
                alt="Logo ZipNet"
                width={70}
                height={28}
                style={{ width: "auto" }}
                className="h-6 w-auto object-contain"
              />
            </div>
            <span className="text-xs font-bold tracking-wider uppercase text-[#BFDBFE]">
              Service Tracker
            </span>
          </div>
        </div>

        <Suspense
          fallback={
            <div className="text-sm text-[#475569]">Memuat formulir autentikasi...</div>
          }
        >
          <AuthContainer initialTab="register" />
        </Suspense>
      </div>
    </div>
  );
}
