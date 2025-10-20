// src/app/layout.tsx
import SessionProviderWrapper from "@/components/SessionProviderWrapper"; // 🟢 client wrapper
import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

/* ----------------------------- Fonts ----------------------------- */
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/* ----------------------------- Metadata ----------------------------- */
export const metadata: Metadata = {
  metadataBase: new URL("http://localhost:3000"),
  title: "Iris Arc",
  description:
    "Iris Arc — Incident Response Intelligence System · Adaptive Response Core",
  icons: {
    icon: "/IrisArc-logo.ico",
  },
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

/* ----------------------------- Root Layout ----------------------------- */
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Explicit favicon fallback */}
        <link rel="icon" href="/IrisArc-logo.ico" sizes="any" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-dvh`}
      >
        {/* ✅ All client contexts go inside this wrapper */}
        <SessionProviderWrapper>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            {children}
            <Toaster richColors closeButton position="bottom-center" />
          </ThemeProvider>
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
