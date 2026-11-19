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
          className="inline-flex items-center gap-3 text-sm font-bold tracking-tight text-[#0B2A6F]"
        >
          <Image
            src="/logo-zipnet.png"
            alt="Logo ZipNet"
            width={100}
            height={36}
            className="h-8 w-auto object-contain"
          />
          <span className="h-5 w-[1px] bg-[#CBD5E1]" />
          <span>Service Tracker</span>
        </Link>
      </div>
      <RegisterForm />
    </div>
  );
}
