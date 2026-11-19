"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
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

/**
 * Get profile data for currently logged in user
 */
export async function getCurrentUserProfile() {
  const session = await auth();
  if (!session?.user?.email) {
    return { success: false, error: "Tidak terautentikasi." };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        createdAt: true,
      },
    });

    if (!user) {
      return { success: false, error: "Pengguna tidak ditemukan." };
    }

    return { success: true, data: user };
  } catch (error) {
    console.error("getCurrentUserProfile error:", error);
    return { success: false, error: "Gagal memuat profil pengguna." };
  }
}

/**
 * Update profile (name, phone) for currently logged in user
 */
export async function updateUserProfile(data: { name: string; phone?: string | null }) {
  const session = await auth();
  if (!session?.user?.id && !session?.user?.email) {
    return { success: false, error: "Tidak terautentikasi." };
  }

  const name = data.name.trim();
  if (!name || name.length < 2) {
    return { success: false, error: "Nama minimal 2 karakter." };
  }

  try {
    const updated = await prisma.user.update({
      where: session.user.id ? { id: session.user.id } : { email: session.user.email! },
      data: {
        name,
        phone: data.phone?.trim() || null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
      },
    });

    revalidatePath("/profile");
    revalidatePath("/customer/profile");
    revalidatePath("/customer");
    revalidatePath("/technician");
    revalidatePath("/admin");

    return { success: true, message: "Profil berhasil diperbarui.", data: updated };
  } catch (error) {
    console.error("updateUserProfile error:", error);
    return { success: false, error: "Gagal memperbarui profil pengguna." };
  }
}

/**
 * Change password for currently logged in user
 */
export async function changeUserPassword(data: {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}) {
  const session = await auth();
  if (!session?.user?.id && !session?.user?.email) {
    return { success: false, error: "Tidak terautentikasi." };
  }

  if (!data.oldPassword) {
    return { success: false, error: "Kata sandi saat ini harus diisi." };
  }

  if (!data.newPassword || data.newPassword.length < 6) {
    return { success: false, error: "Kata sandi baru minimal 6 karakter." };
  }

  if (data.newPassword !== data.confirmPassword) {
    return { success: false, error: "Konfirmasi kata sandi baru tidak sesuai." };
  }

  try {
    const user = await prisma.user.findUnique({
      where: session.user.id ? { id: session.user.id } : { email: session.user.email! },
    });

    if (!user) {
      return { success: false, error: "Pengguna tidak ditemukan." };
    }

    const isMatch = await bcrypt.compare(data.oldPassword, user.password);
    if (!isMatch) {
      return { success: false, error: "Kata sandi lama yang Anda masukkan salah." };
    }

    const hashed = await bcrypt.hash(data.newPassword, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashed },
    });

    return { success: true, message: "Kata sandi berhasil diubah." };
  } catch (error) {
    console.error("changeUserPassword error:", error);
    return { success: false, error: "Gagal mengubah kata sandi." };
  }
}

/**
 * Delete account for currently logged in user
 */
export async function deleteUserAccount(password: string) {
  const session = await auth();
  if (!session?.user?.id && !session?.user?.email) {
    return { success: false, error: "Tidak terautentikasi." };
  }

  if (!password) {
    return { success: false, error: "Kata sandi harus diisi untuk konfirmasi." };
  }

  try {
    const user = await prisma.user.findUnique({
      where: session.user.id ? { id: session.user.id } : { email: session.user.email! },
    });

    if (!user) {
      return { success: false, error: "Pengguna tidak ditemukan." };
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return { success: false, error: "Kata sandi yang Anda masukkan salah." };
    }

    await prisma.user.delete({
      where: { id: user.id },
    });

    return { success: true, message: "Akun berhasil dihapus." };
  } catch (error) {
    console.error("deleteUserAccount error:", error);
    return { success: false, error: "Gagal menghapus akun pengguna." };
  }
}
