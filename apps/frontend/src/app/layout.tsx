import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import RootLayoutClient from "./RootLayoutClient";
import Navbar from "@/components/navbar/Navbar";
import Breadcrumbs from "@/components/Breadcrumbs";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Meeting Minutes",
  description:
    "Meeting minutes management system for tracking discussions, open issues, updates and notes from meetings",
  generator: "Next.js",
  manifest: "/manifest.json",
  keywords: ["nextjs", "next14", "pwa", "next-pwa"],
  viewport:
    "minimum-scale=1, initial-scale=1, width=device-width, shrink-to-fit=no, viewport-fit=cover",
  icons: [
    { rel: "apple-touch-icon", url: "pwa-icons/logo-128.png" },
    { rel: "icon", url: "pwa-icons/logo-128.png" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} antialiased  min-h-full flex flex-col bg-gray-50`}
      >
        <Navbar />
        <div className="flex-1 flex flex-col pt-16">
          <header className="bg-white border-b border-gray-200">
            <div className="w-full px-3 sm:px-2 lg:px-8 py-4">
              <Breadcrumbs />
            </div>
          </header>
          <main className="flex-1 bg-gradient-to-b from-white to-gray-50">
            <div className="w-full">
              <RootLayoutClient>{children}</RootLayoutClient>
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
