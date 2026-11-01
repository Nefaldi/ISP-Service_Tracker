import { auth } from "@/lib/auth";
import { Navbar } from "@/components/shared/navbar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950">
      <Navbar user={session?.user} />
      <div className="container mx-auto flex-1 px-4 py-6 sm:px-6 sm:py-8 max-w-7xl">
        {children}
      </div>
    </div>
  );
}
