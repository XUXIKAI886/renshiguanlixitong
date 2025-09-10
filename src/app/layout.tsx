import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { MainLayout } from "@/components/layout";
import { Toaster } from "sonner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "呈尚策划人事管理系统",
  description: "中小企业HR一体化管理平台，提升招聘效率，激励员工积极性，数据化人力资源管理",
  keywords: ["人事管理", "HR系统", "招聘管理", "员工管理", "积分系统"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className={`${inter.variable} font-sans antialiased`}>
        <MainLayout>
          {children}
        </MainLayout>
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
