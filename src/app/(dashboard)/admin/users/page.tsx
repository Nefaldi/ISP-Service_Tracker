import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { AdminUsersTable } from "@/components/shared/admin-users-table";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Users, UserPlus } from "lucide-react";

export const metadata = {
  title: "Manajemen Pengguna - Admin Helpdesk",
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
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 mb-2"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Kembali ke Overview</span>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Users className="h-6 w-6 text-purple-600" />
            <span>Manajemen Pengguna & Staf</span>
          </h1>
          <p className="text-sm text-zinc-500">
            Daftar seluruh akun terdaftar (Admin, Teknisi Lapangan, dan Pelanggan)
          </p>
        </div>

        <Link href="/register">
          <Button variant="primary" className="gap-2">
            <UserPlus className="h-4 w-4" />
            <span>Daftar Pengguna Baru</span>
          </Button>
        </Link>
      </div>

      <AdminUsersTable initialUsers={users} />
    </div>
  );
}
