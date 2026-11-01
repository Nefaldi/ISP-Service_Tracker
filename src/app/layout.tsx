import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SSEListener } from "@/components/shared/sse-listener";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Web Service Tracker & Helpdesk Management",
  description:
    "Sistem Informasi Web Service Tracker dan Manajemen Tiket Helpdesk Berbasis Role (Unified Modern Monolith)",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
        <main className="flex-1 flex flex-col">{children}</main>
        <SSEListener />
      </body>
    </html>
  );
}
