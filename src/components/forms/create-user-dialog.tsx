"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { registerUser } from "@/actions/user.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserPlus, X, AlertCircle, CheckCircle2 } from "lucide-react";

export function CreateUserDialog() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<"CUSTOMER" | "TEKNISI" | "ADMIN">("TEKNISI");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
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
        setSuccessMsg(true);
        setTimeout(() => {
          setIsOpen(false);
          setSuccessMsg(false);
          setName("");
          setEmail("");
          setPhone("");
          setPassword("");
          router.refresh();
        }, 1200);
      } else {
        setErrorMsg(res.error || "Gagal membuat akun.");
      }
    } catch {
      setIsLoading(false);
      setErrorMsg("Terjadi kesalahan sistem saat membuat akun.");
    }
  };

  return (
    <>
      <Button
        type="button"
        variant="primary"
        onClick={() => setIsOpen(true)}
        className="h-[40px] px-4 rounded-[8px] bg-[#1D4ED8] hover:bg-[#1E40AF] text-white text-[14px] font-medium inline-flex items-center gap-2 shadow-xs transition-colors"
      >
        <UserPlus className="h-4 w-4" />
        <span>Tambah Akun Baru</span>
      </Button>

      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs"
        >
          <div className="w-full max-w-md rounded-[12px] bg-white border border-[#E2E8F0] p-6 shadow-xl text-[#0F172A]">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
              <h3 className="text-[18px] font-semibold text-[#0F172A]">
                Tambah Akun Pengguna Baru
              </h3>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Tutup dialog"
                className="text-[#64748B] hover:text-[#0F172A]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {successMsg ? (
              <div className="py-8 text-center space-y-2">
                <CheckCircle2 className="h-10 w-10 text-[#2563EB] mx-auto" />
                <h4 className="text-[16px] font-bold text-[#1D4ED8]">
                  Akun Berhasil Dibuat
                </h4>
                <p className="text-[13px] text-[#475569]">
                  Pengguna baru telah ditambahkan ke sistem.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="py-4 space-y-4">
                {errorMsg && (
                  <div className="flex items-center gap-2 p-3 text-[13px] text-[#991B1B] bg-[#FEF2F2] rounded-[8px] border border-[#FCA5A5]">
                    <AlertCircle className="h-4 w-4 shrink-0 text-[#DC2626]" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <div>
                  <label className="block text-[13px] font-medium text-[#0F172A] mb-1">
                    Nama Lengkap
                  </label>
                  <Input
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Contoh: Rian Pratama"
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-medium text-[#0F172A] mb-1">
                    Email
                  </label>
                  <Input
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@tracker.com"
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-medium text-[#0F172A] mb-1">
                    Nomor WhatsApp / Telepon
                  </label>
                  <Input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="08123456789"
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-medium text-[#0F172A] mb-1">
                    Peran (Role)
                  </label>
                  <select
                    value={role}
                    onChange={(e) =>
                      setRole(e.target.value as "CUSTOMER" | "TEKNISI" | "ADMIN")
                    }
                    className="w-full h-[40px] px-3 rounded-[8px] border border-[#CBD5E1] bg-white text-[14px] text-[#0F172A] focus:outline-none focus:border-[#1D4ED8] focus:ring-1 focus:ring-[#1D4ED8]"
                  >
                    <option value="TEKNISI">Teknisi Lapangan</option>
                    <option value="CUSTOMER">Pelanggan (Customer)</option>
                    <option value="ADMIN">Administrator Helpdesk</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[13px] font-medium text-[#0F172A] mb-1">
                    Kata Sandi (Minimal 6 karakter)
                  </label>
                  <Input
                    required
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="******"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E2E8F0]">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsOpen(false)}
                  >
                    Batal
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    isLoading={isLoading}
                  >
                    Simpan Pengguna
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
