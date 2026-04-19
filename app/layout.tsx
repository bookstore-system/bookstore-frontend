import type React from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Nhà Sách Online",
  description:
    "Nhà sách online hàng đầu Việt Nam. Mua sách, truyện, tạp chí với giá tốt nhất. Giao hàng nhanh, dịch vụ tốt.",
  generator: "v0.app",
  icons: {
    icon: [
      { url: "/logo_not_found.png", type: "image/png" },
      { url: "/logo_not_found.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/logo_not_found.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: [{ url: "/logo_not_found.png" }],
  },
  openGraph: {
    title: "Not Found - Nhà Sách Online",
    description: "Nhà sách online hàng đầu Việt Nam",
    images: ["/logo_not_found.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <head>
        <script src="https://cdn.ckbox.io/ckbox/2.9.2/ckbox.js" crossOrigin="anonymous"></script>
        <script src="https://cdn.ckbox.io/ckbox/2.9.2/translations/vi.js" crossOrigin="anonymous"></script>
      </head>
      <body className={`font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
