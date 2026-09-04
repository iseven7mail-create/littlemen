import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://shaofu-tuishan.i-seven7mail.chatgpt.site"),
  title: "元辰小人宮",
  description: "把姓名、暱稱與職位或關係寫上黃符紙小人，完成情緒退散儀式並生成可分享、列印的退散符。",
  openGraph: {
    title: "元辰小人宮",
    description: "寫下姓名、暱稱與職位／關係，勒令煩惱退散。",
    url: "/",
    siteName: "元辰小人宮",
    locale: "zh_TW",
    type: "website",
    images: [{ url: "/og.png", width: 1680, height: 945, alt: "元辰小人宮・寫下煩惱，勒令退散" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "元辰小人宮",
    description: "寫下姓名、暱稱與職位／關係，勒令煩惱退散。",
    images: ["/og.png"],
  },
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
