// ❌ No "use client" here — layouts must stay server components

import ProvidersShell from "@/components/ProvidersShell"; // 🟢 new wrapper (client)
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  metadataBase: new URL("http://localhost:3000"),
  title: "Iris Arc",
  description:
    "Iris Arc — Incident Response Intelligence System · Adaptive Response Core",
  icons: { icon: "/IrisArc-logo.ico" },
  openGraph: {
    title: "Iris Arc",
    description: "Adaptive cybersecurity copilot powered by Next.js + FastAPI.",
    images: ["/IrisArc-logo.ico"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Iris Arc",
    description:
      "Incident Response Intelligence System · Adaptive Response Core",
    images: ["/IrisArc-logo.ico"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/IrisArc-logo.ico" sizes="any" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-dvh`}
      >
        {/* ✅ All client-side providers live in this shell */}
        <ProvidersShell>{children}</ProvidersShell>
      </body>
    </html>
  );
}
