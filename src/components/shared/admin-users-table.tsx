"use client";

import { useState, useMemo } from "react";
import { formatDateTime } from "@/lib/utils";
import { Search, User, ShieldCheck, Wrench } from "lucide-react";

export interface UserRow {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "TEKNISI" | "CUSTOMER";
  phone?: string | null;
  createdAt: string | Date;
  _count?: {
    createdTickets?: number;
    assignedTickets?: number;
  };
}

interface AdminUsersTableProps {
  initialUsers: UserRow[];
}

export function AdminUsersTable({ initialUsers }: AdminUsersTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");

  const counts = useMemo(() => {
    return {
      all: initialUsers.length,
      admin: initialUsers.filter((u) => u.role === "ADMIN").length,
      teknisi: initialUsers.filter((u) => u.role === "TEKNISI").length,
      customer: initialUsers.filter((u) => u.role === "CUSTOMER").length,
    };
  }, [initialUsers]);

  const filteredUsers = useMemo(() => {
    return initialUsers.filter((user) => {
      const keyword = searchTerm.toLowerCase().trim();
      const matchKeyword =
        !keyword ||
        user.name.toLowerCase().includes(keyword) ||
        user.email.toLowerCase().includes(keyword) ||
        (user.phone || "").toLowerCase().includes(keyword);

      const matchRole = roleFilter === "ALL" || user.role === roleFilter;

      return matchKeyword && matchRole;
    });
  }, [initialUsers, searchTerm, roleFilter]);

  return (
    <div className="space-y-4">
      {/* Role Tabs & Search Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Role Tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setRoleFilter("ALL")}
            className={`h-[36px] px-3.5 rounded-[8px] text-[13px] font-semibold transition-colors ${
              roleFilter === "ALL"
                ? "bg-[#0F172A] text-white"
                : "bg-white border border-[#E2E8F0] text-[#475569] hover:bg-[#F1F5F9]"
            }`}
          >
            Semua ({counts.all})
          </button>
          <button
            type="button"
            onClick={() => setRoleFilter("TEKNISI")}
            className={`h-[36px] px-3.5 rounded-[8px] text-[13px] font-semibold transition-colors flex items-center gap-1.5 ${
              roleFilter === "TEKNISI"
                ? "bg-[#5B21B6] text-white"
                : "bg-white border border-[#DDD6FE] text-[#5B21B6] hover:bg-[#EDE9FE]"
            }`}
          >
            <Wrench className="h-3.5 w-3.5" />
            <span>Teknisi ({counts.teknisi})</span>
          </button>
          <button
            type="button"
            onClick={() => setRoleFilter("CUSTOMER")}
            className={`h-[36px] px-3.5 rounded-[8px] text-[13px] font-semibold transition-colors flex items-center gap-1.5 ${
              roleFilter === "CUSTOMER"
                ? "bg-[#1D4ED8] text-white"
                : "bg-white border border-[#BFDBFE] text-[#1D4ED8] hover:bg-[#EFF6FF]"
            }`}
          >
            <User className="h-3.5 w-3.5" />
            <span>Pelanggan ({counts.customer})</span>
          </button>
          <button
            type="button"
            onClick={() => setRoleFilter("ADMIN")}
            className={`h-[36px] px-3.5 rounded-[8px] text-[13px] font-semibold transition-colors flex items-center gap-1.5 ${
              roleFilter === "ADMIN"
                ? "bg-[#0B2A6F] text-white"
                : "bg-white border border-[#CBD5E1] text-[#0F172A] hover:bg-[#F1F5F9]"
            }`}
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Admin ({counts.admin})</span>
          </button>
        </div>

        {/* Search Bar (280px) */}
        <div className="relative w-full sm:w-[280px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#64748B]" />
          <input
            type="text"
            aria-label="Cari pengguna"
            placeholder="Cari nama, email, nomor HP..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-[36px] pl-9 pr-3 rounded-[8px] border border-[#94A3B8] bg-white text-[13px] text-[#0F172A] placeholder:text-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]"
          />
        </div>
      </div>

      {/* Users Table dalam Kartu Putih dengan overflow-x: auto */}
      <div className="rounded-[12px] border border-[#E2E8F0] bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
                <th className="py-3.5 px-4 text-[14px] font-medium text-[#475569]">
                  Nama Pengguna
                </th>
                <th className="py-3.5 px-4 text-[14px] font-medium text-[#475569]">
                  Email
                </th>
                <th className="py-3.5 px-4 text-[14px] font-medium text-[#475569]">
                  Peran (Role)
                </th>
                <th className="py-3.5 px-4 text-[14px] font-medium text-[#475569]">
                  No. Telepon
                </th>
                <th className="py-3.5 px-4 text-[14px] font-medium text-[#475569] text-right">
                  Aktivitas Tiket
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="py-10 text-center text-[14px] text-[#64748B]"
                  >
                    Tidak ditemukan pengguna yang sesuai.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-[#F8FAFC] transition-colors"
                  >
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-[14px] text-[#0F172A]">
                        {user.name}
                      </div>
                      <div className="text-[12px] text-[#64748B]">
                        Terdaftar: {formatDateTime(user.createdAt)}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-[14px] text-[#475569]">
                      {user.email}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {user.role === "ADMIN" && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[12px] font-semibold bg-[#F1F5F9] text-[#0F172A] border border-[#CBD5E1]">
                          Admin
                        </span>
                      )}
                      {user.role === "TEKNISI" && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[12px] font-semibold bg-[#EDE9FE] text-[#5B21B6] border border-[#DDD6FE]">
                          Teknisi
                        </span>
                      )}
                      {user.role === "CUSTOMER" && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[12px] font-semibold bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE]">
                          Pelanggan
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-[13px] text-[#475569]">
                      {user.phone || "-"}
                    </td>

                    <td className="py-3.5 px-4 text-right whitespace-nowrap text-[13px] font-medium text-[#0F172A]">
                      {user.role === "TEKNISI" ? (
                        <span>{user._count?.assignedTickets || 0} Tugas Selesai/Aktif</span>
                      ) : (
                        <span>{user._count?.createdTickets || 0} Laporan Dibuat</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
