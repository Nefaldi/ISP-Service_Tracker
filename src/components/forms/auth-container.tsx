"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { LoginForm } from "@/components/forms/login-form";
import { RegisterForm } from "@/components/forms/register-form";

interface AuthContainerProps {
  initialTab?: "login" | "register";
}

export function AuthContainer({ initialTab = "login" }: AuthContainerProps) {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab") || searchParams.get("mode");

  const [localTab, setLocalTab] = useState<"login" | "register" | null>(null);

  const activeTab =
    localTab ?? (tabParam === "register" ? "register" : (tabParam === "login" ? "login" : initialTab));

  const handleSwitchTab = (tab: "login" | "register") => {
    setLocalTab(tab);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("tab", tab);
      window.history.replaceState({}, "", url.toString());
    }
  };

  return (
    <div className="w-full max-w-[420px] mx-auto py-6">
      {/* Tab Switcher: Masuk vs Daftar Akun */}
      <div className="flex rounded-[10px] bg-[#F1F5F9] p-1 mb-6 border border-[#E2E8F0]">
        <button
          type="button"
          onClick={() => handleSwitchTab("login")}
          className={`flex-1 py-2 text-[14px] font-semibold rounded-[8px] transition-all cursor-pointer text-center ${
            activeTab === "login"
              ? "bg-white text-[#0B2A6F] shadow-xs"
              : "text-[#64748B] hover:text-[#0F172A]"
          }`}
        >
          Masuk
        </button>
        <button
          type="button"
          onClick={() => handleSwitchTab("register")}
          className={`flex-1 py-2 text-[14px] font-semibold rounded-[8px] transition-all cursor-pointer text-center ${
            activeTab === "register"
              ? "bg-white text-[#0B2A6F] shadow-xs"
              : "text-[#64748B] hover:text-[#0F172A]"
          }`}
        >
          Daftar Akun
        </button>
      </div>

      {/* Form Content */}
      <div className="transition-all duration-200">
        {activeTab === "login" ? (
          <LoginForm onSwitchToRegister={() => handleSwitchTab("register")} />
        ) : (
          <RegisterForm onSwitchToLogin={() => handleSwitchTab("login")} />
        )}
      </div>
    </div>
  );
}
