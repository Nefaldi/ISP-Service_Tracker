"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { assignTechnician } from "@/actions/ticket.actions";
import { Button } from "@/components/ui/button";
import { UserCheck, RefreshCw, X, ShieldAlert } from "lucide-react";

export interface TechnicianOption {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  activeTaskCount?: number;
}

interface AssignTechnicianDialogProps {
  ticketId: string;
  ticketNumber?: string;
  ticketTitle?: string;
  currentTechnicianId?: string | null;
  technicians: TechnicianOption[];
  isReassign?: boolean;
}

export function AssignTechnicianDialog({
  ticketId,
  ticketNumber,
  ticketTitle,
  currentTechnicianId,
  technicians,
  isReassign = false,
}: AssignTechnicianDialogProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTechId, setSelectedTechId] = useState(
    currentTechnicianId || (technicians[0]?.id ?? "")
  );
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTechId) return;
    setIsLoading(true);
    setErrorMsg(null);

    const res = await assignTechnician({
      ticketId,
      technicianId: selectedTechId,
      notes: notes.trim() || undefined,
    });

    setIsLoading(false);
    if (res.success) {
      setIsOpen(false);
      setNotes("");
      router.refresh();
    } else {
      setErrorMsg(res.error || "Gagal menugaskan teknisi.");
    }
  };

  return (
    <>
      <Button
        type="button"
        size="sm"
        variant="outline"
        onClick={() => {
          setSelectedTechId(currentTechnicianId || (technicians[0]?.id ?? ""));
          setIsOpen(true);
        }}
        className={`h-[36px] text-[13px] font-semibold transition-colors cursor-pointer ${
          isReassign
            ? "border-[#CBD5E1] text-[#334155] hover:bg-[#F1F5F9]"
            : "border-[#1D4ED8] text-[#1D4ED8] hover:bg-[#EFF6FF]"
        }`}
      >
        {isReassign ? (
          <>
            <RefreshCw className="h-3.5 w-3.5 mr-1 text-[#475569]" />
            <span>Ubah Teknisi</span>
          </>
        ) : (
          <>
            <UserCheck className="h-3.5 w-3.5 mr-1" />
            <span>Tugaskan</span>
          </>
        )}
      </Button>

      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs"
        >
          <div className="w-full max-w-lg rounded-[12px] bg-white border border-[#E2E8F0] p-6 shadow-xl text-[#0F172A]">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
              <h3 className="text-[18px] font-bold text-[#0F172A]">
                {isReassign ? "Ubah Penugasan Teknisi" : "Tugaskan Teknisi Lapangan"}
              </h3>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Tutup dialog"
                className="text-[#64748B] hover:text-[#0F172A] p-1 rounded-full"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="py-4 space-y-4">
              {ticketNumber && (
                <div className="p-3 bg-[#EFF6FF] rounded-[8px] border border-[#BFDBFE] text-xs space-y-1">
                  <span className="font-semibold text-[#1D4ED8] block">
                    Tiket #{ticketNumber}
                  </span>
                  <span className="text-[#0F172A] font-medium block">
                    {ticketTitle}
                  </span>
                </div>
              )}

              {errorMsg && (
                <div className="p-3 rounded-[8px] bg-[#FEF2F2] border border-[#FCA5A5] text-[#991B1B] text-xs flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4 shrink-0 text-[#DC2626]" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleAssign} className="space-y-4">
                <div>
                  <label
                    htmlFor={`select-tech-${ticketId}`}
                    className="block text-[14px] font-semibold text-[#0F172A] mb-1.5"
                  >
                    Pilih Teknisi Pelaksana
                  </label>
                  {technicians.length === 0 ? (
                    <div className="p-3 rounded-[8px] border border-[#E2E8F0] bg-[#F8FAFC] text-[13px] text-[#64748B]">
                      Tidak ada teknisi aktif yang terdaftar di sistem.
                    </div>
                  ) : (
                    <select
                      id={`select-tech-${ticketId}`}
                      value={selectedTechId}
                      onChange={(e) => setSelectedTechId(e.target.value)}
                      required
                      className="w-full h-[46px] px-3.5 py-2 rounded-[8px] border border-[#94A3B8] bg-white text-[14px] text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]"
                    >
                      <option value="" disabled>
                        Pilih dari daftar teknisi...
                      </option>
                      {technicians.map((tech) => (
                        <option key={tech.id} value={tech.id}>
                          {tech.name} —{" "}
                          {tech.activeTaskCount !== undefined
                            ? tech.activeTaskCount === 0
                              ? "Tersedia (0 tugas)"
                              : `${tech.activeTaskCount} tugas aktif`
                            : tech.email}
                        </option>
                      ))}
                    </select>
                  )}
                  <p className="text-[12px] text-[#64748B] mt-1">
                    Beban kerja teknisi ditampilkan untuk membantu pemerataan penugasan.
                  </p>
                </div>

                <div>
                  <label
                    htmlFor={`notes-tech-${ticketId}`}
                    className="block text-[14px] font-semibold text-[#0F172A] mb-1.5"
                  >
                    Catatan / Instruksi Kerja (Opsional)
                  </label>
                  <textarea
                    id={`notes-tech-${ticketId}`}
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Contoh: Bawa kabel drop core 25 meter dan periksa ODP tiang nomer 3 di seberang gerbang..."
                    className="w-full px-3.5 py-2.5 rounded-[8px] border border-[#94A3B8] bg-white text-[14px] text-[#0F172A] placeholder:text-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]"
                  />
                  <p className="text-[12px] text-[#64748B] mt-1">
                    Instruksi ini akan langsung muncul di kartu tugas teknisi terkait.
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E2E8F0]">
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
                    disabled={!selectedTechId || technicians.length === 0}
                    className="h-[40px] px-5 font-semibold"
                  >
                    {isReassign ? "Simpan Perubahan Teknisi" : "Konfirmasi Penugasan"}
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
