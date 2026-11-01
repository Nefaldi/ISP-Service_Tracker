import { Suspense } from "react";
import { LoginForm } from "@/components/forms/login-form";

export const metadata = {
  title: "Masuk - Service Tracker & Helpdesk",
};

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-gradient-to-br from-zinc-100 via-white to-blue-50/30 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
      <Suspense fallback={<div className="text-sm text-zinc-500">Memuat formulir masuk...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
