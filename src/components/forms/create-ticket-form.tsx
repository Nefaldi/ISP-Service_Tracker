"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createTicket, uploadPhotoAction } from "@/actions/ticket.actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Priority } from "@prisma/client";
import { UploadCloud, CheckCircle2, AlertCircle, X } from "lucide-react";

export function CreateTicketForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Gangguan Jaringan Fiber");
  const [priority, setPriority] = useState<Priority>("MEDIUM");
  const [description, setDescription] = useState("");
  const [damagePhotoUrl, setDamagePhotoUrl] = useState("");
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStatusMessage(null);

    let finalPhotoUrl = damagePhotoUrl;

    if (fileToUpload) {
      try {
        const uploadData = new FormData();
        uploadData.append("file", fileToUpload);
        uploadData.append("folder", "damages");

        const uploadRes = await uploadPhotoAction(uploadData);
        if (uploadRes.success && uploadRes.publicUrl) {
          finalPhotoUrl = uploadRes.publicUrl;
        } else {
          console.warn("Upload foto gagal, melanjutkan tanpa foto:", uploadRes.error);
        }
      } catch (err) {
        console.warn("Upload exception:", err);
      }
    }

    const res = await createTicket({
      title,
      category,
      priority,
      description,
      damagePhotoUrl: finalPhotoUrl || undefined,
    });

    setIsLoading(false);

    if (res.success && res.data) {
      setStatusMessage({
        type: "success",
        text: `Tiket #${res.data.ticketNumber} berhasil dibuat! Notifikasi telah dipancarkan.`,
      });
      setTitle("");
      setDescription("");
      setDamagePhotoUrl("");
      setFileToUpload(null);
      router.refresh();
    } else {
      setStatusMessage({
        type: "error",
        text: res.error || "Gagal membuat tiket.",
      });
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-[18px]">Buat Laporan Gangguan Baru</CardTitle>
        <CardDescription className="text-[14px]">
          Sampaikan keluhan jaringan atau kendala teknis untuk segera ditangani tim teknisi.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {statusMessage && (
          <div
            className={`mb-4 flex items-center gap-2.5 p-3.5 text-[14px] rounded-[8px] border ${
              statusMessage.type === "success"
                ? "bg-[#D1FAE5] text-[#065F46] border-[#A7F3D0]"
                : "bg-[#FEF2F2] text-[#991B1B] border-[#FCA5A5]"
            }`}
          >
            {statusMessage.type === "success" ? (
              <CheckCircle2 className="h-5 w-5 shrink-0 text-[#047857]" />
            ) : (
              <AlertCircle className="h-5 w-5 shrink-0 text-[#DC2626]" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="ticket-title"
              className="block text-[14px] font-medium text-[#0F172A] mb-1.5"
            >
              Judul Masalah
            </label>
            <input
              id="ticket-title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Lampu indikator LOS merah / koneksi terputus"
              className="w-full h-[48px] px-3.5 py-2.5 rounded-[8px] border border-[#94A3B8] bg-white text-[15px] text-[#0F172A] placeholder:text-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="ticket-category"
                className="block text-[14px] font-medium text-[#0F172A] mb-1.5"
              >
                Kategori Layanan
              </label>
              <select
                id="ticket-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full h-[48px] px-3.5 py-2 rounded-[8px] border border-[#94A3B8] bg-white text-[14px] text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]"
              >
                <option value="Gangguan Jaringan Fiber">Gangguan Jaringan Fiber</option>
                <option value="Perangkat Modem / Router">Perangkat Modem / Router</option>
                <option value="Kecepatan Lambat (Bandwidth)">Kecepatan Lambat (Bandwidth)</option>
                <option value="Kabel Putus / Fisik">Kabel Putus / Fisik</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="ticket-priority"
                className="block text-[14px] font-medium text-[#0F172A] mb-1.5"
              >
                Tingkat Urgensi (Prioritas)
              </label>
              <select
                id="ticket-priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full h-[48px] px-3.5 py-2 rounded-[8px] border border-[#94A3B8] bg-white text-[14px] text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]"
              >
                <option value="LOW">Low (Normal - 24 Jam)</option>
                <option value="MEDIUM">Medium (Standar - 8 Jam)</option>
                <option value="HIGH">High (Penting - 4 Jam)</option>
                <option value="CRITICAL">Critical (Mendesak - 2 Jam)</option>
              </select>
            </div>
          </div>

          <div>
            <label
              htmlFor="ticket-desc"
              className="block text-[14px] font-medium text-[#0F172A] mb-1.5"
            >
              Deskripsi Gangguan
            </label>
            <textarea
              id="ticket-desc"
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Jelaskan detail kendala yang dialami, sejak kapan, dan alamat titik lokasi secara spesifik..."
              className="w-full px-3.5 py-2.5 rounded-[8px] border border-[#94A3B8] bg-white text-[15px] text-[#0F172A] placeholder:text-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]"
            />
          </div>

          {/* Area drop/ambil foto kerusakan (border putus-putus 2px) */}
          <div>
            <label
              htmlFor="ticket-photo"
              className="block text-[14px] font-medium text-[#0F172A] mb-1.5"
            >
              Foto Bukti Kerusakan (Opsional)
            </label>

            <div className="relative border-2 border-dashed border-[#94A3B8] rounded-[8px] p-5 text-center hover:border-[#1D4ED8] transition-colors bg-[#F8FAFC]">
              <input
                id="ticket-photo"
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
                <div className="flex items-center justify-center gap-2 text-[14px] font-medium text-[#1D4ED8]">
                  <span>Foto terpilih: {fileToUpload.name}</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFileToUpload(null);
                    }}
                    className="p-1 hover:bg-[#EFF6FF] rounded-full text-[#DC2626]"
                    aria-label="Hapus file terpilih"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center pointer-events-none">
                  <UploadCloud className="h-7 w-7 text-[#64748B] mb-1.5" />
                  <p className="text-[14px] font-medium text-[#0F172A]">
                    Klik atau tarik foto ke sini untuk mengunggah
                  </p>
                  <p className="text-[12px] text-[#64748B] mt-0.5">
                    Format PNG, JPG, atau WebP (maks. 10MB)
                  </p>
                </div>
              )}
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full h-[48px] text-[15px]"
            isLoading={isLoading}
          >
            Kirim Laporan Gangguan
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
