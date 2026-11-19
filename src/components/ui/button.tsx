import React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "success" | "danger" | "ghost";
  size?: "sm" | "md" | "lg" | "mobile-action";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium rounded-[8px] transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none";

    const variantStyles = {
      primary:
        "bg-[#1D4ED8] text-white hover:bg-[#1E40AF] focus:ring-[#1D4ED8] shadow-xs active:bg-[#1E3A8A]",
      secondary:
        "bg-[#0F172A] text-white hover:bg-[#1E293B] focus:ring-[#0F172A] shadow-xs",
      outline:
        "border border-[#1D4ED8] bg-transparent text-[#1D4ED8] hover:bg-[#EFF6FF] focus:ring-[#1D4ED8]",
      success:
        "bg-[#1D4ED8] text-white hover:bg-[#1E40AF] focus:ring-[#1D4ED8] shadow-xs active:bg-[#1E3A8A]",
      danger:
        "bg-[#DC2626] text-white hover:bg-[#B91C1C] focus:ring-[#DC2626] shadow-xs",
      ghost:
        "text-[#475569] hover:bg-[#F1F5F9] hover:text-[#0F172A]",
    };

    const sizeStyles = {
      sm: "h-[36px] text-[13px] px-3 gap-1.5",
      md: "h-[44px] text-[15px] px-4 gap-2",
      lg: "h-[48px] text-[15px] px-5 gap-2",
      "mobile-action": "h-[52px] text-[16px] font-semibold px-6 rounded-[10px] gap-2.5 w-full",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
