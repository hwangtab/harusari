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

// Viewport configuration (separate from metadata in Next.js 15+)
export const viewport = {
  width: 'device-width',
  initialScale: 1.0,
  maximumScale: 1.0,
  userScalable: false,
  themeColor: '#F5F3E7'
};

export const metadata: Metadata = {
  metadataBase: new URL('https://harusali.vercel.app'),
  title: "하루살이 프로젝트 2: 알 수 없는 느낌",
  description: "하루살이 프로젝트의 실험적 로파이 데뷔앨범 '알 수 없는 느낌' - 의도된 불완전함과 DIY 정신이 담긴 13곡의 인디 사운드를 90년대 데스크톱 인터페이스로 경험하는 인터랙티브 음악 아카이브",
  keywords: [
    // 프로젝트명
    "하루살이", "하루살이 프로젝트", "Harusali Project",
    
    // 앨범 정보
    "알 수 없는 느낌", "Unknown Feeling", "데뷔앨범", "2025년 앨범",
    
    // 음악 장르/스타일
    "실험음악", "experimental music", "로파이", "lo-fi", "lofi",
    "인디음악", "indie music", "DIY 음악", "홈레코딩",
    "앰비언트", "ambient", "아방가르드", "avant-garde",
    "개러지밴드", "GarageBand", "노이즈", "소음음악",
    
    // 미학/컨셉
    "불완전함의 미학", "의도된 불완전함", "완벽하지 않은",
    "깨진 사운드", "날것의", "조악함", "투박한",
    
    // 인터랙티브/디지털아트
    "90년대", "레트로", "인터랙티브", "웹아트", "디지털아트",
    "데스크톱 인터페이스", "Windows 98", "터미널",
    
    // 한국 음악 씬
    "한국 인디", "Korean indie", "한국 실험음악", 
    "Korean experimental", "K-indie", "언더그라운드"
  ],
  authors: [{ name: "Harusali Project" }],
  creator: "Harusali Project",
  robots: "index, follow",
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: "https://harusali.vercel.app",
    siteName: "하루살이 프로젝트 2: 알 수 없는 느낌",
    title: "하루살이 프로젝트 2: 알 수 없는 느낌",
    description: "실험적 로파이 인디 앨범 '알 수 없는 느낌' - 의도된 불완전함과 DIY 정신이 담긴 13곡을 90년대 데스크톱에서 경험하는 인터랙티브 아카이브",
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
    description: "실험적 로파이 인디 앨범 - 의도된 불완전함과 DIY 정신이 담긴 13곡을 90년대 데스크톱에서 경험",
    images: ["/images/album/album_front.png"],
  },
  other: {
    "mobile-web-app-capable": "yes", // apple-mobile-web-app-capable 대체
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
