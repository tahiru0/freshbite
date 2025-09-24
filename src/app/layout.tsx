import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import 'react-toastify/dist/ReactToastify.css';
import { ConditionalLayout } from "@/components/layout/ConditionalLayout";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FreshBite - Giao đồ ăn tươi ngon",
  description: "Ứng dụng giao đồ ăn FreshBite - Mang đến những bữa ăn tươi ngon, dinh dưỡng đến tận nhà. Salad tươi, combo healthy, thực phẩm organic.",
  keywords: "giao đồ ăn, FreshBite, thực phẩm tươi, salad, combo healthy, organic food delivery",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <ConditionalLayout>{children}</ConditionalLayout>
      </body>
    </html>
  );
}
