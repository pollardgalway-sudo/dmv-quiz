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
  title: "加州CDL商业驾照考试 - 刷题网站",
  description: "基于2026版加州DMV官方商业驾驶员手册(CDL Handbook)的刷题平台，涵盖通用知识、气制动、组合车辆等核心考点",
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
