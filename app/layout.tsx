import type { Metadata } from "next";
import { Nanum_Gothic_Coding } from "next/font/google";
import "./globals.css";

const nanumCoding = Nanum_Gothic_Coding({
  weight: ["400", "700"],
  subsets: ["latin"],
  display: "swap",
});

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
      <body className={`${nanumCoding.className} min-h-screen font-coding`}>
        {children}
      </body>
    </html>
  );
}
