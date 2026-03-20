import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "골목 꽁초판",
  description: "익명 메시지가 꽁초처럼 남는 골목 보드",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Nanum+Gothic+Coding:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen font-coding">{children}</body>
    </html>
  );
}
