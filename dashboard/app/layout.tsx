import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import Link from "next/link";
import { AppSessionProvider } from "@/components/session-provider";
import "./globals.css";

const sans = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const mono = JetBrains_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Living Face Dashboard",
  description: "License management and monetization dashboard for the Living Face widget.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${sans.variable} ${mono.variable} h-full antialiased`}
    >
      <body className="app-gradient min-h-full flex flex-col text-slate-100">
        <AppSessionProvider>
          <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/35 backdrop-blur-xl">
            <nav className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3">
              <Link href="/" className="font-semibold text-indigo-300">
                Living Face
              </Link>
              <div className="flex items-center gap-4 text-sm">
                <Link href="/pricing" className="text-slate-300 hover:text-white">
                  Pricing
                </Link>
                <Link href="/dashboard" className="text-slate-300 hover:text-white">
                  Dashboard
                </Link>
                <Link href="/dashboard/analytics" className="text-slate-300 hover:text-white">
                  Analytics
                </Link>
                <Link href="/login" className="text-slate-300 hover:text-white">
                  Login
                </Link>
              </div>
            </nav>
          </header>
          {children}
        </AppSessionProvider>
      </body>
    </html>
  );
}
