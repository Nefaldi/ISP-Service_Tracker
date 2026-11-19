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
      <Card className="border-[#A7F3D0] bg-[#D1FAE5]/30">
        <CardContent className="pt-6 text-center">
          <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-[#D1FAE5] text-[#065F46]">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <h4 className="text-[18px] font-semibold text-[#065F46]">
            Tiket Telah Ditutup & Diverifikasi
          </h4>
          <p className="text-[14px] text-[#475569] mt-1">
            Terima kasih telah memberikan ulasan. Layanan Anda kini telah terselesaikan.
          </p>
          <div className="flex justify-center gap-1.5 mt-3">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                className={`h-5 w-5 ${
                  s <= (existingRating || rating)
                    ? "text-[#F59E0B] fill-[#F59E0B]"
                    : "text-[#CBD5E1]"
                }`}
              />
            ))}
          </div>
          {(existingComment || comment) && (
            <p className="text-[14px] text-[#475569] italic mt-2.5">
              &quot;{existingComment || comment}&quot;
            </p>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-[#BFDBFE] bg-[#EFF6FF]/40">
      <CardHeader>
        <CardTitle className="text-[18px] text-[#1D4ED8]">
          Verifikasi Penyelesaian & Ulasan Kepuasan (CSAT)
        </CardTitle>
        <CardDescription className="text-[14px] text-[#475569]">
          Teknisi telah menyelesaikan perbaikan. Mohon periksa hasil kerja dan berikan penilaian kepuasan Anda untuk menutup tiket ini.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleCloseTicket} className="space-y-4">
          <div>
            <label className="block text-[14px] font-medium text-[#0F172A] mb-1.5">
              Tingkat Kepuasan Layanan
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  aria-label={`Beri ${star} bintang`}
                  className="p-1 text-[#CBD5E1] hover:text-[#F59E0B] transition-colors focus:outline-none"
                >
                  <Star
                    className={`h-7 w-7 ${
                      star <= rating
                        ? "text-[#F59E0B] fill-[#F59E0B]"
                        : "text-[#CBD5E1]"
                    }`}
                  />
                </button>
              ))}
              <span className="text-[14px] font-semibold text-[#0F172A] ml-2">
                {rating} / 5 Bintang
              </span>
            </div>
          </div>

          <div>
            <label
              htmlFor="review-comment"
              className="block text-[14px] font-medium text-[#0F172A] mb-1.5"
            >
              Ulasan / Masukan Tambahan
            </label>
            <textarea
              id="review-comment"
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Bagikan pengalaman penanganan gangguan oleh teknisi kami..."
              className="w-full px-3.5 py-2.5 rounded-[8px] border border-[#94A3B8] bg-white text-[15px] text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]"
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full h-[48px] text-[15px]"
            isLoading={isLoading}
          >
            Verifikasi Selesai & Kirim Ulasan
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
