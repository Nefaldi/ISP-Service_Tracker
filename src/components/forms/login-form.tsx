"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ShieldCheck, Wrench, UserCheck, AlertCircle, LogIn } from "lucide-react";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const urlError = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(
    urlError ? "Sesi telah berakhir atau hak akses tidak diizinkan." : null
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
        setErrorMessage("Email atau kata sandi tidak sesuai.");
        setIsLoading(false);
      } else {
        router.push(callbackUrl);
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
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-xl">
      <CardHeader className="text-center pb-2">
        <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400">
          <LogIn className="h-6 w-6" />
        </div>
        <CardTitle className="text-2xl font-bold">Masuk ke Sistem</CardTitle>
        <CardDescription>
          Web Service Tracker & Manajemen Tiket Helpdesk
        </CardDescription>
      </CardHeader>

      <CardContent>
        {errorMessage && (
          <div className="mb-4 flex items-center gap-2 p-3 text-sm text-red-700 bg-red-50 rounded-lg border border-red-200 dark:bg-red-950/50 dark:text-red-300 dark:border-red-900">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1">
              Email Pengguna
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@domain.com"
              className="w-full px-3.5 py-2 rounded-lg border border-zinc-300 bg-white text-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1">
              Kata Sandi
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2 rounded-lg border border-zinc-300 bg-white text-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            />
          </div>

          <Button type="submit" className="w-full" isLoading={isLoading}>
            Masuk
          </Button>
        </form>

        <div className="mt-6 border-t border-zinc-200 pt-5 dark:border-zinc-800">
          <p className="text-xs text-center text-zinc-500 mb-3 font-medium">
            Demo Cepat Akun (Klik untuk mengisi):
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickFill("admin@tracker.com", "admin123")}
              className="flex flex-col items-center justify-center p-2 rounded-lg border border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs transition-colors dark:bg-purple-950/40 dark:border-purple-900 dark:text-purple-300"
            >
              <ShieldCheck className="h-4 w-4 mb-1" />
              <span>Admin</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickFill("teknisi@tracker.com", "teknisi123")}
              className="flex flex-col items-center justify-center p-2 rounded-lg border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs transition-colors dark:bg-blue-950/40 dark:border-blue-900 dark:text-blue-300"
            >
              <Wrench className="h-4 w-4 mb-1" />
              <span>Teknisi</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickFill("customer@tracker.com", "customer123")}
              className="flex flex-col items-center justify-center p-2 rounded-lg border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs transition-colors dark:bg-emerald-950/40 dark:border-emerald-900 dark:text-emerald-300"
            >
              <UserCheck className="h-4 w-4 mb-1" />
              <span>Pelanggan</span>
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
