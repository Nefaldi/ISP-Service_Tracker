import { auth } from "@/lib/auth";
import { AdminSidebar } from "@/components/shared/admin-sidebar";
import { AdminHeader } from "@/components/shared/admin-header";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#F6F7F9]">
      <AdminSidebar user={session?.user} />
      <div className="flex-1 min-w-0 flex flex-col">
        <AdminHeader user={session?.user} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
