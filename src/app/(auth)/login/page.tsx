import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { AuthContainer } from "@/components/forms/auth-container";
import { Wrench, User, ShieldCheck } from "lucide-react";

export const metadata = {
  title: "Masuk & Registrasi - Service Tracker",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-white">
      {/* Brand Panel (Kiri di desktop, disembunyikan/header di mobile) */}
      <div className="hidden lg:flex flex-col justify-between bg-[#0B2A6F] text-white p-12 lg:p-16">
        <div>
          <Link
            href="/login"
            className="inline-flex items-center gap-3 text-sm font-semibold tracking-wider text-[#BFDBFE] hover:text-white transition-colors"
          >
            <div className="bg-white px-2 py-1 rounded-[8px] shadow-xs flex items-center justify-center">
              <Image
                src="/logo-zipnet.png"
                alt="Logo ZipNet"
                width={70}
                height={28}
                style={{ width: "auto" }}
                className="h-6 w-auto object-contain"
              />
            </div>
            <span className="font-bold text-[16px] text-white">Service Tracker</span>
          </Link>

          <div className="mt-20 max-w-lg">
            <h2 className="text-[44px] font-bold leading-tight tracking-tight text-white">
              Sistem Manajemen Layanan & Tiket Helpdesk
            </h2>
            <p className="mt-6 text-[16px] leading-relaxed text-[#BFDBFE]">
              Solusi terpadu untuk pelacakan gangguan jaringan secara real-time,
              penugasan teknisi lapangan terukur, dan kepatuhan SLA berstandar tinggi.
            </p>
          </div>
        </div>

        {/* 3 Role Chips di bagian bawah */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[#93C5FD] mb-3">
            Akses Multi-Peran (RBAC):
          </p>
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-[#1E3A8A]/60 border border-[#3B82F6]/40 text-sm font-medium text-white">
              <User className="h-4 w-4 text-[#93C5FD]" />
              <span>Pelanggan</span>
            </div>
            <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-[#1E3A8A]/60 border border-[#3B82F6]/40 text-sm font-medium text-white">
              <Wrench className="h-4 w-4 text-[#93C5FD]" />
              <span>Teknisi</span>
            </div>
            <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-[#1E3A8A]/60 border border-[#3B82F6]/40 text-sm font-medium text-white">
              <ShieldCheck className="h-4 w-4 text-[#93C5FD]" />
              <span>Admin Helpdesk</span>
            </div>
          </div>
        </div>
      </div>

      {/* Form Panel (Kanan) */}
      <div className="flex flex-col justify-center items-center px-6 py-12 lg:px-12 bg-white">
        <div className="lg:hidden w-full max-w-[420px] mb-6">
          <Link
            href="/login"
            className="text-xs font-bold tracking-wider uppercase text-[#0B2A6F]"
          >
            Service Tracker
          </Link>
        </div>

        <Suspense
          fallback={
            <div className="text-sm text-[#475569]">Memuat formulir autentikasi...</div>
          }
        >
          <AuthContainer initialTab="login" />
        </Suspense>
      </div>
    </div>
  );
}
