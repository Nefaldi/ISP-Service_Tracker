"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Wrench, UserCheck, LogOut, Ticket } from "lucide-react";

interface NavbarProps {
  user?: {
    name?: string | null;
    email?: string | null;
    role?: "ADMIN" | "TEKNISI" | "CUSTOMER";
  } | null;
}

export function Navbar({ user }: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/80 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/80">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="flex items-center gap-2 font-bold text-lg tracking-tight text-blue-600 dark:text-blue-400"
          >
            <Ticket className="h-6 w-6" />
            <span>ServiceTracker</span>
          </Link>

          {user && (
            <nav className="hidden md:flex items-center gap-4 text-sm font-medium">
              {user.role === "ADMIN" && (
                <>
                  <Link
                    href="/admin"
                    className="flex items-center gap-1.5 text-zinc-600 hover:text-blue-600 dark:text-zinc-300"
                  >
                    <ShieldCheck className="h-4 w-4" />
                    <span>Admin Overview</span>
                  </Link>
                  <Link
                    href="/admin/tickets"
                    className="text-zinc-600 hover:text-blue-600 dark:text-zinc-300"
                  >
                    Tiket Helpdesk
                  </Link>
                </>
              )}

              {user.role === "TEKNISI" && (
                <>
                  <Link
                    href="/technician"
                    className="flex items-center gap-1.5 text-zinc-600 hover:text-blue-600 dark:text-zinc-300"
                  >
                    <Wrench className="h-4 w-4" />
                    <span>Portal Teknisi</span>
                  </Link>
                  <Link
                    href="/technician/tasks"
                    className="text-zinc-600 hover:text-blue-600 dark:text-zinc-300"
                  >
                    Daftar Tugas
                  </Link>
                </>
              )}

              {user.role === "CUSTOMER" && (
                <>
                  <Link
                    href="/customer"
                    className="flex items-center gap-1.5 text-zinc-600 hover:text-blue-600 dark:text-zinc-300"
                  >
                    <UserCheck className="h-4 w-4" />
                    <span>Portal Pelanggan</span>
                  </Link>
                </>
              )}
            </nav>
          )}
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  {user.name}
                </span>
                <span className="text-xs text-zinc-500">{user.email}</span>
              </div>
              {user.role && (
                <Badge
                  className={
                    user.role === "ADMIN"
                      ? "bg-purple-100 text-purple-700 border-purple-300"
                      : user.role === "TEKNISI"
                      ? "bg-blue-100 text-blue-700 border-blue-300"
                      : "bg-emerald-100 text-emerald-700 border-emerald-300"
                  }
                >
                  {user.role}
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => signOut({ callbackUrl: "/login" })}
                title="Keluar"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="primary" size="sm">
                  Masuk
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
