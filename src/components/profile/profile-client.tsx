"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  User as UserIcon,
  Mail,
  Key,
  ShieldCheck,
  Edit,
  LogOut,
  ArrowLeft,
  Eye,
  EyeOff,
  Phone,
  Calendar,
  AlertTriangle,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import {
  updateUserProfile,
  changeUserPassword,
  deleteUserAccount,
} from "@/actions/user.actions";
import { formatDateTime } from "@/lib/utils";

interface ProfileUser {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "TEKNISI" | "CUSTOMER";
  phone?: string | null;
  createdAt?: string | Date | null;
}

interface ProfileClientProps {
  user: ProfileUser;
}

export function ProfileClient({ user: initialUser }: ProfileClientProps) {
  const router = useRouter();
  const [user, setUser] = useState<ProfileUser>(initialUser);
  const [activeTab, setActiveTab] = useState<"personal" | "edit" | "account">("personal");

  // Modals state
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Password visibility
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Form states
  const [editName, setEditName] = useState(initialUser.name);
  const [editPhone, setEditPhone] = useState(initialUser.phone || "");
  const [editStatus, setEditStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwdStatus, setPwdStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const [deletePassword, setDeletePassword] = useState("");
  const [deleteStatus, setDeleteStatus] = useState<{ type: "error"; message: string } | null>(null);

  // Transitions
  const [isPendingEdit, startTransitionEdit] = useTransition();
  const [isPendingPwd, startTransitionPwd] = useTransition();
  const [isPendingDelete, startTransitionDelete] = useTransition();

  // Role display label
  const getRoleDisplay = () => {
    switch (user.role) {
      case "CUSTOMER":
        return "Civitas Akademik / Pelapor";
      case "TEKNISI":
        return "Teknisi Lapangan / Pelaksana";
      case "ADMIN":
        return "Administrator Sistem";
      default:
        return user.role;
    }
  };

  // Dashboard back link
  const dashboardUrl =
    user.role === "ADMIN"
      ? "/admin"
      : user.role === "TEKNISI"
      ? "/technician"
      : "/customer";

  // Handle Edit Profile
  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setEditStatus(null);

    startTransitionEdit(async () => {
      const res = await updateUserProfile({
        name: editName,
        phone: editPhone || null,
      });

      if (res.success && res.data) {
        setUser((prev) => ({
          ...prev,
          name: res.data.name,
          phone: res.data.phone,
        }));
        setEditStatus({ type: "success", message: res.message || "Profil berhasil diperbarui." });
        setTimeout(() => {
          setActiveTab("personal");
          setEditStatus(null);
          router.refresh();
        }, 1500);
      } else {
        setEditStatus({ type: "error", message: res.error || "Gagal memperbarui profil." });
      }
    });
  };

  // Handle Change Password
  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPwdStatus(null);

    startTransitionPwd(async () => {
      const res = await changeUserPassword({
        oldPassword,
        newPassword,
        confirmPassword,
      });

      if (res.success) {
        setPwdStatus({ type: "success", message: res.message || "Kata sandi berhasil diubah." });
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setTimeout(() => {
          setIsChangePasswordModalOpen(false);
          setPwdStatus(null);
        }, 1800);
      } else {
        setPwdStatus({ type: "error", message: res.error || "Gagal mengubah kata sandi." });
      }
    });
  };

  // Handle Delete Account
  const handleDeleteAccount = (e: React.FormEvent) => {
    e.preventDefault();
    setDeleteStatus(null);

    startTransitionDelete(async () => {
      const res = await deleteUserAccount(deletePassword);
      if (res.success) {
        await signOut({ callbackUrl: "/login" });
      } else {
        setDeleteStatus({ type: "error", message: res.error || "Gagal menghapus akun." });
      }
    });
  };

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col gap-5 py-2">
      {/* TOP BAR: Kembali ke Beranda */}
      <div className="flex items-center justify-between w-full">
          <Link
            href={dashboardUrl}
            className="inline-flex items-center gap-2 text-[#475569] hover:text-[#0F172A] font-medium text-sm transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Kembali ke Beranda</span>
          </Link>
        </div>

        {/* HEADER SECTION: User Card */}
        <div className="bg-white rounded-[12px] p-4 sm:p-6 md:p-7 border border-[#E2E8F0]/70 shadow-xs flex flex-row items-center gap-4 sm:gap-6 transition-colors">
          <div className="relative shrink-0">
            <div className="w-18 h-18 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full overflow-hidden border-3 border-[#F1F5F9] shadow-xs bg-[#ECFDF5] flex items-center justify-center text-[#065F46] text-2xl sm:text-3xl md:text-4xl font-bold uppercase select-none">
              {user.name.charAt(0)}
            </div>
            <div
              className="absolute bottom-1 right-1 sm:bottom-1.5 sm:right-1.5 w-3.5 h-3.5 sm:w-4 sm:h-4 bg-[#10B981] border-2 border-white rounded-full"
              title="Aktif"
            />
          </div>

          <div className="flex-1 text-left min-w-0">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0] text-[11px] font-semibold tracking-wide mb-1.5 uppercase">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{user.role}</span>
            </div>
            <h1 className="text-lg sm:text-2xl font-bold tracking-tight text-[#0F172A] mb-1 break-words">
              {user.name}
            </h1>
            <p className="text-[#64748B] flex items-center gap-1.5 text-xs sm:text-sm break-all">
              <Mail className="w-3.5 h-3.5 shrink-0 text-[#94A3B8]" />
              <span>{user.email}</span>
            </p>
          </div>
        </div>

        {/* MAIN BODY: 2 Column Layout (Sidebar + Content) */}
        <div className="flex flex-col lg:flex-row gap-5">
          {/* SIDEBAR NAVIGATION */}
          <div className="w-full lg:w-60 shrink-0">
            <div className="bg-white rounded-[12px] p-3 border border-[#E2E8F0]/70 shadow-xs lg:sticky lg:top-24">
              <nav className="flex flex-col gap-1">
                <button
                  type="button"
                  onClick={() => setActiveTab("personal")}
                  className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-[8px] transition-all text-[13px] font-semibold cursor-pointer text-left ${
                    activeTab === "personal"
                      ? "bg-[#064E3B] text-white shadow-xs"
                      : "text-[#475569] hover:bg-[#F8FAFC] hover:text-[#0F172A]"
                  }`}
                >
                  <UserIcon className="w-4 h-4 shrink-0" />
                  <span>Informasi Pribadi</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("edit")}
                  className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-[8px] transition-all text-[13px] font-semibold cursor-pointer text-left ${
                    activeTab === "edit"
                      ? "bg-[#064E3B] text-white shadow-xs"
                      : "text-[#475569] hover:bg-[#F8FAFC] hover:text-[#0F172A]"
                  }`}
                >
                  <Edit className="w-4 h-4 shrink-0" />
                  <span>Edit Profil</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("account")}
                  className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-[8px] transition-all text-[13px] font-semibold cursor-pointer text-left ${
                    activeTab === "account"
                      ? "bg-[#064E3B] text-white shadow-xs"
                      : "text-[#475569] hover:bg-[#F8FAFC] hover:text-[#0F172A]"
                  }`}
                >
                  <Key className="w-4 h-4 shrink-0" />
                  <span>Pengaturan Akun</span>
                </button>

                <div className="h-px bg-[#E2E8F0]/60 my-1.5" />

                <button
                  type="button"
                  onClick={() => setIsLogoutModalOpen(true)}
                  className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-[8px] text-[#DC2626] hover:bg-[#FEF2F2] transition-colors text-[13px] font-semibold cursor-pointer text-left"
                >
                  <LogOut className="w-4 h-4 shrink-0" />
                  <span>Keluar</span>
                </button>
              </nav>
            </div>
          </div>

          {/* CONTENT AREA */}
          <div className="flex-1">
            <div className="bg-white rounded-[12px] p-5 sm:p-6 border border-[#E2E8F0]/70 shadow-xs min-h-[360px]">
              {/* TAB 1: Informasi Pribadi */}
              {activeTab === "personal" && (
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-[#0F172A] mb-4 flex items-center gap-2">
                    <UserIcon className="w-4.5 h-4.5 text-[#059669]" />
                    <span>Informasi Pribadi</span>
                  </h2>

                  <div className="grid grid-cols-1 gap-3.5">
                    <div className="p-3.5 rounded-[10px] bg-[#F8FAFC] border border-[#E2E8F0]/60">
                      <p className="text-[11px] text-[#64748B] font-semibold uppercase tracking-wider mb-1">
                        Nama Lengkap
                      </p>
                      <p className="text-[#0F172A] font-semibold text-sm">
                        {user.name}
                      </p>
                    </div>

                    <div className="p-3.5 rounded-[10px] bg-[#F8FAFC] border border-[#E2E8F0]/60">
                      <p className="text-[11px] text-[#64748B] font-semibold uppercase tracking-wider mb-1">
                        Email
                      </p>
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-[#94A3B8]" />
                        <p className="text-[#0F172A] font-semibold text-sm">
                          {user.email}
                        </p>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-[10px] bg-[#F8FAFC] border border-[#E2E8F0]/60">
                      <p className="text-[11px] text-[#64748B] font-semibold uppercase tracking-wider mb-1">
                        Nomor HP / WhatsApp
                      </p>
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-[#94A3B8]" />
                        <p className="text-[#0F172A] font-semibold text-sm">
                          {user.phone || "Belum diisi"}
                        </p>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-[10px] bg-[#F8FAFC] border border-[#E2E8F0]/60">
                      <p className="text-[11px] text-[#64748B] font-semibold uppercase tracking-wider mb-1">
                        Peran (Role)
                      </p>
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-3.5 h-3.5 text-[#94A3B8]" />
                        <p className="text-[#0F172A] font-semibold text-sm">
                          {getRoleDisplay()}
                        </p>
                      </div>
                    </div>

                    {user.createdAt && (
                      <div className="p-3.5 rounded-[10px] bg-[#F8FAFC] border border-[#E2E8F0]/60">
                        <p className="text-[11px] text-[#64748B] font-semibold uppercase tracking-wider mb-1">
                          Tanggal Terdaftar
                        </p>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-[#94A3B8]" />
                          <p className="text-[#0F172A] font-semibold text-sm">
                            {formatDateTime(user.createdAt)}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: Edit Profil */}
              {activeTab === "edit" && (
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-[#0F172A] mb-4 flex items-center gap-2">
                    <Edit className="w-4.5 h-4.5 text-[#059669]" />
                    <span>Edit Profil</span>
                  </h2>

                  <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-md">
                    <div>
                      <label className="block text-[13px] font-medium text-[#334155] mb-1">
                        Nama Lengkap
                      </label>
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        required
                        className="w-full px-3.5 py-2 rounded-[8px] border border-[#CBD5E1] text-[#0F172A] text-sm focus:outline-none focus:ring-2 focus:ring-[#059669] focus:border-transparent transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-[13px] font-medium text-[#334155] mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        value={user.email}
                        disabled
                        className="w-full px-3.5 py-2 rounded-[8px] border border-[#E2E8F0] bg-[#F1F5F9] text-[#64748B] text-sm cursor-not-allowed"
                      />
                      <p className="text-[11px] text-[#94A3B8] mt-1">
                        Email akun tidak dapat diubah secara mandiri.
                      </p>
                    </div>

                    <div>
                      <label className="block text-[13px] font-medium text-[#334155] mb-1">
                        Nomor HP / WhatsApp
                      </label>
                      <input
                        type="tel"
                        value={editPhone}
                        onChange={(e) => setEditPhone(e.target.value)}
                        placeholder="Contoh: 081234567890"
                        className="w-full px-3.5 py-2 rounded-[8px] border border-[#CBD5E1] text-[#0F172A] text-sm focus:outline-none focus:ring-2 focus:ring-[#059669] focus:border-transparent transition-all placeholder:text-[#94A3B8]"
                      />
                      <p className="text-[11px] text-[#64748B] mt-1">
                        Gunakan nomor aktif untuk koordinasi teknisi via WhatsApp.
                      </p>
                    </div>

                    <div>
                      <label className="block text-[13px] font-medium text-[#334155] mb-1">
                        Peran
                      </label>
                      <input
                        type="text"
                        value={getRoleDisplay()}
                        disabled
                        className="w-full px-3.5 py-2 rounded-[8px] border border-[#E2E8F0] bg-[#F1F5F9] text-[#64748B] text-sm cursor-not-allowed"
                      />
                    </div>

                    {editStatus && (
                      <div
                        className={`p-3 rounded-[8px] text-[13px] flex items-center gap-2 ${
                          editStatus.type === "success"
                            ? "bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]"
                            : "bg-[#FEF2F2] text-[#991B1B] border border-[#FECACA]"
                        }`}
                      >
                        {editStatus.type === "success" ? (
                          <CheckCircle2 className="h-4 w-4 shrink-0 text-[#059669]" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 shrink-0 text-[#DC2626]" />
                        )}
                        <span>{editStatus.message}</span>
                      </div>
                    )}

                    <div className="flex gap-2.5 pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEditName(user.name);
                          setEditPhone(user.phone || "");
                          setEditStatus(null);
                          setActiveTab("personal");
                        }}
                        className="flex-1 px-4 py-2 rounded-[8px] border border-[#CBD5E1] text-[#475569] font-medium hover:bg-[#F8FAFC] transition-colors text-sm cursor-pointer"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        disabled={isPendingEdit}
                        className="flex-1 px-4 py-2 rounded-[8px] bg-[#064E3B] hover:bg-[#043d2e] text-white font-medium transition-colors text-sm shadow-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        {isPendingEdit && <Loader2 className="h-4 w-4 animate-spin" />}
                        <span>Simpan Perubahan</span>
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* TAB 3: Pengaturan Akun */}
              {activeTab === "account" && (
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-[#0F172A] mb-4 flex items-center gap-2">
                    <Key className="w-4.5 h-4.5 text-[#059669]" />
                    <span>Pengaturan Akun</span>
                  </h2>

                  <div className="space-y-3.5">
                    <div className="flex items-center justify-between p-3.5 rounded-[10px] border border-[#E2E8F0]/70 hover:border-[#CBD5E1] transition-colors bg-[#F8FAFC]">
                      <div>
                        <h3 className="text-[#0F172A] font-semibold text-sm">
                          Ubah Kata Sandi
                        </h3>
                        <p className="text-[12px] text-[#64748B] mt-0.5">
                          Perbarui kata sandi akun secara berkala untuk keamanan
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setPwdStatus(null);
                          setIsChangePasswordModalOpen(true);
                        }}
                        className="px-3.5 py-1.5 bg-white border border-[#CBD5E1] text-[#0F172A] hover:bg-[#F8FAFC] rounded-[6px] font-semibold transition-colors text-xs shadow-2xs cursor-pointer"
                      >
                        Ubah
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-3.5 rounded-[10px] border border-[#E2E8F0]/70 hover:border-[#CBD5E1] transition-colors bg-[#F8FAFC]">
                      <div>
                        <h3 className="text-[#0F172A] font-semibold text-sm">
                          Keluar dari Akun
                        </h3>
                        <p className="text-[12px] text-[#64748B] mt-0.5">
                          Akhiri sesi login Anda pada perangkat ini
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsLogoutModalOpen(true)}
                        className="px-3.5 py-1.5 bg-white border border-[#FECACA] text-[#DC2626] hover:bg-[#FEF2F2] rounded-[6px] font-semibold transition-colors text-xs shadow-2xs cursor-pointer"
                      >
                        Keluar
                      </button>
                    </div>

                    {/* Zona Bahaya */}
                    <div className="mt-6 p-4 rounded-[10px] border border-[#FECACA] bg-[#FEF2F2]/60">
                      <div className="flex items-center gap-2 mb-1">
                        <AlertTriangle className="h-4 w-4 text-[#DC2626]" />
                        <h3 className="text-[#991B1B] font-bold text-sm">
                          Zona Bahaya
                        </h3>
                      </div>
                      <p className="text-xs text-[#B91C1C] mb-3">
                        Setelah Anda menghapus akun, seluruh tiket dan data Anda akan dihapus secara permanen. Tindakan ini tidak dapat dibatalkan.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setDeleteStatus(null);
                          setDeletePassword("");
                          setIsDeleteModalOpen(true);
                        }}
                        className="px-3.5 py-1.5 bg-white text-[#DC2626] border border-[#FECACA] hover:bg-[#FEF2F2] rounded-[6px] font-semibold transition-colors text-xs shadow-2xs cursor-pointer"
                      >
                        Hapus Akun
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

      {/* MODAL 1: Konfirmasi Keluar */}
      {isLogoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-[12px] shadow-xl max-w-sm w-full p-6 border border-[#E2E8F0]">
            <h3 className="text-base font-bold text-[#0F172A] mb-1.5">
              Konfirmasi Keluar
            </h3>
            <p className="text-sm text-[#64748B] mb-5">
              Apakah Anda yakin ingin keluar dari sesi akun ini?
            </p>
            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={() => setIsLogoutModalOpen(false)}
                className="flex-1 px-4 py-2 rounded-[8px] border border-[#CBD5E1] text-[#475569] font-medium hover:bg-[#F8FAFC] transition-colors text-sm cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="flex-1 px-4 py-2 rounded-[8px] bg-[#DC2626] hover:bg-[#B91C1C] text-white font-medium transition-colors text-sm shadow-xs cursor-pointer"
              >
                Ya, Keluar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Ubah Kata Sandi */}
      {isChangePasswordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-[12px] shadow-xl max-w-md w-full p-6 border border-[#E2E8F0]">
            <h3 className="text-base font-bold text-[#0F172A] mb-1">
              Ubah Kata Sandi
            </h3>
            <p className="text-xs text-[#64748B] mb-4">
              Masukkan kata sandi lama Anda dan kata sandi baru (minimal 6 karakter).
            </p>

            <form onSubmit={handleChangePassword} className="space-y-3.5">
              {/* Kata Sandi Lama */}
              <div>
                <label className="block text-[12px] font-semibold text-[#334155] mb-1">
                  Kata Sandi Lama
                </label>
                <div className="relative flex items-center">
                  <input
                    type={showOldPassword ? "text" : "password"}
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    placeholder="Masukkan kata sandi lama"
                    required
                    className="w-full px-3.5 pr-10 py-2 rounded-[8px] border border-[#CBD5E1] text-sm focus:outline-none focus:ring-2 focus:ring-[#059669] focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => setShowOldPassword(!showOldPassword)}
                    className="absolute right-3 text-[#94A3B8] hover:text-[#475569] cursor-pointer"
                    aria-label="Toggle password"
                  >
                    {showOldPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Kata Sandi Baru */}
              <div>
                <label className="block text-[12px] font-semibold text-[#334155] mb-1">
                  Kata Sandi Baru
                </label>
                <div className="relative flex items-center">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimal 6 karakter"
                    required
                    minLength={6}
                    className="w-full px-3.5 pr-10 py-2 rounded-[8px] border border-[#CBD5E1] text-sm focus:outline-none focus:ring-2 focus:ring-[#059669] focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 text-[#94A3B8] hover:text-[#475569] cursor-pointer"
                    aria-label="Toggle password"
                  >
                    {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Konfirmasi Kata Sandi Baru */}
              <div>
                <label className="block text-[12px] font-semibold text-[#334155] mb-1">
                  Konfirmasi Kata Sandi Baru
                </label>
                <div className="relative flex items-center">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Ulangi kata sandi baru"
                    required
                    minLength={6}
                    className="w-full px-3.5 pr-10 py-2 rounded-[8px] border border-[#CBD5E1] text-sm focus:outline-none focus:ring-2 focus:ring-[#059669] focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 text-[#94A3B8] hover:text-[#475569] cursor-pointer"
                    aria-label="Toggle password"
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {pwdStatus && (
                <div
                  className={`p-3 rounded-[8px] text-[12px] flex items-center gap-2 ${
                    pwdStatus.type === "success"
                      ? "bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]"
                      : "bg-[#FEF2F2] text-[#991B1B] border border-[#FECACA]"
                  }`}
                >
                  {pwdStatus.type === "success" ? (
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-[#059669]" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 shrink-0 text-[#DC2626]" />
                  )}
                  <span>{pwdStatus.message}</span>
                </div>
              )}

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsChangePasswordModalOpen(false)}
                  className="flex-1 px-4 py-2 rounded-[8px] border border-[#CBD5E1] text-[#475569] font-medium hover:bg-[#F8FAFC] transition-colors text-sm cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isPendingPwd}
                  className="flex-1 px-4 py-2 rounded-[8px] bg-[#064E3B] hover:bg-[#043d2e] text-white font-medium transition-colors text-sm shadow-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isPendingPwd && <Loader2 className="h-4 w-4 animate-spin" />}
                  <span>Simpan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Hapus Akun */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-[12px] shadow-xl max-w-md w-full p-6 border border-[#FECACA]">
            <h3 className="text-base font-bold text-[#DC2626] mb-1.5 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-[#DC2626]" />
              <span>Hapus Akun</span>
            </h3>
            <p className="text-xs text-[#64748B] mb-4">
              Tindakan ini permanen dan tidak dapat dibatalkan. Masukkan kata sandi akun Anda untuk mengonfirmasi penghapusan.
            </p>

            <form onSubmit={handleDeleteAccount} className="space-y-3.5">
              <div>
                <label className="block text-[12px] font-semibold text-[#334155] mb-1">
                  Kata Sandi
                </label>
                <input
                  type="password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  placeholder="Masukkan kata sandi Anda"
                  required
                  className="w-full px-3.5 py-2 rounded-[8px] border border-[#CBD5E1] text-sm focus:outline-none focus:ring-2 focus:ring-[#DC2626] focus:border-transparent"
                />
              </div>

              {deleteStatus && (
                <div className="p-3 rounded-[8px] text-[12px] flex items-center gap-2 bg-[#FEF2F2] text-[#991B1B] border border-[#FECACA]">
                  <AlertTriangle className="h-4 w-4 shrink-0 text-[#DC2626]" />
                  <span>{deleteStatus.message}</span>
                </div>
              )}

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="flex-1 px-4 py-2 rounded-[8px] border border-[#CBD5E1] text-[#475569] font-medium hover:bg-[#F8FAFC] transition-colors text-sm cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isPendingDelete}
                  className="flex-1 px-4 py-2 rounded-[8px] bg-[#DC2626] hover:bg-[#B91C1C] text-white font-medium transition-colors text-sm shadow-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isPendingDelete && <Loader2 className="h-4 w-4 animate-spin" />}
                  <span>Hapus Akun</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
