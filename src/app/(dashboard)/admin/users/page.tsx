import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { AdminUsersTable } from "@/components/shared/admin-users-table";
import { CreateUserDialog } from "@/components/forms/create-user-dialog";
import { ArrowLeft } from "lucide-react";

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
            Daftar seluruh akun terdaftar dalam sistem
          </p>
        </div>

        <div className="flex items-center gap-2">
          <CreateUserDialog />
        </div>
      </div>

      <AdminUsersTable initialUsers={users} />
    </div>
  );
}
