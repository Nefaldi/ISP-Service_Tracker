"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { assignTechnician } from "@/actions/ticket.actions";
import { Button } from "@/components/ui/button";
import { UserCheck, X } from "lucide-react";

interface TechnicianOption {
  id: string;
  name: string;
  email: string;
}

interface AssignTechnicianDialogProps {
  ticketId: string;
  ticketNumber?: string;
  ticketTitle?: string;
  currentTechnicianId?: string | null;
  technicians: TechnicianOption[];
}

export function AssignTechnicianDialog({
  ticketId,
  ticketNumber,
  ticketTitle,
  currentTechnicianId,
  technicians,
}: AssignTechnicianDialogProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTechId, setSelectedTechId] = useState(
    currentTechnicianId || (technicians[0]?.id ?? "")
  );
  const [isLoading, setIsLoading] = useState(false);

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTechId) return;
    setIsLoading(true);

    const res = await assignTechnician({
      ticketId,
      technicianId: selectedTechId,
    });

    setIsLoading(false);
    if (res.success) {
      setIsOpen(false);
      router.refresh();
    } else {
      alert(res.error || "Gagal menugaskan teknisi.");
    }
  };

  return (
    <>
      <Button
        type="button"
        size="sm"
        variant="outline"
        onClick={() => setIsOpen(true)}
        className="h-[36px] text-[13px] border-[#1D4ED8] text-[#1D4ED8] hover:bg-[#EFF6FF] font-medium"
      >
        <UserCheck className="h-3.5 w-3.5 mr-1" />
        <span>Tugaskan</span>
      </Button>

      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs"
        >
          <div className="w-full max-w-md rounded-[12px] bg-white border border-[#E2E8F0] p-6 shadow-xl text-[#0F172A]">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
              <h3 className="text-[18px] font-semibold text-[#0F172A]">
                Penugasan Teknisi
              </h3>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Tutup dialog"
                className="text-[#64748B] hover:text-[#0F172A]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="py-4 space-y-3">
              {ticketNumber && (
                <div className="p-3 bg-[#EFF6FF] rounded-[8px] border border-[#BFDBFE] text-xs">
                  <span className="font-semibold text-[#1D4ED8] block">
                    Tiket #{ticketNumber}
                  </span>
                  <span className="text-[#0F172A]">{ticketTitle}</span>
                </div>
              )}

              <form onSubmit={handleAssign} className="space-y-4">
                <div>
                  <label
                    htmlFor={`select-tech-${ticketId}`}
                    className="block text-[14px] font-medium text-[#0F172A] mb-1.5"
                  >
                    Pilih Teknisi Pelaksana
                  </label>
                  <select
                    id={`select-tech-${ticketId}`}
                    value={selectedTechId}
                    onChange={(e) => setSelectedTechId(e.target.value)}
                    required
                    className="w-full h-[44px] px-3.5 py-2 rounded-[8px] border border-[#94A3B8] bg-white text-[14px] text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]"
                  >
                    <option value="" disabled>
                      Pilih dari daftar teknisi...
                    </option>
                    {technicians.map((tech) => (
                      <option key={tech.id} value={tech.id}>
                        {tech.name} ({tech.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsOpen(false)}
                    className="h-[40px] px-4"
                  >
                    Batal
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    isLoading={isLoading}
                    disabled={!selectedTechId}
                    className="h-[40px] px-4"
                  >
                    Simpan Penugasan
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
