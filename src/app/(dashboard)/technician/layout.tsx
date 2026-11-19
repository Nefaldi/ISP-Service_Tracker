import { auth } from "@/lib/auth";
import { Navbar } from "@/components/shared/navbar";

export default async function TechnicianLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <div className="min-h-screen flex flex-col bg-[#F6F7F9]">
      <Navbar user={session?.user} />
      <main className="flex-1 w-full max-w-[1120px] mx-auto p-4 sm:p-6 lg:py-8">
        {children}
      </main>
    </div>
  );
}
