"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { registerUser } from "@/actions/user.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertCircle, CheckCircle2, ArrowRight } from "lucide-react";

export function RegisterForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<"CUSTOMER" | "TEKNISI" | "ADMIN">("CUSTOMER");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (password !== confirmPassword) {
      setErrorMessage("Konfirmasi kata sandi tidak cocok.");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("Kata sandi minimal 6 karakter.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await registerUser({
        name,
        email,
        phone: phone || undefined,
        role,
        password,
      });

      setIsLoading(false);

      if (res.success) {
        setIsSuccess(true);
        setTimeout(() => {
          router.push(`/login?email=${encodeURIComponent(email)}`);
        }, 1500);
      } else {
        setErrorMessage(res.error || "Gagal mendaftarkan akun.");
      }
    } catch (err) {
      console.error(err);
      setIsLoading(false);
      setErrorMessage("Terjadi kesalahan sistem saat registrasi.");
    }
  };

  return (
    <div className="w-full max-w-[420px] mx-auto py-8">
      <div className="mb-6">
        <h1 className="text-[28px] font-bold text-[#0F172A] tracking-tight">
          Daftar akun baru
        </h1>
        <p className="text-[14px] text-[#475569] mt-1.5">
          Buat akun pelanggan untuk melaporkan gangguan dan melacak progres teknisi.
        </p>
      </div>

      {isSuccess ? (
        <div className="p-6 text-center space-y-3 bg-[#DBEAFE] rounded-[12px] border border-[#BFDBFE]">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#1D4ED8] text-white">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <h4 className="text-[18px] font-bold text-[#1D4ED8]">
            Pendaftaran Berhasil!
          </h4>
          <p className="text-[14px] text-[#1D4ED8]">
            Akun Anda telah terdaftar. Sedang mengalihkan ke halaman masuk...
          </p>
          <div className="pt-2">
            <Link href="/login">
              <Button size="sm" variant="primary" className="gap-2">
                <span>Masuk Sekarang</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMessage && (
            <div
              role="alert"
              className="flex items-start gap-2.5 p-3.5 text-[14px] text-[#991B1B] bg-[#FEF2F2] rounded-[8px] border border-[#FCA5A5]"
            >
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5 text-[#DC2626]" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div>
            <label
              htmlFor="register-name"
              className="block text-[14px] font-medium text-[#0F172A] mb-1.5"
            >
              Nama lengkap
            </label>
            <Input
              id="register-name"
              name="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Budi Santoso"
            />
          </div>

          <div>
            <label
              htmlFor="register-email"
              className="block text-[14px] font-medium text-[#0F172A] mb-1.5"
            >
              Email
            </label>
            <Input
              id="register-email"
              name="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@domain.com"
            />
          </div>

          <div>
            <label
              htmlFor="register-phone"
              className="block text-[14px] font-medium text-[#0F172A] mb-1.5"
            >
              Nomor WhatsApp / Telepon
            </label>
            <Input
              id="register-phone"
              name="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="081234567890"
            />
          </div>

          <div>
            <label
              htmlFor="register-role"
              className="block text-[14px] font-medium text-[#0F172A] mb-1.5"
            >
              Peran akun
            </label>
            <select
              id="register-role"
              value={role}
              onChange={(e) => setRole(e.target.value as "CUSTOMER" | "TEKNISI" | "ADMIN")}
              className="w-full h-[48px] px-3.5 py-2.5 rounded-[8px] border border-[#94A3B8] bg-white text-[15px] text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]"
            >
              <option value="CUSTOMER">Pelanggan (Customer)</option>
              <option value="TEKNISI">Teknisi Lapangan</option>
              <option value="ADMIN">Admin Helpdesk</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="register-password"
                className="block text-[14px] font-medium text-[#0F172A] mb-1.5"
              >
                Kata sandi
              </label>
              <Input
                id="register-password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimal 6 karakter"
              />
            </div>
            <div>
              <label
                htmlFor="register-confirm-password"
                className="block text-[14px] font-medium text-[#0F172A] mb-1.5"
              >
                Ulangi kata sandi
              </label>
              <Input
                id="register-confirm-password"
                name="confirmPassword"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Ketik ulang kata sandi"
              />
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full h-[48px] text-[15px] mt-2"
            isLoading={isLoading}
          >
            Daftar Akun
          </Button>

          <div className="text-center pt-2">
            <p className="text-[14px] text-[#475569]">
              Sudah punya akun?{" "}
              <Link
                href="/login"
                className="font-medium text-[#1D4ED8] hover:underline"
              >
                Masuk di sini
              </Link>
            </p>
          </div>
        </form>
      )}
    </div>
  );
}
