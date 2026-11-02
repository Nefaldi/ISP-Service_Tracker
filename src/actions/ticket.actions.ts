"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { sseBroker } from "@/lib/sse-broker";
import { getPresignedUploadUrl } from "@/lib/s3";
import { uploadToStorage } from "@/lib/storage";
import { Priority, TicketStatus } from "@prisma/client";

// Zod Validation Schemas
export const createTicketSchema = z.object({
  title: z.string().min(5, "Judul tiket minimal 5 karakter"),
  description: z.string().min(10, "Deskripsi minimal 10 karakter"),
  category: z.string().min(2, "Kategori harus dipilih"),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).default("MEDIUM"),
  damagePhotoUrl: z.string().url().optional().or(z.literal("")),
});

export const assignTechnicianSchema = z.object({
  ticketId: z.string().min(1),
  technicianId: z.string().min(1),
  notes: z.string().optional(),
});

export const resolveTicketSchema = z.object({
  ticketId: z.string().min(1),
  resolvedPhotoUrl: z.string().url("URL bukti kerja tidak valid").optional().or(z.literal("")),
  resolutionNotes: z.string().min(5, "Catatan penyelesaian minimal 5 karakter"),
});

export const closeTicketReviewSchema = z.object({
  ticketId: z.string().min(1),
  rating: z.coerce.number().min(1).max(5),
  comment: z.string().optional(),
});

/**
 * 1. Open: Customer creates a new ticket
 */
export async function createTicket(formData: {
  title: string;
  description: string;
  category: string;
  priority?: Priority;
  damagePhotoUrl?: string;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized. Silakan login terlebih dahulu." };
  }

  const parsed = createTicketSchema.safeParse(formData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Data input tidak valid." };
  }

  const { title, description, category, priority, damagePhotoUrl } = parsed.data;

  // Generate unique readable Ticket Number: TICK-YYYYMM-XXXX
  const dateStr = new Date().toISOString().slice(0, 7).replace("-", "");
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const ticketNumber = `TICK-${dateStr}-${randomSuffix}`;

  try {
    const ticket = await prisma.ticket.create({
      data: {
        ticketNumber,
        title,
        description,
        category,
        priority: priority as Priority,
        damagePhotoUrl: damagePhotoUrl || null,
        customerId: session.user.id,
        status: "OPEN",
        logs: {
          create: {
            userId: session.user.id,
            action: "CREATED",
            newStatus: "OPEN",
            notes: "Tiket pelaporan dibuat oleh pelanggan.",
          },
        },
      },
    });

    // Broadcast SSE to Admin Dashboard
    sseBroker.broadcast("ticket:created", {
      ticketId: ticket.id,
      ticketNumber: ticket.ticketNumber,
      title: ticket.title,
      status: "OPEN",
      customerId: ticket.customerId,
      message: `Tiket baru #${ticket.ticketNumber} telah dibuat.`,
      timestamp: new Date().toISOString(),
    });

    revalidatePath("/admin/tickets");
    revalidatePath("/customer");
    return { success: true, data: ticket };
  } catch (error) {
    console.error("createTicket error:", error);
    return { success: false, error: "Gagal membuat tiket. Silakan coba kembali." };
  }
}

/**
 * 2. Assigned: Admin assigns a ticket to a technician
 */
export async function assignTechnician(input: {
  ticketId: string;
  technicianId: string;
  notes?: string;
}) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return { success: false, error: "Hanya Admin yang berwenang menugaskan teknisi." };
  }

  const parsed = assignTechnicianSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Data input tidak valid." };
  }

  const { ticketId, technicianId, notes } = parsed.data;

  try {
    const existing = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: { customer: true },
    });

    if (!existing) {
      return { success: false, error: "Tiket tidak ditemukan." };
    }

    const previousStatus = existing.status;
    const newStatus: TicketStatus = "ASSIGNED";

    const updated = await prisma.ticket.update({
      where: { id: ticketId },
      data: {
        technicianId,
        status: newStatus,
        logs: {
          create: {
            userId: session.user.id,
            action: "ASSIGNED",
            previousStatus,
            newStatus,
            notes: notes || `Ditugaskan kepada teknisi oleh ${session.user.name}`,
          },
        },
      },
    });

    // Broadcast SSE to Technician To-Do List & Customer Live Tracker
    sseBroker.broadcast("ticket:assigned", {
      ticketId: updated.id,
      ticketNumber: updated.ticketNumber,
      title: updated.title,
      status: newStatus,
      previousStatus,
      technicianId,
      customerId: updated.customerId,
      message: `Tiket #${updated.ticketNumber} telah ditugaskan kepada teknisi.`,
      timestamp: new Date().toISOString(),
    });

    revalidatePath("/admin/tickets");
    revalidatePath("/technician/tasks");
    revalidatePath(`/customer/track/${ticketId}`);
    return { success: true, data: updated };
  } catch (error) {
    console.error("assignTechnician error:", error);
    return { success: false, error: "Gagal menugaskan teknisi." };
  }
}

/**
 * 3. In Progress: Technician marks task as in progress
 */
export async function startProgress(ticketId: string) {
  const session = await auth();
  if (!session?.user?.id || (session.user.role !== "TEKNISI" && session.user.role !== "ADMIN")) {
    return { success: false, error: "Unauthorized. Hanya teknisi/admin yang dapat memulai pengerjaan." };
  }

  try {
    const existing = await prisma.ticket.findUnique({ where: { id: ticketId } });
    if (!existing) return { success: false, error: "Tiket tidak ditemukan." };

    const previousStatus = existing.status;
    const newStatus: TicketStatus = "IN_PROGRESS";

    const updated = await prisma.ticket.update({
      where: { id: ticketId },
      data: {
        status: newStatus,
        logs: {
          create: {
            userId: session.user.id,
            action: "STATUS_CHANGE",
            previousStatus,
            newStatus,
            notes: "Teknisi sedang dalam perjalanan / mengerjakan perbaikan.",
          },
        },
      },
    });

    // Instant SSE update to Customer Live Tracker
    sseBroker.broadcast("ticket:status_change", {
      ticketId: updated.id,
      ticketNumber: updated.ticketNumber,
      status: newStatus,
      previousStatus,
      customerId: updated.customerId,
      technicianId: updated.technicianId,
      message: `Status pengerjaan tiket #${updated.ticketNumber} berubah menjadi In Progress.`,
      timestamp: new Date().toISOString(),
    });

    revalidatePath("/technician/tasks");
    revalidatePath(`/customer/track/${ticketId}`);
    return { success: true, data: updated };
  } catch (error) {
    console.error("startProgress error:", error);
    return { success: false, error: "Gagal memperbarui status tiket." };
  }
}

/**
 * 4. Resolved: Technician uploads work proof & technical notes
 */
export async function resolveTicket(input: {
  ticketId: string;
  resolvedPhotoUrl?: string;
  resolutionNotes: string;
}) {
  const session = await auth();
  if (!session?.user?.id || (session.user.role !== "TEKNISI" && session.user.role !== "ADMIN")) {
    return { success: false, error: "Unauthorized. Hanya teknisi/admin yang dapat menyelesaikan tiket." };
  }

  const parsed = resolveTicketSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Data input tidak valid." };
  }

  const { ticketId, resolvedPhotoUrl, resolutionNotes } = parsed.data;

  try {
    const existing = await prisma.ticket.findUnique({ where: { id: ticketId } });
    if (!existing) return { success: false, error: "Tiket tidak ditemukan." };

    const previousStatus = existing.status;
    const newStatus: TicketStatus = "RESOLVED";

    const updated = await prisma.ticket.update({
      where: { id: ticketId },
      data: {
        status: newStatus,
        resolvedPhotoUrl: resolvedPhotoUrl || null,
        resolutionNotes,
        resolvedAt: new Date(),
        logs: {
          create: {
            userId: session.user.id,
            action: "RESOLVED",
            previousStatus,
            newStatus,
            notes: `Tiket diselesaikan: ${resolutionNotes}`,
          },
        },
      },
    });

    // SSE notification sent to customer
    sseBroker.broadcast("ticket:resolved", {
      ticketId: updated.id,
      ticketNumber: updated.ticketNumber,
      status: newStatus,
      previousStatus,
      customerId: updated.customerId,
      technicianId: updated.technicianId,
      message: `Pekerjaan tiket #${updated.ticketNumber} telah diselesaikan oleh teknisi.`,
      timestamp: new Date().toISOString(),
    });

    revalidatePath("/technician/tasks");
    revalidatePath(`/customer/track/${ticketId}`);
    revalidatePath("/admin/tickets");
    return { success: true, data: updated };
  } catch (error) {
    console.error("resolveTicket error:", error);
    return { success: false, error: "Gagal menyelesaikan tiket." };
  }
}

/**
 * 5. Closed: Customer verifies resolution, closes ticket, and leaves CSAT feedback
 */
export async function closeTicketAndReview(input: {
  ticketId: string;
  rating: number;
  comment?: string;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized. Silakan login." };
  }

  const parsed = closeTicketReviewSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Data input tidak valid." };
  }

  const { ticketId, rating, comment } = parsed.data;

  try {
    const existing = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: { feedback: true },
    });

    if (!existing) return { success: false, error: "Tiket tidak ditemukan." };
    if (existing.customerId !== session.user.id && session.user.role !== "ADMIN") {
      return { success: false, error: "Hanya pemilik tiket yang dapat menutup dan memberikan ulasan." };
    }

    const previousStatus = existing.status;
    const newStatus: TicketStatus = "CLOSED";

    const updated = await prisma.$transaction(async (tx) => {
      const ticket = await tx.ticket.update({
        where: { id: ticketId },
        data: {
          status: newStatus,
          closedAt: new Date(),
          logs: {
            create: {
              userId: session.user.id,
              action: "CLOSED",
              previousStatus,
              newStatus,
              notes: `Tiket ditutup oleh pelanggan dengan rating ${rating}/5 bintang.`,
            },
          },
        },
      });

      if (!existing.feedback) {
        await tx.feedback.create({
          data: {
            ticketId,
            customerId: session.user.id,
            rating,
            comment: comment || null,
          },
        });
      }

      return ticket;
    });

    sseBroker.broadcast("ticket:closed", {
      ticketId: updated.id,
      ticketNumber: updated.ticketNumber,
      status: newStatus,
      previousStatus,
      customerId: updated.customerId,
      message: `Tiket #${updated.ticketNumber} telah ditutup oleh pelanggan.`,
      timestamp: new Date().toISOString(),
    });

    revalidatePath(`/customer/track/${ticketId}`);
    revalidatePath("/admin/tickets");
    return { success: true, data: updated };
  } catch (error) {
    console.error("closeTicketAndReview error:", error);
    return { success: false, error: "Gagal menutup tiket dan menyimpan ulasan." };
  }
}

/**
 * Storage Helper: Generate presigned upload URL for photo evidence
 */
export async function requestPresignedUpload(
  fileName: string,
  fileType: string,
  folder: "damages" | "resolutions" = "damages"
) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized." };
  }

  try {
    const signedData = await getPresignedUploadUrl(fileName, fileType, folder);
    return { success: true, data: signedData };
  } catch (error) {
    console.error("requestPresignedUpload error:", error);
    return { success: false, error: "Gagal membuat URL upload S3." };
  }
}

/**
 * Storage Helper: Upload photo directly to Supabase Storage via Server Action
 */
export async function uploadPhotoAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized. Silakan login." };
  }

  const file = formData.get("file") as File | null;
  const folder = (formData.get("folder") as "damages" | "resolutions") || "damages";

  if (!file || file.size === 0) {
    return { success: false, error: "Berkas foto tidak ditemukan." };
  }

  if (file.size > 10 * 1024 * 1024) {
    return { success: false, error: "Ukuran berkas maksimal 10MB." };
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const result = await uploadToStorage(
      arrayBuffer,
      file.name,
      file.type || "image/jpeg",
      folder
    );

    return { success: true, publicUrl: result.publicUrl };
  } catch (err: unknown) {
    console.error("uploadPhotoAction error:", err);
    const message = err instanceof Error ? err.message : "Gagal mengunggah foto bukti.";
    return { success: false, error: message };
  }
}
