import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "인테리어 견적 웹앱 MVP",
  description: "아파트/오피스텔 인테리어 견적 MVP",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}