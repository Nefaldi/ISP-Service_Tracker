import Link from "next/link";
import { RegisterForm } from "@/components/forms/register-form";

export const metadata = {
  title: "Daftar Akun - Service Tracker",
};

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-12 bg-white">
      <div className="w-full max-w-[420px] mb-4">
        <Link
          href="/"
          className="text-xs font-bold tracking-wider uppercase text-[#0B2A6F]"
        >
          Service Tracker
        </Link>
      </div>
      <RegisterForm />
    </div>
  );
}
