import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "JG實驗室",
  description: "你的專屬交易教練平台",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW">
      <body className="min-h-screen">
        {children}
      </body>
    </html>
  );
}
