"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { CreateTicketForm } from "./create-ticket-form";

interface CreateTicketDialogProps {
  buttonText?: string;
  className?: string;
}

export function CreateTicketDialog({
  buttonText = "Buat Laporan",
  className = "",
}: CreateTicketDialogProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={`h-[40px] px-4 rounded-[8px] bg-[#1D4ED8] hover:bg-[#1E40AF] text-white text-[14px] font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer ${className}`}
      >
        <Plus className="h-4 w-4 stroke-[2.5]" />
        <span>{buttonText}</span>
      </button>

      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs"
        >
          <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-[12px] bg-white border border-[#E2E8F0] shadow-2xl p-6 text-[#0F172A]">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Tutup form laporan"
              className="absolute top-4 right-4 text-[#64748B] hover:text-[#0F172A] p-1.5 rounded-full hover:bg-[#F1F5F9] transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <CreateTicketForm />
          </div>
        </div>
      )}
    </>
  );
}
