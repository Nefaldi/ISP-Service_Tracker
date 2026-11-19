import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { AuthContainer } from "@/components/forms/auth-container";

export const metadata = {
  title: "Masuk & Registrasi - Service Tracker",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-white">
      {/* Brand Panel (Kiri di desktop dengan Background Server Rack ZipNet) */}
      <div className="relative hidden lg:flex flex-col justify-center items-center overflow-hidden p-12 text-white min-h-screen select-none">
        <Image
          src="/4f992cf6d1ed8b70b47ad218a49dd046.jpg"
          alt="Server Rack Jaringan ZipNet"
          fill
          priority
          sizes="50vw"
          className="object-cover object-center"
        />
        {/* Lapisan overlay agar teks tetap terbaca sangat kontras dan profesional */}
        <div className="absolute inset-0 bg-[#0B2A6F]/75 mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B2A6F] via-[#0B2A6F]/65 to-[#0B2A6F]/45" />

        {/* Cukup tampilkan Logo ZipNet dengan ukuran yang sesuai dan teks Service Tracker dibawahnya */}
        <div className="relative z-10 flex flex-col items-center text-center">
          <Link
            href="/login"
            className="flex flex-col items-center group transition-transform hover:scale-[1.02]"
          >
            <div className="bg-white px-7 py-4 rounded-[16px] shadow-xl flex items-center justify-center">
              <Image
                src="/logo-zipnet.png"
                alt="Logo ZipNet"
                width={220}
                height={119}
                style={{ width: "auto" }}
                className="h-14 sm:h-16 w-auto object-contain"
                priority
              />
            </div>
            <h1 className="text-[26px] sm:text-[28px] font-bold text-white tracking-wide mt-4 drop-shadow-md">
              Service Tracker
            </h1>
          </Link>
        </div>
      </div>

      {/* Form Panel (Kanan) */}
      <div className="flex flex-col justify-center items-center px-6 py-12 lg:px-12 bg-white">
        {/* Mobile Header: Logo ZipNet dengan teks Service Tracker dibawahnya */}
        <div className="lg:hidden flex flex-col items-center text-center mb-6">
          <Link
            href="/login"
            className="flex flex-col items-center"
          >
            <div className="bg-white px-5 py-3 rounded-[12px] shadow-sm border border-[#E2E8F0] flex items-center justify-center">
              <Image
                src="/logo-zipnet.png"
                alt="Logo ZipNet"
                width={160}
                height={87}
                style={{ width: "auto" }}
                className="h-11 w-auto object-contain"
                priority
              />
            </div>
            <h1 className="text-[19px] font-bold text-[#0B2A6F] tracking-tight mt-2.5">
              Service Tracker
            </h1>
          </Link>
        </div>

        <Suspense
          fallback={
            <div className="text-sm text-[#475569]">Memuat formulir autentikasi...</div>
          }
        >
          <AuthContainer initialTab="login" />
        </Suspense>
      </div>
    </div>
  );
}
