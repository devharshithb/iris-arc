// src/app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { ThemeProvider } from "next-themes";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Iris Arc",
  description: "Iris Arc — Incident Response Intelligence System · Adaptive Response Core",
  icons: {
    icon: "/IrisArc-logo.ico", // favicon / tab icon
  },
  openGraph: {
    title: "Iris Arc",
    description: "Adaptive cybersecurity copilot powered by Next.js + FastAPI.",
    images: ["/IrisArc-logo.ico"],
  },
  twitter: {
    card: "summary",
    title: "Iris Arc",
    description: "Incident Response Intelligence System · Adaptive Response Core",
    images: ["/IrisArc-logo.ico"],
  },
};

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
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
          <Toaster richColors closeButton position="bottom-center" />
        </ThemeProvider>
      </body>
    </html>
  );
}
