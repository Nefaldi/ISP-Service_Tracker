import { Role, TicketStatus, Priority } from "@prisma/client";

export interface MockUser {
  id: string;
  name: string;
  email: string;
  password: string;
  role: Role;
  phone: string | null;
  image: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface MockTicketLog {
  id: string;
  ticketId: string;
  userId: string;
  action: string;
  previousStatus: TicketStatus | null;
  newStatus: TicketStatus | null;
  notes: string | null;
  createdAt: Date;
}

export interface MockFeedback {
  id: string;
  ticketId: string;
  customerId: string;
  rating: number;
  comment: string | null;
  createdAt: Date;
}

export interface MockTicket {
  id: string;
  ticketNumber: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: Priority;
  category: string;
  damagePhotoUrl: string | null;
  resolvedPhotoUrl: string | null;
  resolutionNotes: string | null;
  customerId: string;
  technicianId: string | null;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt: Date | null;
  closedAt: Date | null;
}

// Global in-memory singleton to persist state across hot-reloads during dev
interface MockStoreState {
  users: MockUser[];
  tickets: MockTicket[];
  ticketLogs: MockTicketLog[];
  feedbacks: MockFeedback[];
}

const globalForMock = globalThis as unknown as {
  __mockStoreState?: MockStoreState;
};

function initializeStore(): MockStoreState {
  const now = Date.now();
  const h = (hours: number) => new Date(now - hours * 3600 * 1000);

  // Precomputed bcrypt hashes for password: admin123, teknisi123, customer123
  const adminHash = "$2b$10$ZFhrbYP48b6nvDdqNEfTnenEyu25GokYUGZxlaaaW2lMH4nx36v1u";
  const techHash = "$2b$10$tX4lRvNextUG1Y/CcySO1utwZ7rCj8RylWIbKAcFH6HKgMibvaFjC";
  const custHash = "$2b$10$2rx/gcqGAsAWK6kLfz1eSuMnJnRMHTNSJhUqZNaAI2uU2zASe.6GO";

  const users: MockUser[] = [
    {
      id: "usr_demo_admin_01",
      name: "Siti Rahmawati (Admin)",
      email: "admin@tracker.com",
      password: adminHash,
      role: "ADMIN",
      phone: "081234567890",
      image: null,
      createdAt: h(720),
      updatedAt: h(720),
    },
    {
      id: "usr_demo_tech_01",
      name: "Ahmad Fauzi (Teknisi Jaringan)",
      email: "teknisi@tracker.com",
      password: techHash,
      role: "TEKNISI",
      phone: "081234567891",
      image: null,
      createdAt: h(720),
      updatedAt: h(720),
    },
    {
      id: "usr_demo_tech_02",
      name: "Budi Santoso (Teknisi Hardware)",
      email: "budi.teknisi@tracker.com",
      password: techHash,
      role: "TEKNISI",
      phone: "081234567892",
      image: null,
      createdAt: h(720),
      updatedAt: h(720),
    },
    {
      id: "usr_demo_cust_01",
      name: "PT Solusi Maju Bersama (Customer)",
      email: "customer@tracker.com",
      password: custHash,
      role: "CUSTOMER",
      phone: "081234567893",
      image: null,
      createdAt: h(720),
      updatedAt: h(720),
    },
  ];

  const tickets: MockTicket[] = [
    {
      id: "tck_demo_1001",
      ticketNumber: "TICK-202610-1001",
      title: "Lampu Indikator LOS Merah Berkedip pada Router ONT",
      description: "Koneksi internet mati total sejak pukul 08:00 pagi. Indikator lampu LOS merah berkedip terus.",
      status: "OPEN",
      priority: "CRITICAL",
      category: "Gangguan Jaringan Fiber",
      damagePhotoUrl: null,
      resolvedPhotoUrl: null,
      resolutionNotes: null,
      customerId: "usr_demo_cust_01",
      technicianId: null,
      createdAt: h(2),
      updatedAt: h(2),
      resolvedAt: null,
      closedAt: null,
    },
    {
      id: "tck_demo_1002",
      ticketNumber: "TICK-202610-1002",
      title: "Penurunan Bandwidth dan Latensi Tinggi saat Jam Kerja",
      description: "Kecepatan download hanya mencapai 5 Mbps dari paket 100 Mbps. Ping menuju gateway sering Request Time Out.",
      status: "ASSIGNED",
      priority: "HIGH",
      category: "Penurunan Bandwidth / Latensi",
      damagePhotoUrl: null,
      resolvedPhotoUrl: null,
      resolutionNotes: null,
      customerId: "usr_demo_cust_01",
      technicianId: "usr_demo_tech_01",
      createdAt: h(5),
      updatedAt: h(4.5),
      resolvedAt: null,
      closedAt: null,
    },
    {
      id: "tck_demo_1003",
      ticketNumber: "TICK-202610-1003",
      title: "Kabel Drop Core Terjepit Tiang Distribusi",
      description: "Terlihat kabel optik terjepit tiang besi di depan kantor, redaman optik melonjak drastis ke -32 dBm.",
      status: "IN_PROGRESS",
      priority: "MEDIUM",
      category: "Perangkat Keras Rusak",
      damagePhotoUrl: null,
      resolvedPhotoUrl: null,
      resolutionNotes: null,
      customerId: "usr_demo_cust_01",
      technicianId: "usr_demo_tech_01",
      createdAt: h(7),
      updatedAt: h(3),
      resolvedAt: null,
      closedAt: null,
    },
    {
      id: "tck_demo_1004",
      ticketNumber: "TICK-202610-1004",
      title: "Router Sering Restart Sendiri Setiap 10 Menit",
      description: "Adaptor power router panas berlebih dan menyebabkan perangkat reboot berulang kali.",
      status: "RESOLVED",
      priority: "MEDIUM",
      category: "Masalah Router / WiFi",
      damagePhotoUrl: null,
      resolvedPhotoUrl: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=600&q=80",
      resolutionNotes: "Penggantian unit adaptor 12V 2A baru dan pembersihan debu ventilasi router. Redaman stabil pada -18 dBm.",
      customerId: "usr_demo_cust_01",
      technicianId: "usr_demo_tech_02",
      createdAt: h(12),
      updatedAt: h(1),
      resolvedAt: h(1),
      closedAt: null,
    },
    {
      id: "tck_demo_1005",
      ticketNumber: "TICK-202610-1005",
      title: "Konfigurasi Port Forwarding CCTV Online",
      description: "Memerlukan pembukaan port 8000 dan 554 RTSP agar DVR kantor dapat diakses jarak jauh.",
      status: "CLOSED",
      priority: "LOW",
      category: "Lainnya",
      damagePhotoUrl: null,
      resolvedPhotoUrl: null,
      resolutionNotes: "Konfigurasi NAT & Port Forwarding selesai dikerjakan dan diverifikasi dari jaringan luar.",
      customerId: "usr_demo_cust_01",
      technicianId: "usr_demo_tech_01",
      createdAt: h(48),
      updatedAt: h(20),
      resolvedAt: h(24),
      closedAt: h(20),
    },
  ];

  const ticketLogs: MockTicketLog[] = [
    {
      id: "log_1001_1",
      ticketId: "tck_demo_1001",
      userId: "usr_demo_cust_01",
      action: "CREATED",
      previousStatus: null,
      newStatus: "OPEN",
      notes: "Tiket dilaporkan oleh pelanggan melalui portal.",
      createdAt: h(2),
    },
    {
      id: "log_1002_1",
      ticketId: "tck_demo_1002",
      userId: "usr_demo_cust_01",
      action: "CREATED",
      previousStatus: null,
      newStatus: "OPEN",
      notes: "Tiket dilaporkan oleh pelanggan.",
      createdAt: h(5),
    },
    {
      id: "log_1002_2",
      ticketId: "tck_demo_1002",
      userId: "usr_demo_admin_01",
      action: "ASSIGNED",
      previousStatus: "OPEN",
      newStatus: "ASSIGNED",
      notes: "Ditugaskan oleh Siti Rahmawati (Admin) ke Ahmad Fauzi (Teknisi Jaringan).",
      createdAt: h(4.5),
    },
    {
      id: "log_1003_1",
      ticketId: "tck_demo_1003",
      userId: "usr_demo_cust_01",
      action: "CREATED",
      previousStatus: null,
      newStatus: "OPEN",
      notes: "Tiket dibuat.",
      createdAt: h(7),
    },
    {
      id: "log_1003_2",
      ticketId: "tck_demo_1003",
      userId: "usr_demo_admin_01",
      action: "ASSIGNED",
      previousStatus: "OPEN",
      newStatus: "ASSIGNED",
      notes: "Ditugaskan ke teknisi lapangan.",
      createdAt: h(6.5),
    },
    {
      id: "log_1003_3",
      ticketId: "tck_demo_1003",
      userId: "usr_demo_tech_01",
      action: "STATUS_CHANGE",
      previousStatus: "ASSIGNED",
      newStatus: "IN_PROGRESS",
      notes: "Teknisi sudah tiba di lokasi dan sedang melakukan splicing kabel.",
      createdAt: h(3),
    },
    {
      id: "log_1004_1",
      ticketId: "tck_demo_1004",
      userId: "usr_demo_cust_01",
      action: "CREATED",
      previousStatus: null,
      newStatus: "OPEN",
      notes: "Tiket dibuat.",
      createdAt: h(12),
    },
    {
      id: "log_1004_2",
      ticketId: "tck_demo_1004",
      userId: "usr_demo_admin_01",
      action: "ASSIGNED",
      previousStatus: "OPEN",
      newStatus: "ASSIGNED",
      notes: "Ditugaskan ke teknisi hardware.",
      createdAt: h(10),
    },
    {
      id: "log_1004_3",
      ticketId: "tck_demo_1004",
      userId: "usr_demo_tech_02",
      action: "STATUS_CHANGE",
      previousStatus: "ASSIGNED",
      newStatus: "IN_PROGRESS",
      notes: "Teknisi melakukan penggantian sparepart.",
      createdAt: h(5),
    },
    {
      id: "log_1004_4",
      ticketId: "tck_demo_1004",
      userId: "usr_demo_tech_02",
      action: "RESOLVED",
      previousStatus: "IN_PROGRESS",
      newStatus: "RESOLVED",
      notes: "Pekerjaan selesai dilakukan dan sinyal dites stabil.",
      createdAt: h(1),
    },
    {
      id: "log_1005_1",
      ticketId: "tck_demo_1005",
      userId: "usr_demo_cust_01",
      action: "CREATED",
      previousStatus: null,
      newStatus: "OPEN",
      notes: "Tiket dibuat.",
      createdAt: h(48),
    },
    {
      id: "log_1005_2",
      ticketId: "tck_demo_1005",
      userId: "usr_demo_admin_01",
      action: "ASSIGNED",
      previousStatus: "OPEN",
      newStatus: "ASSIGNED",
      notes: "Ditugaskan ke teknisi.",
      createdAt: h(40),
    },
    {
      id: "log_1005_3",
      ticketId: "tck_demo_1005",
      userId: "usr_demo_tech_01",
      action: "RESOLVED",
      previousStatus: "IN_PROGRESS",
      newStatus: "RESOLVED",
      notes: "Konfigurasi selesai.",
      createdAt: h(24),
    },
    {
      id: "log_1005_4",
      ticketId: "tck_demo_1005",
      userId: "usr_demo_cust_01",
      action: "CLOSED",
      previousStatus: "RESOLVED",
      newStatus: "CLOSED",
      notes: "Pelanggan puas dan menutup tiket.",
      createdAt: h(20),
    },
  ];

  const feedbacks: MockFeedback[] = [
    {
      id: "fb_demo_1005",
      ticketId: "tck_demo_1005",
      customerId: "usr_demo_cust_01",
      rating: 5,
      comment: "Respon sangat cepat dan konfigurasi CCTV langsung berfungsi normal. Mantap!",
      createdAt: h(20),
    },
  ];

  return { users, tickets, ticketLogs, feedbacks };
}

export function getStore(): MockStoreState {
  if (!globalForMock.__mockStoreState) {
    globalForMock.__mockStoreState = initializeStore();
  }
  return globalForMock.__mockStoreState;
}

// Helper to filter tickets
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function matchTicketWhere(ticket: MockTicket, where?: Record<string, any>): boolean {
  if (!where) return true;

  if (where.id && ticket.id !== where.id) return false;
  if (where.ticketNumber && ticket.ticketNumber !== where.ticketNumber) return false;
  if (where.customerId && ticket.customerId !== where.customerId) return false;
  if (where.technicianId !== undefined) {
    if (where.technicianId === null && ticket.technicianId !== null) return false;
    if (where.technicianId && ticket.technicianId !== where.technicianId) return false;
  }

  if (where.status) {
    if (typeof where.status === "string" && ticket.status !== where.status) return false;
    if (where.status.in && Array.isArray(where.status.in) && !where.status.in.includes(ticket.status)) {
      return false;
    }
  }

  if (where.createdAt) {
    if (where.createdAt.lt && ticket.createdAt >= new Date(where.createdAt.lt)) return false;
    if (where.createdAt.gt && ticket.createdAt <= new Date(where.createdAt.gt)) return false;
  }

  return true;
}

// Hydrate relations for a ticket
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function hydrateTicket(ticket: MockTicket, include?: Record<string, any>) {
  const store = getStore();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const hydrated: any = { ...ticket };

  if (include?.customer) {
    const cust = store.users.find((u) => u.id === ticket.customerId);
    hydrated.customer = cust
      ? { id: cust.id, name: cust.name, email: cust.email, phone: cust.phone }
      : null;
  }

  if (include?.technician) {
    const tech = store.users.find((u) => u.id === ticket.technicianId);
    hydrated.technician = tech
      ? { id: tech.id, name: tech.name, email: tech.email, phone: tech.phone }
      : null;
  }

  if (include?.feedback) {
    const fb = store.feedbacks.find((f) => f.ticketId === ticket.id);
    hydrated.feedback = fb || null;
  }

  if (include?.logs) {
    const logs = store.ticketLogs
      .filter((l) => l.ticketId === ticket.id)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .map((l) => {
        const u = store.users.find((user) => user.id === l.userId);
        return {
          ...l,
          user: u ? { name: u.name, role: u.role } : null,
        };
      });
    hydrated.logs = logs;
  }

  return hydrated;
}

export const mockStore = {
  ticket: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async count(args?: { where?: Record<string, any> }): Promise<number> {
      const store = getStore();
      return store.tickets.filter((t) => matchTicketWhere(t, args?.where)).length;
    },

    async findMany(args?: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      where?: Record<string, any>;
      take?: number;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      orderBy?: Record<string, any>;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      include?: Record<string, any>;
    }) {
      const store = getStore();
      let list = store.tickets.filter((t) => matchTicketWhere(t, args?.where));

      if (args?.orderBy?.createdAt === "desc") {
        list = [...list].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      } else if (args?.orderBy?.createdAt === "asc") {
        list = [...list].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
      }

      if (typeof args?.take === "number" && args.take > 0) {
        list = list.slice(0, args.take);
      }

      return list.map((t) => hydrateTicket(t, args?.include));
    },

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async findUnique(args: { where: Record<string, any>; include?: Record<string, any> }) {
      const store = getStore();
      const ticket = store.tickets.find((t) => {
        if (args.where.id && t.id === args.where.id) return true;
        if (args.where.ticketNumber && t.ticketNumber === args.where.ticketNumber) return true;
        return false;
      });

      if (!ticket) return null;
      return hydrateTicket(ticket, args.include);
    },

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async create(args: { data: Record<string, any>; include?: Record<string, any> }) {
      const store = getStore();
      const newTicket: MockTicket = {
        id: `tck_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        ticketNumber: args.data.ticketNumber,
        title: args.data.title,
        description: args.data.description,
        status: args.data.status || "OPEN",
        priority: args.data.priority || "MEDIUM",
        category: args.data.category || "Umum",
        damagePhotoUrl: args.data.damagePhotoUrl || null,
        resolvedPhotoUrl: args.data.resolvedPhotoUrl || null,
        resolutionNotes: args.data.resolutionNotes || null,
        customerId: args.data.customerId,
        technicianId: args.data.technicianId || null,
        createdAt: new Date(),
        updatedAt: new Date(),
        resolvedAt: null,
        closedAt: null,
      };

      store.tickets.unshift(newTicket);

      // Handle nested logs.create
      if (args.data.logs?.create) {
        const logData = args.data.logs.create;
        store.ticketLogs.unshift({
          id: `log_${Date.now()}`,
          ticketId: newTicket.id,
          userId: logData.userId,
          action: logData.action,
          previousStatus: logData.previousStatus || null,
          newStatus: logData.newStatus || "OPEN",
          notes: logData.notes || null,
          createdAt: new Date(),
        });
      }

      return hydrateTicket(newTicket, args.include);
    },

    async update(args: {
      where: { id: string };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: Record<string, any>;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      include?: Record<string, any>;
    }) {
      const store = getStore();
      const index = store.tickets.findIndex((t) => t.id === args.where.id);
      if (index === -1) {
        throw new Error(`Ticket with ID ${args.where.id} not found.`);
      }

      const existing = store.tickets[index];
      const updated: MockTicket = {
        ...existing,
        ...args.data,
        updatedAt: new Date(),
      };

      if (args.data.status) updated.status = args.data.status;
      if (args.data.technicianId !== undefined) updated.technicianId = args.data.technicianId;
      if (args.data.resolvedPhotoUrl !== undefined) updated.resolvedPhotoUrl = args.data.resolvedPhotoUrl;
      if (args.data.resolutionNotes !== undefined) updated.resolutionNotes = args.data.resolutionNotes;
      if (args.data.resolvedAt !== undefined) updated.resolvedAt = args.data.resolvedAt;
      if (args.data.closedAt !== undefined) updated.closedAt = args.data.closedAt;

      store.tickets[index] = updated;

      // Handle nested logs.create
      if (args.data.logs?.create) {
        const logData = args.data.logs.create;
        store.ticketLogs.unshift({
          id: `log_${Date.now()}`,
          ticketId: updated.id,
          userId: logData.userId,
          action: logData.action,
          previousStatus: logData.previousStatus || null,
          newStatus: logData.newStatus || updated.status,
          notes: logData.notes || null,
          createdAt: new Date(),
        });
      }

      return hydrateTicket(updated, args.include);
    },
  },

  user: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async findUnique(args: { where: { email?: string; id?: string }; select?: Record<string, any> }) {
      const store = getStore();
      const user = store.users.find((u) => {
        if (args.where.id && u.id === args.where.id) return true;
        if (args.where.email && u.email.toLowerCase() === args.where.email.toLowerCase()) return true;
        return false;
      });

      if (!user) return null;
      return user;
    },

    async findMany(args?: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      where?: Record<string, any>;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      select?: Record<string, any>;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      include?: Record<string, any>;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      orderBy?: Record<string, any>;
    }) {
      const store = getStore();
      let list = store.users;

      if (args?.where?.role) {
        list = list.filter((u) => u.role === args.where?.role);
      }

      if (args?.orderBy?.name === "asc") {
        list = [...list].sort((a, b) => a.name.localeCompare(b.name));
      } else if (args?.orderBy?.createdAt === "desc") {
        list = [...list].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      }

      return list.map((u) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const result: any = { ...u };

        if (args?.select?._count) {
          result._count = {
            createdTickets: store.tickets.filter((t) => t.customerId === u.id).length,
            assignedTickets: store.tickets.filter((t) => t.technicianId === u.id).length,
          };
        }

        if (args?.include?.assignedTickets) {
          result.assignedTickets = store.tickets
            .filter((t) => t.technicianId === u.id)
            .map((t) => {
              const fb = store.feedbacks.find((f) => f.ticketId === t.id);
              return { ...t, feedback: fb || null };
            });
        }

        return result;
      });
    },

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async create(args: { data: Record<string, any> }) {
      const store = getStore();
      const newUser: MockUser = {
        id: `usr_${Date.now()}`,
        name: args.data.name,
        email: args.data.email,
        password: args.data.password,
        role: args.data.role || "CUSTOMER",
        phone: args.data.phone || null,
        image: args.data.image || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      store.users.push(newUser);
      return newUser;
    },
  },

  feedback: {
    async aggregate() {
      const store = getStore();
      const count = store.feedbacks.length;
      const total = store.feedbacks.reduce((sum, f) => sum + f.rating, 0);
      const avg = count > 0 ? total / count : null;

      return {
        _avg: { rating: avg },
        _count: { rating: count },
      };
    },

    async findMany() {
      const store = getStore();
      return store.feedbacks;
    },

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async create(args: { data: Record<string, any> }) {
      const store = getStore();
      const newFeedback: MockFeedback = {
        id: `fb_${Date.now()}`,
        ticketId: args.data.ticketId,
        customerId: args.data.customerId,
        rating: args.data.rating,
        comment: args.data.comment || null,
        createdAt: new Date(),
      };

      store.feedbacks.push(newFeedback);
      return newFeedback;
    },
  },

  ticketLog: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async create(args: { data: Record<string, any> }) {
      const store = getStore();
      const newLog: MockTicketLog = {
        id: `log_${Date.now()}`,
        ticketId: args.data.ticketId,
        userId: args.data.userId,
        action: args.data.action,
        previousStatus: args.data.previousStatus || null,
        newStatus: args.data.newStatus || null,
        notes: args.data.notes || null,
        createdAt: new Date(),
      };
      store.ticketLogs.unshift(newLog);
      return newLog;
    },

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async createMany(args: { data: Array<Record<string, any>> }) {
      const store = getStore();
      for (const item of args.data) {
        store.ticketLogs.unshift({
          id: `log_${Date.now()}_${Math.random()}`,
          ticketId: item.ticketId,
          userId: item.userId,
          action: item.action,
          previousStatus: item.previousStatus || null,
          newStatus: item.newStatus || null,
          notes: item.notes || null,
          createdAt: new Date(),
        });
      }
      return { count: args.data.length };
    },
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async $transaction<T>(callback: (tx: any) => Promise<T>): Promise<T> {
    return callback(mockStore);
  },
};
