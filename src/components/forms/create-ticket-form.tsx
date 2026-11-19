"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createTicket, uploadPhotoAction } from "@/actions/ticket.actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Priority } from "@prisma/client";
import { UploadCloud, CheckCircle2, AlertCircle, X, PlusCircle } from "lucide-react";

export function CreateTicketForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Gangguan Jaringan Fiber");
  const [priority, setPriority] = useState<Priority>("MEDIUM");
  const [description, setDescription] = useState("");
  const [damagePhotoUrl, setDamagePhotoUrl] = useState("");
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [createdTicket, setCreatedTicket] = useState<{
    id: string;
    ticketNumber: string;
    title: string;
  } | null>(null);

  const handleReset = () => {
    setTitle("");
    setCategory("Gangguan Jaringan Fiber");
    setPriority("MEDIUM");
    setDescription("");
    setDamagePhotoUrl("");
    setFileToUpload(null);
    setErrorMessage(null);
    setCreatedTicket(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

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
      setCreatedTicket({
        id: res.data.id,
        ticketNumber: res.data.ticketNumber,
        title: res.data.title,
      });
      setTitle("");
      setDescription("");
      setDamagePhotoUrl("");
      setFileToUpload(null);
      router.refresh();
    } else {
      setErrorMessage(res.error || "Gagal membuat tiket.");
    }
  };

  if (createdTicket) {
    return (
      <Card className="w-full border-[#BFDBFE] bg-[#EFF6FF]">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto w-12 h-12 rounded-full bg-[#DBEAFE] text-[#2563EB] flex items-center justify-center mb-2">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <CardTitle className="text-[20px] text-[#1D4ED8]">
            Laporan Berhasil Terkirim
          </CardTitle>
          <CardDescription className="text-[14px] text-[#1E40AF]">
            Tiket Anda telah tercatat di sistem Helpdesk dan sedang menunggu penugasan teknisi lapangan.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-2">
          <div className="p-4 rounded-[10px] bg-white border border-[#BFDBFE] space-y-1.5 text-center">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
              Nomor Tiket Anda
            </span>
            <div className="font-mono text-lg font-bold text-[#1D4ED8]">
              #{createdTicket.ticketNumber}
            </div>
            <p className="text-[13px] text-[#0F172A] line-clamp-1 font-medium">
              {createdTicket.title}
            </p>
          </div>

          <div className="space-y-2">
            <Link
              href={`/customer/track/${createdTicket.id}`}
              className="w-full h-[46px] rounded-[8px] bg-[#1D4ED8] hover:bg-[#1E40AF] text-white text-[14px] font-semibold flex items-center justify-center shadow-xs transition-colors"
            >
              <span>Pantau Status Tiket (Live Tracker)</span>
            </Link>

            <Button
              type="button"
              variant="outline"
              onClick={handleReset}
              className="w-full h-[44px] text-[14px] border-[#CBD5E1] text-[#0F172A] hover:bg-white flex items-center justify-center gap-2"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Buat Laporan Gangguan Baru</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-[18px]">Buat Laporan Gangguan Baru</CardTitle>
        <CardDescription className="text-[14px]">
          Sampaikan keluhan jaringan atau kendala teknis untuk segera ditangani tim teknisi.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {errorMessage && (
          <div className="mb-4 flex items-center gap-2.5 p-3.5 text-[14px] rounded-[8px] border bg-[#FEF2F2] text-[#991B1B] border-[#FCA5A5]">
            <AlertCircle className="h-5 w-5 shrink-0 text-[#DC2626]" />
            <span>{errorMessage}</span>
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
                <option value="Kecepatan Lambat (Bandwidth)">Kecepatan Lambat</option>
                <option value="Kabel Putus / Fisik">Kabel Putus / Fisik</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="ticket-priority"
                className="block text-[14px] font-medium text-[#0F172A] mb-1.5"
              >
                Tingkat Urgensi
              </label>
              <select
                id="ticket-priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full h-[48px] px-3.5 py-2 rounded-[8px] border border-[#94A3B8] bg-white text-[14px] text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]"
              >
                <option value="LOW">Low - Normal 24 Jam</option>
                <option value="MEDIUM">Medium - Standar 8 Jam</option>
                <option value="HIGH">High - Penting 4 Jam</option>
                <option value="CRITICAL">Critical - Mendesak 2 Jam</option>
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
              Foto Bukti Kerusakan
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
                    Format PNG, JPG, atau WebP maksimal 10MB
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
