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
        { success: false, error: "Unauthorized. Hanya teknisi atau admin yang dapat memulai pengerjaan." },
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

    const existing = await prisma.ticket.findUnique({
      where: { id: ticketId },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Tiket tidak ditemukan." },
        { status: 404 }
      );
    }

    // Resolve user ID in DB by email to avoid mismatched fallback IDs
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
    const newStatus: TicketStatus = "IN_PROGRESS";
    const techName = session.user.name || "Teknisi Lapangan";

    const updated = await prisma.ticket.update({
      where: { id: ticketId },
      data: {
        status: newStatus,
        technicianId: existing.technicianId || effectiveTechId,
        logs: {
          create: {
            userId: effectiveTechId,
            action: "IN_PROGRESS",
            previousStatus,
            newStatus,
            notes: `${techName} telah menerima penugasan dan memulai pengerjaan perbaikan di lokasi.`,
          },
        },
      },
    });

    // Instant SSE broadcast to customer and admin
    try {
      sseBroker.broadcast("ticket:status_change", {
        ticketId: updated.id,
        ticketNumber: updated.ticketNumber,
        status: newStatus,
        previousStatus,
        customerId: updated.customerId,
        technicianId: updated.technicianId,
        message: `Pengerjaan tiket #${updated.ticketNumber} telah dimulai oleh teknisi.`,
        timestamp: new Date().toISOString(),
      });
    } catch (sseErr) {
      console.warn("SSE broadcast warning:", sseErr);
    }

    // Revalidate relevant pages
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
    console.error("API /api/tickets/[id]/start error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Terjadi kesalahan internal server.",
      },
      { status: 500 }
    );
  }
}
