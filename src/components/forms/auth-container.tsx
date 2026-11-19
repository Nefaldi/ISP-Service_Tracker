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
