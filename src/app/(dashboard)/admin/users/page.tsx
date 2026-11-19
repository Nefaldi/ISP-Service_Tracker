import { prisma } from "@/lib/prisma";
import { AdminUsersTable } from "@/components/shared/admin-users-table";
import { CreateUserDialog } from "@/components/forms/create-user-dialog";

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
          <h1 className="text-[24px] sm:text-[28px] font-bold tracking-tight text-[#0B2A6F]">
            Manajemen Pengguna & Staf
          </h1>
          <p className="text-[13px] sm:text-[14px] text-[#475569] mt-1">
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
