"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { Role } from "@prisma/client";

const registerUserSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  email: z.string().email("Format email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
  phone: z.string().optional(),
  role: z.enum(["ADMIN", "TEKNISI", "CUSTOMER"]).default("CUSTOMER"),
});

/**
 * Register a new user with hashed password
 */
export async function registerUser(formData: {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role?: "ADMIN" | "TEKNISI" | "CUSTOMER";
}) {
  const parsed = registerUserSchema.safeParse(formData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Data input tidak valid." };
  }

  const { name, email, password, phone, role } = parsed.data;

  try {
    const existing = await prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      return { success: false, error: "Email sudah terdaftar. Silakan gunakan email lain." };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone: phone || null,
        role: role as Role,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        createdAt: true,
      },
    });

    return { success: true, data: user };
  } catch (error) {
    console.error("registerUser error:", error);
    return { success: false, error: "Gagal mendaftarkan akun pengguna." };
  }
}

/**
 * Get active technicians list for assigning tickets
 */
export async function getTechnicians() {
  try {
    const technicians = await prisma.user.findMany({
      where: { role: "TEKNISI" },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
      },
      orderBy: { name: "asc" },
    });

    return { success: true, data: technicians };
  } catch (error) {
    console.error("getTechnicians error:", error);
    return { success: false, error: "Gagal mengambil daftar teknisi." };
  }
}

/**
 * Get users filtered by role (Protected for Admin)
 */
export async function getUsersByRole(role?: Role) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return { success: false, error: "Akses ditolak. Memerlukan hak akses Admin." };
  }

  try {
    const users = await prisma.user.findMany({
      where: role ? { role } : undefined,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return { success: true, data: users };
  } catch (error) {
    console.error("getUsersByRole error:", error);
    return { success: false, error: "Gagal memuat pengguna." };
  }
}
