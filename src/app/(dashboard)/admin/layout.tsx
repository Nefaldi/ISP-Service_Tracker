import { auth } from "@/lib/auth";
import { AdminSidebar } from "@/components/shared/admin-sidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#F6F7F9]">
      <AdminSidebar user={session?.user} />
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
