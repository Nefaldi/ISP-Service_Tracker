import React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <div className="w-full">
        <input
          ref={ref}
          className={cn(
            "w-full h-[48px] px-3.5 py-2.5 rounded-[8px] border bg-white text-[15px] text-[#0F172A] placeholder:text-[#64748B] transition-colors focus:outline-none focus:ring-2 focus:ring-[#1D4ED8] focus:border-transparent disabled:opacity-50 disabled:bg-[#F6F7F9]",
            error
              ? "border-[#DC2626] focus:ring-[#DC2626]"
              : "border-[#94A3B8] focus:ring-[#1D4ED8]",
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-1.5 text-xs text-[#DC2626] font-medium" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
