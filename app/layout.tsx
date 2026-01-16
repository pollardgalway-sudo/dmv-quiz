import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ActivationGate from "@/components/ActivationGate";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "2026加州驾照笔试 - 刷题网站",
  description: "基于2026版加州DMV官方驾驶员手册的刷题平台，涵盖扫盲模式、专项突破、易错精选等核心模块",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ActivationGate>
          {children}
        </ActivationGate>
      </body>
    </html>
  );
}
