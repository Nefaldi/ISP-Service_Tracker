import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { AdminUsersTable } from "@/components/shared/admin-users-table";
import { ArrowLeft, UserPlus } from "lucide-react";

export const metadata = {
  title: "Manajemen Pengguna - Service Tracker Admin",
};

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      phone: true,
      createdAt: true,
      _count: {
        select: {
          createdTickets: true,
          assignedTickets: true,
        },
      },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#475569] hover:text-[#0F172A] mb-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Kembali ke Ikhtisar</span>
          </Link>
          <h1 className="text-[28px] font-bold tracking-tight text-[#0F172A]">
            Manajemen Pengguna & Staf
          </h1>
          <p className="text-[14px] text-[#475569] mt-1">
            Daftar seluruh akun terdaftar (Admin, Teknisi Lapangan, dan Pelanggan)
          </p>
        </div>

        <Link
          href="/register"
          className="h-[40px] px-4 rounded-[8px] bg-[#1D4ED8] hover:bg-[#1E40AF] text-white text-[14px] font-medium inline-flex items-center gap-2 shadow-xs transition-colors"
        >
          <UserPlus className="h-4 w-4" />
          <span>Tambah Akun Baru</span>
        </Link>
      </div>

      <AdminUsersTable initialUsers={users} />
    </div>
  );
}
