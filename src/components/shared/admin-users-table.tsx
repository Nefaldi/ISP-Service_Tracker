"use client";

import { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/utils";
import { Search, UserCheck, ShieldCheck, Wrench, Phone, Mail, Calendar } from "lucide-react";

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

  const counts = useMemo(() => {
    return {
      all: initialUsers.length,
      admin: initialUsers.filter((u) => u.role === "ADMIN").length,
      teknisi: initialUsers.filter((u) => u.role === "TEKNISI").length,
      customer: initialUsers.filter((u) => u.role === "CUSTOMER").length,
    };
  }, [initialUsers]);

  return (
    <div className="space-y-4">
      {/* Role Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs">
        {/* Role Tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setRoleFilter("ALL")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              roleFilter === "ALL"
                ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300"
            }`}
          >
            Semua ({counts.all})
          </button>
          <button
            type="button"
            onClick={() => setRoleFilter("ADMIN")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 ${
              roleFilter === "ADMIN"
                ? "bg-purple-600 text-white"
                : "bg-purple-50 text-purple-700 hover:bg-purple-100 dark:bg-purple-950/40 dark:text-purple-300"
            }`}
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Admin ({counts.admin})</span>
          </button>
          <button
            type="button"
            onClick={() => setRoleFilter("TEKNISI")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 ${
              roleFilter === "TEKNISI"
                ? "bg-blue-600 text-white"
                : "bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-950/40 dark:text-blue-300"
            }`}
          >
            <Wrench className="h-3.5 w-3.5" />
            <span>Teknisi ({counts.teknisi})</span>
          </button>
          <button
            type="button"
            onClick={() => setRoleFilter("CUSTOMER")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 ${
              roleFilter === "CUSTOMER"
                ? "bg-emerald-600 text-white"
                : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300"
            }`}
          >
            <UserCheck className="h-3.5 w-3.5" />
            <span>Pelanggan ({counts.customer})</span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Cari nama, email, nomor HP..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-zinc-200 bg-zinc-50/50 text-xs font-semibold uppercase text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/50">
            <tr>
              <th className="px-4 py-3">Pengguna</th>
              <th className="px-4 py-3">Peran (Role)</th>
              <th className="px-4 py-3">Kontak</th>
              <th className="px-4 py-3">Aktivitas Tiket</th>
              <th className="px-4 py-3">Tanggal Terdaftar</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-zinc-500 text-xs">
                  Tidak ditemukan data pengguna yang sesuai.
                </td>
              </tr>
            ) : (
              filteredUsers.map((u) => (
                <tr
                  key={u.id}
                  className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="font-semibold text-zinc-900 dark:text-zinc-100">
                      {u.name}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-zinc-500 mt-0.5">
                      <Mail className="h-3 w-3" />
                      <span>{u.email}</span>
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    <Badge
                      className={
                        u.role === "ADMIN"
                          ? "bg-purple-100 text-purple-700 border-purple-300"
                          : u.role === "TEKNISI"
                          ? "bg-blue-100 text-blue-700 border-blue-300"
                          : "bg-emerald-100 text-emerald-700 border-emerald-300"
                      }
                    >
                      {u.role}
                    </Badge>
                  </td>

                  <td className="px-4 py-3 text-xs text-zinc-600 dark:text-zinc-400">
                    {u.phone ? (
                      <div className="flex items-center gap-1.5">
                        <Phone className="h-3 w-3 text-zinc-400" />
                        <span>{u.phone}</span>
                      </div>
                    ) : (
                      <span className="text-zinc-400 italic">-</span>
                    )}
                  </td>

                  <td className="px-4 py-3 text-xs text-zinc-600 dark:text-zinc-400">
                    {u.role === "CUSTOMER" && (
                      <span>{u._count?.createdTickets || 0} Tiket Dilaporkan</span>
                    )}
                    {u.role === "TEKNISI" && (
                      <span>{u._count?.assignedTickets || 0} Tugas Ditugaskan</span>
                    )}
                    {u.role === "ADMIN" && (
                      <span className="text-purple-600 font-medium">Administrator Sistem</span>
                    )}
                  </td>

                  <td className="px-4 py-3 text-xs text-zinc-500 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3 w-3 text-zinc-400" />
                      <span>{formatDateTime(u.createdAt)}</span>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-xs text-zinc-500 px-1">
        <span>
          Menampilkan <strong>{filteredUsers.length}</strong> dari {initialUsers.length} pengguna
        </span>
      </div>
    </div>
  );
}
