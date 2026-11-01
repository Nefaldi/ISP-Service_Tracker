"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createTicket, requestPresignedUpload } from "@/actions/ticket.actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Priority } from "@prisma/client";
import { UploadCloud, CheckCircle2, AlertCircle } from "lucide-react";

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

    // If customer selected a file, demonstrate Presigned S3 upload flow
    if (fileToUpload) {
      try {
        const presignedRes = await requestPresignedUpload(
          fileToUpload.name,
          fileToUpload.type,
          "damages"
        );

        if (presignedRes.success && presignedRes.data) {
          // In production, we upload directly to S3 via PUT presignedRes.data.uploadUrl
          // If S3 bucket credentials are mocked/dummy in dev, we use publicUrl
          finalPhotoUrl = presignedRes.data.publicUrl;
        }
      } catch (err) {
        console.warn("Presigned upload warning (using standard flow):", err);
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
        <CardTitle>Buat Laporan Gangguan Baru</CardTitle>
        <CardDescription>
          Formulir pelaporan gangguan layanan berbasis Next.js Server Action
        </CardDescription>
      </CardHeader>
      <CardContent>
        {statusMessage && (
          <div
            className={`mb-4 flex items-center gap-2 p-3 text-sm rounded-lg border ${
              statusMessage.type === "success"
                ? "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900"
                : "bg-red-50 text-red-800 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-900"
            }`}
          >
            {statusMessage.type === "success" ? (
              <CheckCircle2 className="h-5 w-5 shrink-0" />
            ) : (
              <AlertCircle className="h-5 w-5 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1">
                Kategori Masalah
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2 rounded-lg border border-zinc-300 bg-white text-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              >
                <option value="Gangguan Jaringan Fiber">Gangguan Jaringan Fiber</option>
                <option value="Masalah Router / WiFi">Masalah Router / WiFi</option>
                <option value="Penurunan Bandwidth / Latensi">Penurunan Bandwidth / Latensi</option>
                <option value="Perangkat Keras Rusak">Perangkat Keras Rusak</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1">
                Prioritas
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full px-3.5 py-2 rounded-lg border border-zinc-300 bg-white text-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              >
                <option value="LOW">Rendah (Low)</option>
                <option value="MEDIUM">Sedang (Medium)</option>
                <option value="HIGH">Tinggi (High)</option>
                <option value="CRITICAL">Kritis (Critical)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1">
              Judul Masalah
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Lampu indikator LOS merah berkedip"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2 rounded-lg border border-zinc-300 bg-white text-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1">
              Deskripsi Detail Kerusakan
            </label>
            <textarea
              required
              rows={3}
              placeholder="Jelaskan secara rinci kendala yang Anda alami..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 rounded-lg border border-zinc-300 bg-white text-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1">
              Unggah Foto Bukti Kerusakan (AWS S3 Presigned URL)
            </label>
            <div className="flex items-center gap-3">
              <label className="flex items-center justify-center gap-2 px-4 py-2 border border-dashed border-zinc-300 rounded-lg cursor-pointer hover:bg-zinc-50 text-xs font-medium text-zinc-600 dark:border-zinc-700 dark:hover:bg-zinc-900 dark:text-zinc-300">
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
              <span className="text-xs text-zinc-500 truncate">
                {fileToUpload ? fileToUpload.name : "Belum ada file dipilih"}
              </span>
            </div>
          </div>

          <Button type="submit" isLoading={isLoading} className="w-full sm:w-auto">
            Kirimkan Laporan Tiket
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
