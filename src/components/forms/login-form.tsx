"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertCircle, User, Wrench, Shield } from "lucide-react";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const urlError = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(
    urlError === "Configuration"
      ? "Konfigurasi server sedang diperbarui. Silakan muat ulang halaman."
      : urlError === "CredentialsSignin"
      ? "Email atau kata sandi tidak sesuai, atau database Supabase sedang dijeda (paused)."
      : urlError
      ? "Sesi telah berakhir atau hak akses tidak diizinkan."
      : null
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setErrorMessage(
          "Gagal masuk. Periksa kembali email dan kata sandi Anda. Akun demo tersedia: admin@tracker.com, teknisi@tracker.com, customer@tracker.com."
        );
        setIsLoading(false);
      } else {
        // Redirect directly to the appropriate dashboard
        let target = callbackUrl;
        if (!target || target === "/") {
          const lowerEmail = email.toLowerCase();
          if (lowerEmail.includes("admin")) {
            target = "/admin";
          } else if (lowerEmail.includes("teknisi")) {
            target = "/technician";
          } else {
            target = "/customer";
          }
        }
        router.push(target);
        router.refresh();
      }
    } catch (err) {
      console.error(err);
      setErrorMessage("Terjadi kesalahan sistem saat mencoba masuk.");
      setIsLoading(false);
    }
  };

  const handleQuickFill = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setErrorMessage(null);
  };

  return (
    <div className="w-full max-w-[380px] mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-[28px] font-bold text-[#0F172A] tracking-tight">
          Masuk ke akun Anda
        </h1>
        <p className="text-[14px] text-[#475569] mt-1.5">
          Anda akan diarahkan sesuai peran akun.
        </p>
      </div>

      {errorMessage && (
        <div
          role="alert"
          className="mb-6 flex items-start gap-2.5 p-3.5 text-[14px] text-[#991B1B] bg-[#FEF2F2] rounded-[8px] border border-[#FCA5A5]"
        >
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5 text-[#DC2626]" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label
            htmlFor="email"
            className="block text-[14px] font-medium text-[#0F172A] mb-1.5"
          >
            Email
          </label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="nama@domain.com"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-[14px] font-medium text-[#0F172A] mb-1.5"
          >
            Kata sandi
          </label>
          <Input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full h-[48px] text-[15px]"
          isLoading={isLoading}
        >
          Masuk
        </Button>

        <div className="text-center pt-2">
          <p className="text-[14px] text-[#475569]">
            Belum punya akun?{" "}
            <Link
              href="/register"
              className="font-medium text-[#1D4ED8] hover:underline"
            >
              Daftar sebagai pelanggan
            </Link>
          </p>
        </div>
      </form>

      {/* Demo Quick-Fill Section */}
      <div className="mt-8 pt-6 border-t border-[#E2E8F0]">
        <p className="text-xs font-semibold uppercase tracking-wider text-[#64748B] text-center mb-3">
          Akun Demo Cepat (Klik untuk mengisi):
        </p>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => handleQuickFill("customer@tracker.com", "customer123")}
            className="flex flex-col items-center justify-center p-2.5 rounded-[8px] border border-[#BFDBFE] bg-[#EFF6FF] hover:bg-[#DBEAFE] text-[#1D4ED8] text-xs font-medium transition-colors"
          >
            <User className="h-4 w-4 mb-1" />
            <span>Pelanggan</span>
          </button>
          <button
            type="button"
            onClick={() => handleQuickFill("teknisi@tracker.com", "teknisi123")}
            className="flex flex-col items-center justify-center p-2.5 rounded-[8px] border border-[#DDD6FE] bg-[#EDE9FE] hover:bg-[#DDD6FE] text-[#5B21B6] text-xs font-medium transition-colors"
          >
            <Wrench className="h-4 w-4 mb-1" />
            <span>Teknisi</span>
          </button>
          <button
            type="button"
            onClick={() => handleQuickFill("admin@tracker.com", "admin123")}
            className="flex flex-col items-center justify-center p-2.5 rounded-[8px] border border-[#CBD5E1] bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#0F172A] text-xs font-medium transition-colors"
          >
            <Shield className="h-4 w-4 mb-1" />
            <span>Admin</span>
          </button>
        </div>
      </div>
    </div>
  );
}
