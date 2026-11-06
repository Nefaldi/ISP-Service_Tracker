# Web Service Tracker & Helpdesk Management System

Sistem Informasi Web Service Tracker dan Manajemen Tiket Helpdesk Berbasis Role menggunakan arsitektur **Full Stack Modern Monolith (Single Codebase)** berbasis **Next.js (App Router)** dan **TypeScript**.

---

##  Fitur Utama & Arsitektur Sistem

Berdasarkan dokumen `spesifikasi_tech_stack_full_stack_next_js.md`, sistem ini mengintegrasikan:

1. **Framework Utama:**
   - **Next.js (App Router)** & **TypeScript** murni end-to-end.
   - **Tailwind CSS** untuk tata letak modern dan responsif (Mobile-First pada portal teknisi).
   - **React Server Components (RSC)** untuk rendering cepat tabel admin dan analitik server-side.
   - **Interactive Client Components (`'use client'`)** untuk interaksi form, modal bukti kerja, dan live progress tracker.

2. **Backend & Server Actions:**
   - Next.js **Server Actions** menggantikan REST boilerplate dengan validasi skema **Zod**:
     - `createTicket()`: Pembuatan tiket laporan gangguan oleh pelanggan.
     - `assignTechnician()`: Penugasan tiket ke teknisi oleh admin.
     - `startProgress()`: Teknisi memulai penanganan tiket lapangan.
     - `resolveTicket()`: Teknisi mengunggah hasil perbaikan dan catatan teknis.
     - `closeTicketAndReview()`: Pelanggan memverifikasi hasil kerja dan memberikan rating CSAT bintang 1–5.
   - **Route Handlers (`/app/api/...`)**:
     - `/api/auth/[...nextauth]`: Handler otentikasi session NextAuth.
     - `/api/sse`: Endpoint Server-Sent Events (SSE) untuk broadcast notifikasi live.

3. **Keamanan & Otorisasi RBAC:**
   - **Auth.js (NextAuth v5)** dengan provider Kredensial dan sesi berbasis JWT.
   - **Next.js Middleware (`src/middleware.ts`)** sebagai gerbang filter RBAC ketat:
     - Rute `/admin/*` hanya dapat diakses peran `ADMIN`.
     - Rute `/technician/*` hanya dapat diakses peran `TEKNISI`.
     - Rute `/customer/*` hanya dapat diakses peran `CUSTOMER`.

4. **Basis Data & ORM:**
   - **PostgreSQL** & **Prisma ORM** dengan relasi terstruktur:
     - `User` (Admin, Teknisi, Customer)
     - `Ticket` (Open $\rightarrow$ Assigned $\rightarrow$ In Progress $\rightarrow$ Resolved $\rightarrow$ Closed)
     - `TicketLog` (Audit trail histori perubahan status untuk kepatuhan SLA)
     - `Feedback` (Penilaian kepuasan CSAT bintang 1–5)

5. **Komunikasi Real-Time:**
   - **Server-Sent Events (SSE)** via `src/lib/sse-broker.ts` dan client listener `SSEListener`.
   - Update status pengerjaan instan tanpa perlu memuat ulang halaman peramban.

6. **Penyimpanan Berkas Cloud:**
   - **AWS S3 / Cloudflare R2** via `@aws-sdk/client-s3` dan Presigned URL generator.

---

## 📁 Struktur Direktori Proyek

```text
.
├── prisma/
│   ├── schema.prisma           # Skema tabel database PostgreSQL & relasi
│   └── seed.js                 # Skrip seed akun demo & sampel tiket
├── public/                     # Aset publik & favicon
├── src/
│   ├── actions/                # Next.js Server Actions (Mutasi Data Bisnis)
│   │   ├── ticket.actions.ts   # createTicket, assignTechnician, startProgress, resolveTicket, close
│   │   └── user.actions.ts     # registerUser, getTechnicians, getUsersByRole
│   ├── app/                    # Routing App Router
│   │   ├── (auth)/             # Route Group Autentikasi
│   │   │   └── login/page.tsx  # Halaman login dengan tombol Quick-Fill Demo
│   │   ├── (dashboard)/        # Layout terproteksi sesi & RBAC
│   │   │   ├── admin/          # Portal Admin Helpdesk
│   │   │   │   ├── tickets/    # Manajemen & Penugasan Tiket
│   │   │   │   └── page.tsx    # Dashboard Analitik & Audit Log SLA
│   │   │   ├── technician/     # Portal Teknisi (Mobile-First)
│   │   │   │   ├── tasks/      # Daftar Seluruh Tugas
│   │   │   │   └── page.tsx    # Antarmuka Eksekusi Pengerjaan
│   │   │   └── customer/       # Portal Pelanggan
│   │   │       ├── track/[id]/ # Live Tracker 5 Tahap & Review Bintang
│   │   │       └── page.tsx    # Buat Laporan & Riwayat Tiket
│   │   ├── api/
│   │   │   ├── auth/[...nextauth]/route.ts # Route Handler Auth.js
│   │   │   └── sse/route.ts    # Route Handler Server-Sent Events
│   │   ├── layout.tsx          # Root Layout dengan SSE Listener Global
│   │   └── page.tsx            # Halaman Beranda (Landing Page)
│   ├── components/
│   │   ├── forms/              # LoginForm, CreateTicketForm, TechnicianActions, ReviewCard
│   │   ├── shared/             # Navbar, SSEListener (Real-time Toasts)
│   │   └── ui/                 # Button, Badge, Card
│   ├── lib/
│   │   ├── auth.ts             # Konfigurasi Auth.js v5 (JWT & Credentials)
│   │   ├── prisma.ts           # Prisma Client Singleton
│   │   ├── s3.ts               # AWS S3 Client & Presigned URL Generator
│   │   ├── sse-broker.ts       # SSE Event Broadcaster
│   │   └── utils.ts            # Formatting helper & Tailwind utilities
│   ├── types/
│   │   └── next-auth.d.ts      # TypeScript declaration untuk Role pada Session & JWT
│   └── middleware.ts           # Next.js Middleware Guard (RBAC)
├── .env.example
├── package.json
└── tsconfig.json
```

---

## ⚡ Panduan Memulai Cepat (Quick Start)

### 1. Prasyarat Sistem
- **Node.js** v20+ atau v24+
- **PostgreSQL Database** (Lokal, Supabase, Neon, atau Docker)

### 2. Salin Konfigurasi Environment
```bash
cp .env.example .env
```
Sesuaikan `DATABASE_URL` dengan kredensial database PostgreSQL Anda:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/web_service_tracker?schema=public"
AUTH_SECRET="super-secret-auth-key-change-this-in-production-min-32-chars"
```

### 3. Migrasi Skema Database & Sinkronisasi
Jalankan sinkronisasi skema ke database PostgreSQL:
```bash
npm run prisma:push
```

### 4. Mengisi Data Awal (Seeding)
Isi database dengan akun demo dan tiket sampel pada berbagai siklus hidup:
```bash
npm run prisma:seed
```

### 5. Jalankan Server Pengembangan
```bash
npm run dev
```
Buka browser pada: [http://localhost:3000](http://localhost:3000)

---

## 🔑 Akun Demo Bawaan (Quick Login)

Pada halaman login (`/login`), terdapat tombol klik instan untuk mengisi kredensial:

| Peran (Role) | Email | Kata Sandi | Akses Portal |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@tracker.com` | `admin123` | `/admin` & `/admin/tickets` |
| **Teknisi** | `teknisi@tracker.com` | `teknisi123` | `/technician` & `/technician/tasks` |
| **Pelanggan** | `customer@tracker.com` | `customer123` | `/customer` & `/customer/track/[id]` |

---

## 🔄 Matriks Siklus Hidup Tiket & Alur Aksi

1. **Open:**
   - Pelanggan membuat tiket melalui formulir di `/customer` (`createTicket()`).
   - Tiket disimpan di database dan notifikasi SSE dipancarkan ke Dashboard Admin.
2. **Assigned:**
   - Admin melihat tiket pada tabel `/admin/tickets` dan memilih teknisi pelaksana (`assignTechnician()`).
   - Riwayat dicatat di `TicketLog` dan teknisi menerima notifikasi tugas.
3. **In Progress:**
   - Teknisi membuka portal `/technician` dan menekan tombol *Mulai Pengerjaan* (`startProgress()`).
   - Status pada *Live Tracker* pelanggan langsung berganti otomatis via SSE.
4. **Resolved:**
   - Teknisi menyelesaikan perbaikan dan mengunggah foto bukti kerja via S3 (`resolveTicket()`).
   - Notifikasi penyelesaian terkirim ke pelanggan.
5. **Closed:**
   - Pelanggan membuka `/customer/track/[id]`, memverifikasi hasil kerja, dan memberikan ulasan bintang 1–5 (`closeTicketAndReview()`).
   - Tiket berstatus `CLOSED`, rating kepuasan CSAT dan SLA terakumulasi di Dashboard Admin.
