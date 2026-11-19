import Link from "next/link";
import Image from "next/image";
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
          className="inline-flex items-center gap-2 text-sm font-bold tracking-tight text-[#0B2A6F]"
        >
          <Image src="/Logo.jpeg" alt="Logo" width={28} height={28} className="h-7 w-7 rounded-md object-contain" />
          <span>Service Tracker</span>
        </Link>
      </div>
      <RegisterForm />
    </div>
  );
}
