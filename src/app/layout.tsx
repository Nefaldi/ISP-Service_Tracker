import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { SSEListener } from "@/components/shared/sse-listener";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Service Tracker - Manajemen Tiket Helpdesk Berbasis Role",
  description:
    "Sistem Informasi Web Service Tracker dan Manajemen Tiket Helpdesk Berbasis Role (Unified Modern Monolith)",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#F6F7F9] text-[#0F172A] font-sans">
        <main className="flex-1 flex flex-col">{children}</main>
        <SSEListener />
      </body>
    </html>
  );
}
