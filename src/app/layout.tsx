import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SessionProvider } from "@/components/layout/session-provider";
import { RouteProgress } from "@/components/layout/route-progress";
import { ToastProvider } from "@/hooks/use-toast";
import "./globals.css";
import "nprogress/nprogress.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SportBook - Booking Lapangan Olahraga",
  description:
    "Platform booking lapangan olahraga. Cari lapangan, pilih jadwal, dan lakukan booking dalam beberapa langkah.",
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
      <body className="min-h-full flex flex-col">
        <SessionProvider>
          <ToastProvider>
            <RouteProgress />
            {children}
          </ToastProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
