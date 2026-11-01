/* eslint-disable */
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Memulai seeding database...");

  // Clean existing data
  await prisma.feedback.deleteMany();
  await prisma.ticketLog.deleteMany();
  await prisma.ticket.deleteMany();
  await prisma.user.deleteMany();

  // Create Users with hashed passwords
  const adminPassword = await bcrypt.hash("admin123", 10);
  const teknisiPassword = await bcrypt.hash("teknisi123", 10);
  const customerPassword = await bcrypt.hash("customer123", 10);

  const admin = await prisma.user.create({
    data: {
      name: "Siti Rahmawati (Admin)",
      email: "admin@tracker.com",
      password: adminPassword,
      role: "ADMIN",
      phone: "081234567890",
    },
  });

  const teknisi1 = await prisma.user.create({
    data: {
      name: "Ahmad Fauzi (Teknisi Jaringan)",
      email: "teknisi@tracker.com",
      password: teknisiPassword,
      role: "TEKNISI",
      phone: "081234567891",
    },
  });

  const teknisi2 = await prisma.user.create({
    data: {
      name: "Budi Santoso (Teknisi Hardware)",
      email: "budi.teknisi@tracker.com",
      password: teknisiPassword,
      role: "TEKNISI",
      phone: "081234567892",
    },
  });

  const customer = await prisma.user.create({
    data: {
      name: "PT Solusi Maju Bersama (Customer)",
      email: "customer@tracker.com",
      password: customerPassword,
      role: "CUSTOMER",
      phone: "081234567893",
    },
  });

  console.log("✅ Pengguna berhasil dibuat:");
  console.log("   - Admin: admin@tracker.com / admin123");
  console.log("   - Teknisi: teknisi@tracker.com / teknisi123");
  console.log("   - Teknisi: budi.teknisi@tracker.com / teknisi123");
  console.log("   - Customer: customer@tracker.com / customer123");

  // Create Sample Tickets across lifecycle states
  // 1. OPEN Ticket
  const ticket1 = await prisma.ticket.create({
    data: {
      ticketNumber: "TICK-202610-1001",
      title: "Lampu Indikator LOS Merah Berkedip pada Router ONT",
      description: "Koneksi internet mati total sejak pukul 08:00 pagi. Indikator lampu LOS merah berkedip terus.",
      status: "OPEN",
      priority: "CRITICAL",
      category: "Gangguan Jaringan Fiber",
      customerId: customer.id,
      logs: {
        create: {
          userId: customer.id,
          action: "CREATED",
          newStatus: "OPEN",
          notes: "Tiket dilaporkan oleh pelanggan melalui portal.",
        },
      },
    },
  });

  // 2. ASSIGNED Ticket
  const ticket2 = await prisma.ticket.create({
    data: {
      ticketNumber: "TICK-202610-1002",
      title: "Penurunan Bandwidth dan Latensi Tinggi saat Jam Kerja",
      description: "Kecepatan download hanya mencapai 5 Mbps dari paket 100 Mbps. Ping menuju gateway sering Request Time Out.",
      status: "ASSIGNED",
      priority: "HIGH",
      category: "Penurunan Bandwidth / Latensi",
      customerId: customer.id,
      technicianId: teknisi1.id,
      logs: {
        createMany: {
          data: [
            {
              userId: customer.id,
              action: "CREATED",
              newStatus: "OPEN",
              notes: "Tiket dibuat.",
            },
            {
              userId: admin.id,
              action: "ASSIGNED",
              previousStatus: "OPEN",
              newStatus: "ASSIGNED",
              notes: `Ditugaskan oleh ${admin.name} ke ${teknisi1.name}.`,
            },
          ],
        },
      },
    },
  });

  // 3. IN_PROGRESS Ticket
  const ticket3 = await prisma.ticket.create({
    data: {
      ticketNumber: "TICK-202610-1003",
      title: "Kabel Drop Core Terjepit Tiang Distribusi",
      description: "Terlihat kabel optik terjepit tiang besi di depan kantor, redaman optik melonjak drastis ke -32 dBm.",
      status: "IN_PROGRESS",
      priority: "MEDIUM",
      category: "Perangkat Keras Rusak",
      customerId: customer.id,
      technicianId: teknisi1.id,
      logs: {
        createMany: {
          data: [
            {
              userId: customer.id,
              action: "CREATED",
              newStatus: "OPEN",
              notes: "Tiket dibuat.",
            },
            {
              userId: admin.id,
              action: "ASSIGNED",
              previousStatus: "OPEN",
              newStatus: "ASSIGNED",
              notes: "Ditugaskan ke teknisi lapangan.",
            },
            {
              userId: teknisi1.id,
              action: "STATUS_CHANGE",
              previousStatus: "ASSIGNED",
              newStatus: "IN_PROGRESS",
              notes: "Teknisi sudah tiba di lokasi dan sedang melakukan splicing kabel.",
            },
          ],
        },
      },
    },
  });

  // 4. RESOLVED Ticket
  const ticket4 = await prisma.ticket.create({
    data: {
      ticketNumber: "TICK-202610-1004",
      title: "Router Sering Restart Sendiri Setiap 10 Menit",
      description: "Adaptor power router panas berlebih dan menyebabkan perangkat reboot berulang kali.",
      status: "RESOLVED",
      priority: "MEDIUM",
      category: "Masalah Router / WiFi",
      customerId: customer.id,
      technicianId: teknisi2.id,
      resolvedAt: new Date(),
      resolutionNotes: "Penggantian unit adaptor 12V 2A baru dan pembersihan debu ventilasi router. Redaman stabil pada -18 dBm.",
      logs: {
        createMany: {
          data: [
            {
              userId: customer.id,
              action: "CREATED",
              newStatus: "OPEN",
              notes: "Tiket dibuat.",
            },
            {
              userId: admin.id,
              action: "ASSIGNED",
              previousStatus: "OPEN",
              newStatus: "ASSIGNED",
              notes: "Ditugaskan ke teknisi hardware.",
            },
            {
              userId: teknisi2.id,
              action: "STATUS_CHANGE",
              previousStatus: "ASSIGNED",
              newStatus: "IN_PROGRESS",
              notes: "Teknisi melakukan penggantian sparepart.",
            },
            {
              userId: teknisi2.id,
              action: "RESOLVED",
              previousStatus: "IN_PROGRESS",
              newStatus: "RESOLVED",
              notes: "Pekerjaan selesai dilakukan dan sinyal dites stabil.",
            },
          ],
        },
      },
    },
  });

  // 5. CLOSED Ticket (With CSAT Review)
  const ticket5 = await prisma.ticket.create({
    data: {
      ticketNumber: "TICK-202610-1005",
      title: "Konfigurasi Port Forwarding CCTV Online",
      description: "Memerlukan pembukaan port 8000 dan 554 RTSP agar DVR kantor dapat diakses jarak jauh.",
      status: "CLOSED",
      priority: "LOW",
      category: "Lainnya",
      customerId: customer.id,
      technicianId: teknisi1.id,
      resolvedAt: new Date(Date.now() - 86400000),
      closedAt: new Date(),
      resolutionNotes: "Konfigurasi NAT & Port Forwarding selesai dikerjakan dan diverifikasi dari jaringan luar.",
      logs: {
        createMany: {
          data: [
            {
              userId: customer.id,
              action: "CREATED",
              newStatus: "OPEN",
              notes: "Tiket dibuat.",
            },
            {
              userId: admin.id,
              action: "ASSIGNED",
              previousStatus: "OPEN",
              newStatus: "ASSIGNED",
              notes: "Ditugaskan ke teknisi.",
            },
            {
              userId: teknisi1.id,
              action: "RESOLVED",
              previousStatus: "IN_PROGRESS",
              newStatus: "RESOLVED",
              notes: "Konfigurasi selesai.",
            },
            {
              userId: customer.id,
              action: "CLOSED",
              previousStatus: "RESOLVED",
              newStatus: "CLOSED",
              notes: "Pelanggan puas dan menutup tiket.",
            },
          ],
        },
      },
      feedback: {
        create: {
          customerId: customer.id,
          rating: 5,
          comment: "Respon sangat cepat dan konfigurasi CCTV langsung berfungsi normal. Mantap!",
        },
      },
    },
  });

  console.log("✅ Sampel 5 tiket dengan siklus hidup lengkap berhasil dibuat.");
  console.log("🌱 Seeding selesai!");
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
