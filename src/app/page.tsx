import Link from "next/link";
import Image from "next/image";
import { auth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import {
  ShieldCheck,
  Wrench,
  User,
  ArrowRight,
  Layers,
} from "lucide-react";

export default async function HomePage() {
  const session = await auth();

  return (
    <div className="min-h-screen flex flex-col bg-[#F6F7F9]">
      {/* Top Header */}
      <header className="border-b border-[#E2E8F0] bg-white h-[64px] flex items-center px-4 sm:px-6">
        <div className="w-full flex items-center justify-between max-w-6xl mx-auto">
          <Link href="/" className="flex items-center gap-3 font-bold text-[18px] tracking-tight text-[#0B2A6F]">
            <Image
              src="/logo-zipnet.png"
              alt="Logo ZipNet"
              width={120}
              height={40}
              className="h-9 w-auto object-contain"
            />
            <span className="h-6 w-[1px] bg-[#CBD5E1]" />
            <span>Service Tracker</span>
          </Link>

          <div className="flex items-center gap-3">
            {session?.user ? (
              <div className="flex items-center gap-3">
                <span className="text-[13px] font-medium text-[#475569] hidden sm:inline">
                  {session.user.name} ({session.user.role})
                </span>
                <Link
                  href={
                    session.user.role === "ADMIN"
                      ? "/admin"
                      : session.user.role === "TEKNISI"
                      ? "/technician"
                      : "/customer"
                  }
                >
                  <Button variant="primary" size="sm">
                    Buka Dashboard
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/register">
                  <Button variant="ghost" size="sm">
                    Daftar
                  </Button>
                </Link>
                <Link href="/login">
                  <Button variant="primary" size="sm">
                    Masuk
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 md:py-20 text-center px-4 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EFF6FF] border border-[#BFDBFE] text-[#1D4ED8] text-xs font-semibold mb-6">
          <Layers className="h-4 w-4" />
          <span>Unified Modern Monolith &bull; Next.js App Router & TypeScript</span>
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-[44px] font-bold tracking-tight text-[#0F172A] mb-6 leading-tight">
          Sistem Web Service Tracker & Manajemen Tiket Helpdesk
        </h1>

        <p className="text-[16px] text-[#475569] max-w-2xl mx-auto mb-8 leading-relaxed">
          Solusi terpadu pelacakan perbaikan jaringan dan tiket helpdesk berbasis peran
          (Admin, Teknisi, & Pelanggan) dengan pembaruan real-time SSE dan penyimpanan awan terintegrasi.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link href="/login">
            <Button variant="primary" size="lg" className="h-[48px] px-6 text-[15px] gap-2">
              <span>Mulai Sekarang / Masuk</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/register">
            <Button variant="secondary" size="lg" className="h-[48px] px-6 text-[15px]">
              Daftar Akun Pelanggan
            </Button>
          </Link>
        </div>
      </section>

      {/* Role Portals Grid */}
      <section className="w-full max-w-6xl mx-auto px-4 sm:px-6 pb-16">
        <div className="text-center mb-10">
          <h2 className="text-[26px] font-bold text-[#0F172A]">
            Tiga Hak Akses Terintegrasi (RBAC)
          </h2>
          <p className="text-[14px] text-[#475569] mt-1.5">
            Setiap peran dirancang dengan antarmuka khusus sesuai alur kerja operasional
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Customer Portal */}
          <Card className="hover:border-[#1D4ED8] transition-colors">
            <CardHeader>
              <div className="h-10 w-10 rounded-[8px] bg-[#EFF6FF] text-[#1D4ED8] flex items-center justify-center mb-2">
                <User className="h-5 w-5" />
              </div>
              <CardTitle className="text-[18px]">Portal Pelanggan</CardTitle>
              <CardDescription className="text-[14px]">
                Pelaporan gangguan jaringan dan pelacakan live progress.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-[14px] text-[#475569]">
              <p>&bull; Buat laporan gangguan dengan unggah foto kerusakan</p>
              <p>&bull; Live 5-Step Stepper Tracker dengan denyut SSE</p>
              <p>&bull; Verifikasi hasil kerja & penilaian rating CSAT 1–5</p>
            </CardContent>
          </Card>

          {/* Technician Portal */}
          <Card className="hover:border-[#5B21B6] transition-colors">
            <CardHeader>
              <div className="h-10 w-10 rounded-[8px] bg-[#EDE9FE] text-[#5B21B6] flex items-center justify-center mb-2">
                <Wrench className="h-5 w-5" />
              </div>
              <CardTitle className="text-[18px]">Portal Teknisi (Mobile-First)</CardTitle>
              <CardDescription className="text-[14px]">
                Antarmuka responsif bagi teknisi di lapangan.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-[14px] text-[#475569]">
              <p>&bull; Tombol aksi sentuh 52px untuk pengerjaan instan</p>
              <p>&bull; Tombol langsung WhatsApp dan panggilan telepon</p>
              <p>&bull; Unggah bukti foto penyelesaian dan catatan teknis</p>
            </CardContent>
          </Card>

          {/* Admin Helpdesk Portal */}
          <Card className="hover:border-[#0B2A6F] transition-colors">
            <CardHeader>
              <div className="h-10 w-10 rounded-[8px] bg-[#F1F5F9] text-[#0B2A6F] flex items-center justify-center mb-2">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <CardTitle className="text-[18px]">Portal Admin Helpdesk</CardTitle>
              <CardDescription className="text-[14px]">
                Pusat kendali penugasan tiket dan analitik performa SLA.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-[14px] text-[#475569]">
              <p>&bull; Sidebar navigasi terpadu 232px dengan audit log</p>
              <p>&bull; Penugasan teknisi dan filter multi-kriteria</p>
              <p>&bull; Ekspor data CSV dan rekap kepatuhan SLA</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-[#E2E8F0] bg-white py-6 text-center text-[13px] text-[#64748B]">
        <p>Service Tracker &bull; Sistem Manajemen Layanan & Tiket Helpdesk Berbasis Role</p>
      </footer>
    </div>
  );
}
