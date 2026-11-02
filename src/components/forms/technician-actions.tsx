"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { startProgress, resolveTicket, uploadPhotoAction } from "@/actions/ticket.actions";
import { Button } from "@/components/ui/button";
import { Play, CheckCircle, UploadCloud } from "lucide-react";

interface TechnicianActionsProps {
  ticketId: string;
  status: string;
}

export function TechnicianActions({ ticketId, status }: TechnicianActionsProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [resolvedPhotoUrl, setResolvedPhotoUrl] = useState("");
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

    let finalPhotoUrl = resolvedPhotoUrl;

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
    <div>
      {status === "ASSIGNED" && (
        <Button
          size="sm"
          variant="primary"
          onClick={handleStart}
          isLoading={isLoading}
          className="gap-1.5"
        >
          <Play className="h-4 w-4 fill-current" />
          <span>Mulai Pengerjaan</span>
        </Button>
      )}

      {status === "IN_PROGRESS" && (
        <>
          <Button
            size="sm"
            variant="primary"
            onClick={() => setShowResolveModal(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
          >
            <CheckCircle className="h-4 w-4" />
            <span>Selesaikan Tiket</span>
          </Button>

          {showResolveModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
              <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-2">
                  Konfirmasi Penyelesaian Masalah
                </h3>
                <p className="text-xs text-zinc-500 mb-4">
                  Laporkan tindakan perbaikan dan unggah foto hasil kerja teknis.
                </p>

                <form onSubmit={handleResolve} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1">
                      Catatan Teknis Perbaikan
                    </label>
                    <textarea
                      required
                      rows={3}
                      placeholder="Contoh: Penggantian konektor FO dan konfigurasi ulang ONT modem"
                      value={resolutionNotes}
                      onChange={(e) => setResolutionNotes(e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1">
                      Unggah Foto Bukti Hasil Kerja (Supabase Storage / Cloud)
                    </label>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <label className="flex items-center gap-1.5 px-3 py-1.5 border border-dashed border-zinc-300 dark:border-zinc-700 rounded-lg cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800 text-xs font-medium text-zinc-600 dark:text-zinc-300">
                          <UploadCloud className="h-4 w-4" />
                          <span>Pilih Foto Bukti</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              if (e.target.files?.[0]) {
                                setFileToUpload(e.target.files[0]);
                              }
                            }}
                          />
                        </label>
                        <span className="text-xs text-zinc-500 truncate max-w-[200px]">
                          {fileToUpload ? fileToUpload.name : "Belum ada file dipilih"}
                        </span>
                      </div>
                      <input
                        type="url"
                        placeholder="Atau tempel URL gambar eksternal (https://...)"
                        value={resolvedPhotoUrl}
                        onChange={(e) => setResolvedPhotoUrl(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 focus:ring-2 focus:ring-emerald-500 outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowResolveModal(false)}
                      disabled={isLoading}
                    >
                      Batal
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      size="sm"
                      isLoading={isLoading}
                      className="bg-emerald-600 hover:bg-emerald-700"
                    >
                      Simpan & Selesaikan
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </>
      )}

      {status === "RESOLVED" && (
        <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
          Menunggu Verifikasi Pelanggan
        </span>
      )}

      {status === "CLOSED" && (
        <span className="text-xs text-zinc-500 font-medium">Selesai & Ditutup</span>
      )}
    </div>
  );
}
