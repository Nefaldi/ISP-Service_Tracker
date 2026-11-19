"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { startProgress, resolveTicket, uploadPhotoAction } from "@/actions/ticket.actions";
import { Button } from "@/components/ui/button";
import { Play, CheckCircle2, UploadCloud, X } from "lucide-react";

interface TechnicianActionsProps {
  ticketId: string;
  status: string;
  isFullCard?: boolean;
}

export function TechnicianActions({ ticketId, status }: TechnicianActionsProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);

  const handleStart = async () => {
    setIsLoading(true);
    const res = await startProgress(ticketId);
    setIsLoading(false);
    if (res.success) {
      router.refresh();
    } else {
      alert(res.error || "Gagal memulai tugas.");
    }
  };

  const handleResolve = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    let finalPhotoUrl = "";

    if (fileToUpload) {
      try {
        const uploadData = new FormData();
        uploadData.append("file", fileToUpload);
        uploadData.append("folder", "resolutions");

        const uploadRes = await uploadPhotoAction(uploadData);
        if (uploadRes.success && uploadRes.publicUrl) {
          finalPhotoUrl = uploadRes.publicUrl;
        } else {
          console.warn("Upload bukti gagal, lanjut simpan catatan:", uploadRes.error);
        }
      } catch (err) {
        console.warn("Upload exception:", err);
      }
    }

    const res = await resolveTicket({
      ticketId,
      resolutionNotes,
      resolvedPhotoUrl: finalPhotoUrl || undefined,
    });

    setIsLoading(false);
    if (res.success) {
      setShowResolveModal(false);
      setFileToUpload(null);
      router.refresh();
    } else {
      alert(res.error || "Gagal menyelesaikan tiket.");
    }
  };

  return (
    <div className="w-full">
      {status === "ASSIGNED" && (
        <Button
          type="button"
          variant="primary"
          size="mobile-action"
          onClick={handleStart}
          isLoading={isLoading}
          className="h-[52px] bg-[#1D4ED8] hover:bg-[#1E40AF] text-white font-semibold rounded-[10px] cursor-pointer"
        >
          <Play className="h-5 w-5 fill-current" />
          <span>Terima & Mulai Pengerjaan</span>
        </Button>
      )}

      {status === "IN_PROGRESS" && (
        <>
          <Button
            type="button"
            variant="primary"
            size="mobile-action"
            onClick={() => setShowResolveModal(true)}
            className="h-[52px] bg-[#1D4ED8] hover:bg-[#1E40AF] text-white font-semibold rounded-[10px] cursor-pointer"
          >
            <CheckCircle2 className="h-5 w-5" />
            <span>Selesaikan Tugas (Tandai Selesai)</span>
          </Button>

          {showResolveModal && (
            <div
              role="dialog"
              aria-modal="true"
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs"
            >
              <div className="w-full max-w-md rounded-[12px] bg-white border border-[#E2E8F0] p-6 shadow-2xl text-[#0F172A]">
                <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
                  <h3 className="text-[18px] font-semibold text-[#0F172A]">
                    Penyelesaian Tugas Lapangan
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowResolveModal(false)}
                    aria-label="Tutup dialog penyelesaian"
                    className="text-[#64748B] hover:text-[#0F172A]"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <form onSubmit={handleResolve} className="space-y-4 pt-4">
                  {/* Field Catatan teknis (textarea 88px, tanpa resize - UI_CONTEXT 4.4) */}
                  <div>
                    <label
                      htmlFor="tech-notes"
                      className="block text-[14px] font-medium text-[#0F172A] mb-1.5"
                    >
                      Catatan Tindakan Teknis
                    </label>
                    <textarea
                      id="tech-notes"
                      required
                      value={resolutionNotes}
                      onChange={(e) => setResolutionNotes(e.target.value)}
                      placeholder="Contoh: Penggantian drop core 15m dan konfigurasi ulang redaman optik ke -18 dBm..."
                      className="w-full h-[88px] resize-none px-3.5 py-2.5 rounded-[8px] border border-[#94A3B8] bg-white text-[14px] text-[#0F172A] placeholder:text-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                    />
                  </div>

                  {/* Area drop/ambil foto (border putus-putus 2px, tinggi 96px - UI_CONTEXT 4.4) */}
                  <div>
                    <label
                      htmlFor="tech-proof-photo"
                      className="block text-[14px] font-medium text-[#0F172A] mb-1.5"
                    >
                      Foto Bukti Hasil Kerja (Opsional)
                    </label>

                    <div className="relative h-[96px] border-2 border-dashed border-[#94A3B8] rounded-[8px] flex flex-col items-center justify-center text-center hover:border-[#2563EB] transition-colors bg-[#F8FAFC]">
                      <input
                        id="tech-proof-photo"
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files?.[0]) {
                            setFileToUpload(e.target.files[0]);
                          }
                        }}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />

                      {fileToUpload ? (
                        <div className="flex items-center gap-2 text-xs font-semibold text-[#2563EB] px-2">
                          <span className="truncate max-w-[240px]">{fileToUpload.name}</span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setFileToUpload(null);
                            }}
                            className="p-1 hover:bg-[#DBEAFE] rounded-full text-[#DC2626]"
                            aria-label="Hapus foto terpilih"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="pointer-events-none flex flex-col items-center">
                          <UploadCloud className="h-6 w-6 text-[#64748B] mb-1" />
                          <span className="text-[13px] font-medium text-[#0F172A]">
                            Ambil atau pilih foto bukti
                          </span>
                          <span className="text-[11px] text-[#64748B]">
                            Format JPG, PNG (maks. 10MB)
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Tombol aksi utama biru 52px */}
                  <div className="pt-2">
                    <Button
                      type="submit"
                      variant="primary"
                      size="mobile-action"
                      isLoading={isLoading}
                      className="h-[52px] bg-[#1D4ED8] hover:bg-[#1E40AF] text-white font-semibold rounded-[10px] cursor-pointer"
                    >
                      Konfirmasi & Selesaikan Tugas
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </>
      )}

      {status === "RESOLVED" && (
        <div className="h-[44px] flex items-center justify-center rounded-[8px] bg-[#EFF6FF] text-[#1D4ED8] text-[13px] font-semibold border border-[#BFDBFE]">
          Menunggu Verifikasi Pelanggan
        </div>
      )}

      {status === "CLOSED" && (
        <div className="h-[44px] flex items-center justify-center rounded-[8px] bg-[#F1F5F9] text-[#475569] text-[13px] font-semibold border border-[#E2E8F0]">
          Tiket Telah Selesai & Ditutup
        </div>
      )}
    </div>
  );
}
