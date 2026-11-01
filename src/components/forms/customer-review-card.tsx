"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { closeTicketAndReview } from "@/actions/ticket.actions";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Star, CheckCircle2 } from "lucide-react";

interface CustomerReviewCardProps {
  ticketId: string;
  isClosed: boolean;
  existingRating?: number | null;
  existingComment?: string | null;
}

export function CustomerReviewCard({
  ticketId,
  isClosed,
  existingRating,
  existingComment,
}: CustomerReviewCardProps) {
  const router = useRouter();
  const [rating, setRating] = useState(existingRating || 5);
  const [comment, setComment] = useState(existingComment || "");
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  const handleCloseTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const res = await closeTicketAndReview({
      ticketId,
      rating,
      comment,
    });

    setIsLoading(false);
    if (res.success) {
      setSuccessMsg(true);
      router.refresh();
    } else {
      alert(res.error || "Gagal menutup tiket.");
    }
  };

  if (isClosed || successMsg) {
    return (
      <Card className="border-emerald-200 bg-emerald-50/50 dark:border-emerald-900 dark:bg-emerald-950/20">
        <CardContent className="pt-6 text-center">
          <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/60 dark:text-emerald-300">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <h4 className="font-semibold text-zinc-900 dark:text-zinc-100">
            Tiket Telah Ditutup & Diverifikasi
          </h4>
          <p className="text-xs text-zinc-500 mt-1">
            Terima kasih telah memberikan ulasan. Layanan Anda kini telah terselesaikan.
          </p>
          <div className="flex justify-center gap-1 mt-3">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                className={`h-5 w-5 ${
                  s <= (existingRating || rating)
                    ? "text-yellow-400 fill-yellow-400"
                    : "text-zinc-300"
                }`}
              />
            ))}
          </div>
          {(existingComment || comment) && (
            <p className="text-xs text-zinc-600 dark:text-zinc-400 italic mt-2">
              &quot;{existingComment || comment}&quot;
            </p>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-blue-200 bg-blue-50/30 dark:border-blue-900/50 dark:bg-blue-950/20">
      <CardHeader>
        <CardTitle className="text-base text-blue-900 dark:text-blue-300">
          Verifikasi Penyelesaian & Kepuasan Layanan (CSAT)
        </CardTitle>
        <CardDescription>
          Teknisi telah menyelesaikan perbaikan. Berikan rating kepuasan Anda untuk menutup tiket.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleCloseTicket} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
              Penilaian Kualitas Pengerjaan (1 - 5 Bintang)
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  className="p-1 rounded-md transition-transform hover:scale-110 focus:outline-none"
                >
                  <Star
                    className={`h-7 w-7 ${
                      star <= rating
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-zinc-300 hover:text-yellow-200"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Ulasan & Komentar Tambahan (Opsional)
            </label>
            <textarea
              rows={2}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Contoh: Teknisi datang tepat waktu dan koneksi kembali normal."
              className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            size="sm"
            isLoading={isLoading}
            className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700"
          >
            Tutup Tiket & Kirim Ulasan
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
