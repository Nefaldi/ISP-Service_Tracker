# AI Context: Desain UI/UX Service Tracker (Helpdesk Berbasis Role)

Dokumen ini adalah konteks untuk AI coding assistant (Claude Code, Cursor, Copilot, dll.) agar mengimplementasikan UI yang konsisten dengan desain. Baca seluruh dokumen sebelum membuat atau mengubah komponen UI.

- **Desain acuan (canvas):** https://claude.ai/artifact/45sTR9eWGenpM1FLdb18D6
- **Tech stack:** Next.js (App Router), TypeScript, Tailwind CSS, Prisma, PostgreSQL, Auth.js, SSE untuk real-time
- **Bahasa antarmuka:** Bahasa Indonesia. Istilah status tiket tetap dalam bahasa Inggris: `Open`, `Assigned`, `In Progress`, `Resolved`, `Closed`.

---

## 1. Aturan Utama (WAJIB)

1. Semua teks UI berbahasa Indonesia, kecuali nama status tiket.
2. Jangan menambahkan emoji. Ikon memakai SVG stroke (disarankan `lucide-react`).
3. Gunakan elemen semantik: `<button>`, `<a href>`, `<input>` + `<label>`. Jangan pakai `div` dengan `onClick`.
4. Tombol ikon tanpa teks wajib punya `aria-label`.
5. Touch target minimum 44px (teknisi: tombol aksi utama 52px).
6. Kontras teks minimal 4.5:1. Jangan membedakan status hanya dengan warna: selalu sertakan teks label.
7. Jangan membuat data, statistik, atau teks dummy (lorem ipsum) di kode produksi. Ambil dari database lewat Prisma.
8. Halaman web harus responsif sampai lebar ponsel. Tabel lebar harus bisa di-scroll horizontal di dalam wadahnya sendiri.
9. Halaman Admin dan Pelanggan: *Server Component* secara default. Gunakan `'use client'` hanya untuk elemen interaktif (form upload foto, modal, live tracker SSE).

---

## 2. Design Tokens

### Warna

| Token | Hex | Penggunaan |
| :--- | :--- | :--- |
| `brand-900` | `#0B2A6F` | Panel brand login, sidebar admin |
| `brand-600` | `#1D4ED8` | Tombol utama, link, langkah aktif, item nav aktif |
| `brand-100` | `#DBEAFE` | Ring langkah aktif, badge Assigned |
| `brand-50` | `#EFF6FF` | Kartu SLA, info box |
| `brand-border` | `#BFDBFE` | Border kartu SLA |
| `ink` | `#0F172A` | Teks utama |
| `muted` | `#475569` | Teks sekunder (kontras lolos di atas putih) |
| `placeholder` | `#64748B` | Langkah belum tercapai, hint |
| `border` | `#E2E8F0` | Border kartu dan tabel |
| `border-input` | `#94A3B8` | Border input dan tombol sekunder |
| `bg-app` | `#F6F7F9` | Latar halaman |
| `surface` | `#FFFFFF` | Kartu, input |
| `success-700` | `#047857` | Tombol "Tandai Selesai" |

### Warna Status Tiket (badge: teks + latar)

| Status | Teks | Latar |
| :--- | :--- | :--- |
| `Open` | `#92400E` | `#FEF3C7` |
| `Assigned` | `#1D4ED8` | `#DBEAFE` |
| `In Progress` | `#5B21B6` | `#EDE9FE` |
| `Resolved` | `#065F46` | `#D1FAE5` |
| `Closed` | `#334155` | `#E2E8F0` |

Sarankan memetakan token di atas ke `tailwind.config.ts` (`theme.extend.colors`) dan satu komponen `StatusBadge` yang menerima enum `TicketStatus`.

### Tipografi

- **Font:** Inter (400, 500, 600, 700), fallback `sans-serif`. Muat lewat `next/font/google`.
- Judul halaman: 26-30px, bold. Judul kartu: 18px, semibold. Isi: 15px. Teks sekunder: 14px. Badge: 13px semibold.
- Angka besar (SLA, kartu statistik): 32px bold.

### Bentuk dan Spasi

- Radius: kartu 12px, input/tombol 8px (tombol mobile 10px), badge `9999px`.
- Tinggi kontrol: input dan tombol 44-48px, tombol kecil di tabel 36px, tombol aksi utama teknisi 52px.
- Padding kartu: 16px (mobile) / 24px (desktop). Jarak antar kartu: 16-24px.
- Konten halaman pelanggan: `max-width: 1120px`, rata tengah.
- Border kartu: `1px solid #E2E8F0`. Tanpa shadow berat. Satu-satunya efek shadow: ring langkah aktif stepper (`0 0 0 4px #DBEAFE`).

---

## 3. Peran dan Rute

| Peran | Enum | Rute dasar | Perangkat utama |
| :--- | :--- | :--- | :--- |
| Pelanggan | `CUSTOMER` | `/customer/*` | Desktop dan mobile |
| Teknisi | `TEKNISI` | `/technician/*` | **Mobile-first** (390px) |
| Admin Helpdesk | `ADMIN` | `/admin/*` | Desktop |

Setelah login, redirect sesuai peran. Pengguna yang mengakses rute peran lain diarahkan ke login atau mendapat 403 (ditangani `middleware.ts`).

---

## 4. Spesifikasi Layar

### 4.1 Login (`/login`)

- Layout dua kolom (grid 1fr 1fr). Di mobile, kolom brand disembunyikan atau diringkas jadi header.
- **Kiri (brand-900, teks putih):** nama "Service Tracker" (kiri atas), headline besar 44px, paragraf pendukung, tiga chip peran (Pelanggan, Teknisi, Admin) di bawah.
- **Kanan (putih):** form maksimum 380px, rata tengah vertikal dan horizontal.
  - Judul "Masuk ke akun Anda", subjudul "Anda akan diarahkan sesuai peran akun."
  - Field Email dan Kata sandi (label di atas input, tinggi 48px).
  - Tombol "Masuk" (full width, `brand-600`).
  - Link "Belum punya akun? Daftar sebagai pelanggan".
- Tampilkan pesan error validasi (Zod) di bawah field terkait, warna merah dengan kontras lolos, bukan hanya perubahan warna border.

### 4.2 Pelanggan: Live Tracker (`/customer/track/[id]`)

Urutan dari atas ke bawah:

1. **Header aplikasi:** nama produk di kiri, nama pengguna dan peran di kanan.
2. **Judul tiket:** kode tiket (14px, muted) di atas judul masalah (30px bold). Tombol sekunder "+ Buat tiket baru" di kanan.
3. **Stepper 5 tahap** dalam satu kartu putih: `Open` → `Assigned` → `In Progress` → `Resolved` → `Closed`.
   - Selesai: lingkaran 36px solid `brand-600`, teks putih.
   - Aktif: lingkaran putih, border 2px `brand-600`, ring `#DBEAFE`.
   - Belum: lingkaran putih, border `#CBD5E1`, angka `#64748B`.
   - Label di bawah lingkaran, 14px semibold.
   - Di layar sempit, stepper boleh berubah jadi vertikal.
4. **Grid dua kolom** (auto-fit, min 320px):
   - Kolom kiri: kartu "Riwayat pengerjaan", daftar log terbaru di atas (judul peristiwa tebal + waktu di bawahnya, muted). Sumber: tabel `TicketLog`.
   - Kolom kanan: kartu "Teknisi" (nama dan jabatan) dan kartu SLA (latar `brand-50`, label, hitung mundur 32px bold, keterangan "tersisa dari N jam").
5. **Real-time:** komponen client berlangganan endpoint SSE `/api/sse`. Saat status berubah, stepper dan riwayat diperbarui tanpa reload.
6. **Tahap Closed (belum didesain):** tampilkan kartu verifikasi dengan rating bintang (1-5) dan komentar. Aksi: `closeTicketAndReview()`.

### 4.3 Admin: Dashboard Tiket (`/admin/tickets`)

- **Sidebar** kiri 232px, latar `brand-900`, teks putih. Item: Tiket (aktif: latar `brand-600`, radius 8px), Teknisi, Pelanggan, Laporan SLA, Analitik CSAT. Di mobile, ganti dengan menu hamburger.
- **Header konten:** judul "Dashboard Helpdesk" dan kolom cari (`aria-label="Cari tiket"`, lebar 280px).
- **Empat kartu ringkasan** (grid auto-fit, min 180px): Tiket baru (Open), Sedang dikerjakan, Mendekati batas SLA, Rata-rata CSAT. Angka diambil dari query agregat Prisma (Server Component).
- **Tabel tiket** dalam kartu putih dengan `overflow-x: auto`: kolom Tiket, Pelanggan, Status (`StatusBadge`), Teknisi, Aksi.
  - Tiket `Open`: aksi "Tugaskan" (tombol outline `brand-600`, tinggi 36px). Membuka modal pilih teknisi lalu memanggil `assignTechnician()`.
  - Tiket lain: aksi "Lihat".
  - Header kolom 14px muted, baris dipisah `border-top`.

### 4.4 Teknisi: Tugas (`/technician/tasks`), mobile 390px

- Latar `bg-app`, padding 16-20px, kolom vertikal dengan jarak 16px.
- Sapaan kecil ("Halo, {nama}") dan judul "Tugas hari ini" (24px).
- **Kartu tugas:** kode tiket + `StatusBadge`, judul masalah (16px semibold), pelanggan dan alamat, kotak SLA kecil (`brand-50`).
- **Kartu bukti pengerjaan:** area drop/ambil foto (border putus-putus 2px, tinggi 96px), field "Catatan teknis" (textarea 88px, tanpa resize).
  - Unggah foto memakai Presigned URL S3/R2: minta URL via Server Action, unggah langsung dari klien, simpan URL ke database.
- **Aksi bawah** (menempel di dasar, `margin-top: auto`):
  - Tombol utama hijau `success-700`, tinggi 52px: "Tandai Selesai (Resolved)" → `resolveTicket()`.
  - Tombol sekunder outline 48px: "Lihat semua tugas".
- Tombol "Mulai Pengerjaan" (`startProgress()`) tampil di kartu tugas saat status masih `Assigned`.

---

## 5. Pemetaan Alur Tiket ke UI

| Status | Layar/Komponen | Server Action | Pembaruan real-time |
| :--- | :--- | :--- | :--- |
| `Open` | Form buat tiket (client, Zod) | `createTicket()` | Notifikasi ke dashboard admin |
| `Assigned` | Tabel admin + modal pilih teknisi | `assignTechnician()` | Tugas masuk ke daftar teknisi |
| `In Progress` | Tombol "Mulai Pengerjaan" teknisi | `startProgress()` | Stepper pelanggan berubah via SSE |
| `Resolved` | Kartu bukti pengerjaan teknisi | `resolveTicket()` | Notifikasi ke pelanggan |
| `Closed` | Kartu verifikasi + rating pelanggan | `closeTicketAndReview()` | Metrik CSAT dan SLA diperbarui |

---

## 6. Komponen yang Disarankan

Letakkan di `src/components/`:

- `ui/`: `Button` (varian: `primary`, `secondary`, `outline`, `success`), `Input`, `Textarea`, `Card`, `Modal`
- `shared/`: `StatusBadge`, `TicketStepper`, `TicketTimeline`, `SlaCountdown`, `StatCard`, `AppHeader`, `AdminSidebar`
- `forms/`: `LoginForm`, `CreateTicketForm`, `ResolveTicketForm` (dengan upload foto), `ReviewForm`

Setiap komponen menerima props bertipe dari Prisma (`Ticket`, `TicketStatus`, dst.), bukan tipe duplikat.

---

## 7. Status Desain dan Pekerjaan Berikutnya

**Sudah didesain:** Login, Live Tracker pelanggan, Dashboard admin, Tugas teknisi (mobile).

**Belum didesain (jangan diasumsikan, minta desain atau konfirmasi dulu):**

- Form buat tiket baru (unggah foto kerusakan jaringan)
- Kartu verifikasi dan rating bintang (tahap Closed)
- Modal penugasan teknisi
- Halaman analitik SLA dan CSAT
- Halaman daftar tiket pelanggan dan daftar tugas teknisi lengkap
- Keadaan kosong, memuat (skeleton), dan error untuk setiap layar

Saat membuat layar baru yang belum ada di atas, ikuti token dan pola di dokumen ini agar tampilannya konsisten.
