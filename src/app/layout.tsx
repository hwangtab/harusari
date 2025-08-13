import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "하루살이 프로젝트 2: 알 수 없는 느낌",
  description: "Interactive album archive website for Harusari Project - 90년대 컴퓨터 환경에서 탐험하는 인터랙티브 앨범 아카이브",
  keywords: ["하루살이", "음악", "앨범", "인터랙티브", "90년대", "레트로", "아트", "김지혜", "Harusari Project"],
  authors: [{ name: "김지혜 (Harusari Project)" }],
  creator: "김지혜 (Harusari Project)",
  robots: "index, follow",
  viewport: {
    width: 'device-width',
    initialScale: 1.0,
    maximumScale: 1.0,
    userScalable: false,
  },
  themeColor: "#F5F3E7",
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: "https://harusari.vercel.app",
    siteName: "하루살이 프로젝트 2: 알 수 없는 느낌",
    title: "하루살이 프로젝트 2: 알 수 없는 느낌",
    description: "90년대 컴퓨터 환경에서 탐험하는 인터랙티브 앨범 아카이브 - 음악, 이미지, 크레용 그리기까지",
    images: [
      {
        url: "/images/album/album_front.png",
        width: 800,
        height: 800,
        alt: "하루살이 프로젝트 2 앨범 커버",
      },
      {
        url: "/images/album/background.png", 
        width: 800,
        height: 800,
        alt: "하루살이 프로젝트 2 배경 아트워크",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "하루살이 프로젝트 2: 알 수 없는 느낌",
    description: "90년대 컴퓨터 환경에서 탐험하는 인터랙티브 앨범 아카이브",
    images: ["/images/album/album_front.png"],
    creator: "@9_17_p_m",
  },
  other: {
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "apple-mobile-web-app-title": "하루살이 프로젝트 2",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
