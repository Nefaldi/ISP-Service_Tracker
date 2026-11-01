import Link from "next/link";
import { auth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import {
  Ticket,
  ShieldCheck,
  Wrench,
  UserCheck,
  Radio,
  Database,
  Cloud,
  ArrowRight,
  Layers,
} from "lucide-react";

export default async function HomePage() {
  const session = await auth();

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950">
      {/* Top Header */}
      <header className="border-b border-zinc-200 bg-white/80 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-900/80">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 max-w-7xl">
          <div className="flex items-center gap-2 font-bold text-xl tracking-tight text-blue-600 dark:text-blue-400">
            <Ticket className="h-6 w-6" />
            <span>ServiceTracker</span>
          </div>

          <div className="flex items-center gap-3">
            {session?.user ? (
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
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
              <Link href="/login">
                <Button variant="primary" size="sm">
                  Masuk ke Portal
                </Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 md:py-24 text-center px-4 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 text-xs font-semibold mb-6">
          <Layers className="h-3.5 w-3.5" />
          <span>Unified Modern Monolith • Next.js App Router & TypeScript</span>
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 mb-6">
          Sistem Web Service Tracker & Manajemen Tiket Helpdesk
        </h1>

        <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto mb-8">
          Solusi terpadu pelacakan perbaikan jaringan dan tiket helpdesk berbasis peran
          (Admin, Teknisi, & Pelanggan) dengan pembaruan real-time SSE dan penyimpanan AWS S3.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link href="/login">
            <Button variant="primary" size="lg" className="gap-2">
              <span>Mulai Sekarang / Masuk</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="outline" size="lg">
              Dokumentasi Arsitektur
            </Button>
          </a>
        </div>
      </section>

      {/* Role Portals Grid */}
      <section className="container mx-auto px-4 sm:px-6 max-w-6xl pb-16">
        <h2 className="text-xl font-bold text-center text-zinc-900 dark:text-zinc-100 mb-8">
          Tiga Portal Khusus Berbasis Role (RBAC)
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Admin Helpdesk */}
          <Card className="hover:shadow-lg transition-all border-t-4 border-t-purple-600">
            <CardHeader>
              <div className="h-10 w-10 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center mb-2 dark:bg-purple-950/50 dark:text-purple-300">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <CardTitle>1. Portal Admin Helpdesk</CardTitle>
              <CardDescription>
                Role: <code className="text-purple-600 font-bold">ADMIN</code>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-zinc-600 dark:text-zinc-400">
              <p>
                Monitoring SLA analitik, verifikasi tiket Open, dan penugasan teknisi lapangan melalui Server Actions.
              </p>
              <ul className="text-xs space-y-1 list-disc list-inside text-zinc-500">
                <li>Audit log kepatuhan SLA</li>
                <li>Tabel tiket teroptimasi RSC</li>
                <li>Notifikasi real-time tiket baru</li>
              </ul>
              <div className="pt-3">
                <Link href="/admin">
                  <Button variant="outline" size="sm" className="w-full">
                    Masuk ke Admin
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Teknisi Lapangan */}
          <Card className="hover:shadow-lg transition-all border-t-4 border-t-blue-600">
            <CardHeader>
              <div className="h-10 w-10 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center mb-2 dark:bg-blue-950/50 dark:text-blue-300">
                <Wrench className="h-6 w-6" />
              </div>
              <CardTitle>2. Portal Teknisi (Mobile-First)</CardTitle>
              <CardDescription>
                Role: <code className="text-blue-600 font-bold">TEKNISI</code>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-zinc-600 dark:text-zinc-400">
              <p>
                Antarmuka mobile-first untuk merespons tugas, mengubah status menjadi In Progress, dan mengunggah foto bukti kerja.
              </p>
              <ul className="text-xs space-y-1 list-disc list-inside text-zinc-500">
                <li>To-Do list tugas interaktif</li>
                <li>Upload presigned S3 hasil kerja</li>
                <li>Pembaruan status sekali klik</li>
              </ul>
              <div className="pt-3">
                <Link href="/technician">
                  <Button variant="outline" size="sm" className="w-full">
                    Masuk ke Teknisi
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Pelanggan */}
          <Card className="hover:shadow-lg transition-all border-t-4 border-t-emerald-600">
            <CardHeader>
              <div className="h-10 w-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center mb-2 dark:bg-emerald-950/50 dark:text-emerald-300">
                <UserCheck className="h-6 w-6" />
              </div>
              <CardTitle>3. Portal Pelanggan & Tracker</CardTitle>
              <CardDescription>
                Role: <code className="text-emerald-600 font-bold">CUSTOMER</code>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-zinc-600 dark:text-zinc-400">
              <p>
                Pelaporan kendala dengan upload foto kerusakan, Live Tracker status pengerjaan via SSE, dan penilaian kepuasan CSAT.
              </p>
              <ul className="text-xs space-y-1 list-disc list-inside text-zinc-500">
                <li>Live Tracker status 5 tahap</li>
                <li>Validasi form Zod otomatis</li>
                <li>Review bintang 1-5 & penutupan tiket</li>
              </ul>
              <div className="pt-3">
                <Link href="/customer">
                  <Button variant="outline" size="sm" className="w-full">
                    Masuk ke Pelanggan
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Tech Architecture Highlights */}
      <section className="bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 py-12">
        <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            <div className="flex flex-col items-center">
              <div className="p-3 rounded-full bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400 mb-2">
                <Layers className="h-5 w-5" />
              </div>
              <h4 className="font-bold text-sm">Next.js App Router</h4>
              <p className="text-xs text-zinc-500 mt-1">Server Actions & RSC</p>
            </div>

            <div className="flex flex-col items-center">
              <div className="p-3 rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400 mb-2">
                <Radio className="h-5 w-5" />
              </div>
              <h4 className="font-bold text-sm">Real-Time SSE</h4>
              <p className="text-xs text-zinc-500 mt-1">Server-Sent Events</p>
            </div>

            <div className="flex flex-col items-center">
              <div className="p-3 rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400 mb-2">
                <Database className="h-5 w-5" />
              </div>
              <h4 className="font-bold text-sm">PostgreSQL + Prisma</h4>
              <p className="text-xs text-zinc-500 mt-1">End-to-End Type Safety</p>
            </div>

            <div className="flex flex-col items-center">
              <div className="p-3 rounded-full bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400 mb-2">
                <Cloud className="h-5 w-5" />
              </div>
              <h4 className="font-bold text-sm">AWS S3 / Cloudflare R2</h4>
              <p className="text-xs text-zinc-500 mt-1">Presigned Upload URLs</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-200 dark:border-zinc-800 py-6 text-center text-xs text-zinc-500">
        Web Service Tracker dan Manajemen Tiket Helpdesk Berbasis Role • Next.js Full Stack Monolith
      </footer>
    </div>
  );
}
