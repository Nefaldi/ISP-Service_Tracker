import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Profil Pengguna | ISP Service Tracker",
  description: "Kelola profil dan pengaturan akun pengguna",
};

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role === "CUSTOMER") {
    redirect("/customer/profile");
  } else if (session.user.role === "TEKNISI") {
    redirect("/technician/profile");
  } else {
    redirect("/admin/profile");
  }
}
