# Spesifikasi Teknis & Arsitektur Full Stack Next.js

## Sistem Informasi Web Service Tracker dan Manajemen Tiket Helpdesk Berbasis Role

### 1. Ringkasan Arsitektur Sistem (Unified Modern Monolith)

Sistem ini mengadopsi pendekatan arsitektur **Full Stack Modern Monolith (Single Codebase)** menggunakan **Next.js (App Router)** berbasis bahasa pemrograman **TypeScript**. 

Pendekatan ini menyatukan antarmuka pengguna (*frontend*), logika bisnis (*backend/server actions*), dan routing API ke dalam satu repositori terpadu tanpa menghilangkan batas modularitas antara sisi klien (*client-side*) dan sisi server (*server-side*).

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    NEXT.JS APPLICATION (SINGLE REPO)                    │
│                                                                         │
│  ┌─────────────────────────────────┐   ┌─────────────────────────────┐  │
│  │    PRESENTATION LAYER (UI)      │   │     EDGE / MIDDLEWARE       │  │
│  │ - React Server Components (RSC) │   │ - Next.js Middleware        │  │
│  │ - Interactive Client Components │   │ - RBAC Guard & Route Filter │  │
│  │ - Tailwind CSS / UI Components  │   │ - Session Verification      │  │
│  └────────────────┬────────────────┘   └──────────────┬──────────────┘  │
│                   │                                   │                 │
│                   ▼                                   ▼                 │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                      APPLICATION LAYER (BACKEND)                  │  │
│  │ - Server Actions (Mutasi Data Langsung dari Form/UI)              │  │
│  │ - Route Handlers (`/api/...` untuk Integrasi Eksternal & SSE)     │  │
│  │ - Auth.js (NextAuth) Session & Token Engine                       │  │
│  │ - Event Emitter / Real-Time Broadcaster (SSE Engine)              │  │
│  └────────────────────────────────┬──────────────────────────────────┘  │
└───────────────────────────────────┼─────────────────────────────────────┘
                                    │ Prisma ORM / S3 SDK
                 ┌──────────────────┴──────────────────┐
                 ▼                                     ▼
  ┌──────────────────────────────┐      ┌─────────────────────────────┐
  │        DATABASE LAYER        │      │        STORAGE LAYER        │
  │      PostgreSQL Engine       │      │   AWS S3 / Cloudflare R2    │
  │   - Relational Data Schema   │      │  - Foto Kerusakan Jaringan  │
  │   - Audit Logs & SLA Metrics │      │  - Foto Bukti Hasil Kerja   │
  └──────────────────────────────┘      └─────────────────────────────┘
```

---

### 2. Rincian Komponen Tech Stack

#### 2.1 Framework Inti: Next.js (App Router) & TypeScript

* **Peran:** Kerangka kerja utama yang mengelola rendering antarmuka, routing aplikasi, eksekusi kode server, dan penanganan API.
* **Fitur Utama:**
  * **End-to-End Type Safety:** Penggunaan TypeScript menjamin tipe data pada skema database, input formulir, hingga respons antarmuka bersifat konsisten dan divalidasi sejak tahap kompilasi.
  * **React Server Components (RSC):** Halaman dashboard admin dan rekap laporan di-*render* langsung di server untuk memangkas ukuran JavaScript yang dikirim ke peramban, meningkatkan kecepatan muat halaman secara drastis.
  * **Client Components (`'use client'`):** Digunakan khusus pada elemen interaktif seperti formulir pelaporan dengan *drag-and-drop* foto, modal konfirmasi, dan komponen *live tracking* status.

#### 2.2 Backend & Data Mutation: Server Actions & Route Handlers

* **Server Actions:**
  * Menghilangkan kebutuhan untuk menulis kode *boilerplate* REST API terpisah.
  * Memungkinkan fungsi server (seperti `assignTicket(ticketId, techId)` atau `resolveTicket(formData)`) dipanggil langsung dari antarmuka React dengan validasi otomatis menggunakan pustaka schema seperti **Zod**.
* **Route Handlers (`app/api/...`):**
  * Digunakan untuk menangani *endpoint* khusus yang membutuhkan kontrol *stream* HTTP, integrasi webhook eksternal, atau penyediaan data mentah format JSON.

#### 2.3 Data Layer: PostgreSQL & Prisma ORM

* **PostgreSQL:**
  * Bertindak sebagai basis data relasional utama untuk menjamin integritas referensial data penugasan tiket dan audit kepatuhan SLA.
* **Prisma ORM:**
  * **Type-Safe Database Client:** Setiap kueri database menghasilkan tipe data TypeScript yang sinkron dengan skema tabel.
  * **Automated Migrations:** Memudahkan pelacakan versi skema basis data (`prisma migrate`) selama masa pengembangan tim.
  * **Relation Handling:** Menyederhanakan penarikan data relasional bertingkat (misalnya menarik data tiket sekaligus dengan data teknisi, log histori, dan profil pelanggan dalam satu panggilan kueri teroptimasi).

#### 2.4 Real-Time Communication: Server-Sent Events (SSE) / Webhook

* **Pendekatan Real-Time pada Next.js:**
  * **Server-Sent Events (SSE) via Route Handler:** Mengingat kebutuhan utama pelanggan adalah menerima pembaruan satu arah dari server saat status pengerjaan berubah (dari *Open* $\rightarrow$ *Assigned* $\rightarrow$ *In Progress* $\rightarrow$ *Resolved*), SSE merupakan pilihan yang sangat ringan dan native di atas protokol HTTP standar tanpa memerlukan konfigurasi server WebSocket yang rumit.
  * **Alternatif (Socket Engine / Pusher):** Jika sistem di-deploy pada VPS (menggunakan *custom Node.js server*), pustaka Socket.io dapat diintegrasikan, atau memanfaatkan managed service seperti Pusher / Supabase Realtime untuk skala *serverless*.

#### 2.5 Security & Access Control: Auth.js (NextAuth) & Middleware

* **Next.js Middleware (`middleware.ts`):**
  * Berjalan pada lapisan terluar sebelum permintaan mencapai halaman atau fungsi backend.
  * Memvalidasi token sesi dan melakukan pengecekan RBAC secara ketat:
    * Akses ke `/admin/*` diverifikasi memiliki peran `role === 'ADMIN'`.
    * Akses ke `/technician/*` diverifikasi memiliki peran `role === 'TEKNISI'`.
    * Akses ke `/customer/*` diverifikasi memiliki peran `role === 'CUSTOMER'`.
  * Pengguna tanpa otorisasi langsung dialihkan (*redirect*) ke halaman login atau mendapatkan respons status HTTP 403 Forbidden.

#### 2.6 Storage Layer: AWS S3 / Cloudflare R2

* Menggunakan pustaka resmi `@aws-sdk/client-s3`.
* Penanganan unggah berkas dilakukan secara efisien melalui mekanisme **Presigned URL**:
  1. Klien meminta URL unggah sementara dari Next.js Server Action.
  2. Klien mengunggah berkas foto langsung ke bucket penyimpanan awan.
  3. Server hanya menyimpan URL hasil unggahan ke tabel database PostgreSQL, mencegah beban pemrosesan *payload* biner pada server aplikasi.

---

### 3. Matriks Alur Kerja Siklus Hidup Tiket (Next.js Edition)

| Siklus Hidup Tiket | Komponen Antarmuka (Next.js) | Mekanisme Backend / Mutasi | Operasi Database (Prisma) | Pembaruan Real-Time |
| :--- | :--- | :--- | :--- | :--- |
| **1. Open** | Client Form (`'use client'`) + Zod Validator | Next.js Server Action: `createTicket()` | `prisma.ticket.create()` | Notifikasi SSE dipancarkan ke Dashboard Admin |
| **2. Assigned** | Admin Dashboard Table (Server Component) | Next.js Server Action: `assignTechnician()` | `prisma.ticket.update()` & `prisma.ticketLog.create()` | Notifikasi tugas masuk ke To-Do List teknisi |
| **3. In Progress** | Mobile Technician Action Button | Next.js Server Action: `startProgress()` | `prisma.ticket.update({ status: 'IN_PROGRESS' })` | Status pada *Live Tracker* pelanggan berganti instan via SSE |
| **4. Resolved** | Modal Upload Bukti Kerja + Catatan Teknis | Presigned URL S3 + Server Action: `resolveTicket()` | `prisma.ticket.update({ status: 'RESOLVED' })` | Notifikasi penyelesaian terkirim ke gawai pelanggan |
| **5. Closed** | Customer Verification Card & Star Rating | Next.js Server Action: `closeTicketAndReview()` | `prisma.feedback.create()` & update tiket ke `CLOSED` | Rekap metrik CSAT dan SLA terakumulasi di analitik |

---

### 4. Struktur Direktori Proyek (Next.js App Router)

```text
web-service-tracker/
├── prisma/
│   └── schema.prisma           # Definisi skema tabel & relasi database
├── public/                     # Aset statis (logo, ikon, gambar publik)
├── src/
│   ├── app/                    # Routing berbasis App Router
│   │   ├── (auth)/             # Route group: Halaman Login & Registrasi
│   │   │   └── login/
│   │   │       └── page.tsx
│   │   ├── (dashboard)/        # Route group dengan tata letak dashboard terproteksi
│   │   │   ├── admin/          # Antarmuka Admin Helpdesk
│   │   │   │   ├── tickets/
│   │   │   │   └── page.tsx
│   │   │   ├── technician/     # Antarmuka Teknisi (Mobile-First)
│   │   │   │   └── tasks/
│   │   │   │       └── page.tsx
│   │   │   └── customer/       # Antarmuka Pelanggan & Live Tracker
│   │   │       ├── track/[id]/
│   │   │       └── page.tsx
│   │   └── api/                # Route Handlers
│   │       ├── auth/[...nextauth]/route.ts
│   │       └── sse/            # Endpoint stream notifikasi real-time
│   │           └── route.ts
│   ├── components/             # Komponen UI modular yang dapat digunakan ulang
│   │   ├── forms/
│   │   ├── shared/
│   │   └── ui/
│   ├── actions/                # Next.js Server Actions (Mutasi data bisnis)
│   │   ├── ticket.actions.ts
│   │   └── user.actions.ts
│   ├── lib/                    # Utilitas konfigurasi
│   │   ├── auth.ts             # Konfigurasi Auth.js
│   │   ├── prisma.ts           # Inisialisasi Prisma Client Singleton
│   │   ├── s3.ts               # Klien koneksi AWS S3 / Presigned URL generator
│   │   └── sse-broker.ts       # Manajemen event stream SSE
│   └── middleware.ts           # Gerbang RBAC & Otorisasi Rute
├── .env.example
├── package.json
└── tsconfig.json
```

---

### 5. Analisis Komparasi: Stack Awal vs. Full Stack Next.js

| Parameter Evaluasi | Stack Awal (Golang + React.js) | Stack Baru (Full Stack Next.js) |
| :--- | :--- | :--- |
| **Jumlah Basis Kode** | 2 Repositori terpisah (*Frontend* & *Backend*) | 1 Repositori tunggal (*Monorepo Unified*) |
| **Bahasa Pemrograman** | Poliglot (Go & JavaScript/TypeScript) | Monoglot (Full TypeScript murni) |
| **Kecepatan Pengembangan** | Sedang (Perlu menyelaraskan API kontrak & DTO) | Sangat Cepat (Tipe data database langsung terhubung ke UI) |
| **Alur Autentikasi** | Manual via JWT Generator, Handler, & Header | Terintegrasi via Auth.js (NextAuth) + `middleware.ts` |
| **Operasi Database** | Kueri SQL manual / GORM | Prisma ORM dengan *auto-completion* penuh |
| **Karakteristik Real-time** | Gorilla WebSocket *stateful* berkecepatan tinggi | Server-Sent Events (SSE) yang efisien dan ramah HTTP |
| **Kompleksitas Deployment** | Dua proses deployment berbeda (Server Go & Web React) | Satu proses deployment terpadu (Vercel / Docker Container) |

---

### 6. Kesimpulan

Mengalihkan arsitektur ke **Full Stack Next.js** merupakan keputusan strategis yang tepat untuk mempercepat realisasi proyek sistem helpdesk ini. 

Dengan siklus pengembangan SDLC yang berdurasi 10 minggu, penggunaan ekosistem tunggal TypeScript memangkas waktu pengerjaan API secara signifikan, mengeliminasi duplikasi definisi tipe data, serta menyediakan pengelolaan otorisasi berbasis peran (RBAC) yang rapi langsung dari lapisan *middleware*.