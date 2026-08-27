import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "少甫・小人退散所",
  description: "上傳照片、敲打符紙紙人，完成後生成可以分享與列印的情緒退散符。照片只在你的裝置內處理。",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-Hant">
      <body>{children}</body>
    </html>
  );
}
