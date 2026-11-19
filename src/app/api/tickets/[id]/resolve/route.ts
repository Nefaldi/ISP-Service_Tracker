import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sseBroker } from "@/lib/sse-broker";
import { TicketStatus } from "@prisma/client";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || (session.user.role !== "TEKNISI" && session.user.role !== "ADMIN")) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Hanya teknisi atau admin yang dapat menyelesaikan tiket." },
        { status: 401 }
      );
    }

    const { id: ticketId } = await context.params;
    if (!ticketId) {
      return NextResponse.json(
        { success: false, error: "ID Tiket tidak valid." },
        { status: 400 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { resolutionNotes, resolvedPhotoUrl } = body;

    if (!resolutionNotes || typeof resolutionNotes !== "string" || resolutionNotes.trim().length < 5) {
      return NextResponse.json(
        { success: false, error: "Catatan tindakan teknis minimal 5 karakter." },
        { status: 400 }
      );
    }

    const existing = await prisma.ticket.findUnique({
      where: { id: ticketId },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Tiket tidak ditemukan." },
        { status: 404 }
      );
    }

    let effectiveTechId = session.user.id;
    if (session.user.email) {
      const dbUser = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true },
      });
      if (dbUser?.id) {
        effectiveTechId = dbUser.id;
      }
    }

    if (!effectiveTechId) {
      return NextResponse.json(
        { success: false, error: "ID Pengguna tidak terverifikasi di database." },
        { status: 400 }
      );
    }

    const previousStatus = existing.status;
    const newStatus: TicketStatus = "RESOLVED";

    const updated = await prisma.ticket.update({
      where: { id: ticketId },
      data: {
        status: newStatus,
        technicianId: existing.technicianId || effectiveTechId,
        resolvedPhotoUrl: resolvedPhotoUrl || null,
        resolutionNotes: resolutionNotes.trim(),
        resolvedAt: new Date(),
        logs: {
          create: {
            userId: effectiveTechId,
            action: "RESOLVED",
            previousStatus,
            newStatus,
            notes: `Perbaikan selesai: ${resolutionNotes.trim()}`,
          },
        },
      },
    });

    // SSE notification sent to customer
    try {
      sseBroker.broadcast("ticket:resolved", {
        ticketId: updated.id,
        ticketNumber: updated.ticketNumber,
        status: newStatus,
        previousStatus,
        customerId: updated.customerId,
        technicianId: updated.technicianId,
        message: `Pekerjaan tiket #${updated.ticketNumber} telah diselesaikan oleh teknisi. Menunggu verifikasi pelanggan.`,
        timestamp: new Date().toISOString(),
      });
    } catch (sseErr) {
      console.warn("SSE broadcast warning:", sseErr);
    }

    // Revalidate paths
    try {
      revalidatePath("/technician");
      revalidatePath("/technician/tasks");
      revalidatePath("/admin");
      revalidatePath("/admin/tickets");
      revalidatePath("/customer");
      revalidatePath("/customer/reports");
    } catch (revalErr) {
      console.warn("Revalidate warning:", revalErr);
    }

    return NextResponse.json({
      success: true,
      data: {
        id: updated.id,
        ticketNumber: updated.ticketNumber,
        status: updated.status,
      },
    });
  } catch (error) {
    console.error("API /api/tickets/[id]/resolve error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Terjadi kesalahan internal server.",
      },
      { status: 500 }
    );
  }
}
