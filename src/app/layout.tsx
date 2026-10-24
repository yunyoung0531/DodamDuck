import { Suspense } from 'react';
import type { Metadata } from 'next';
import { Gugi } from 'next/font/google';
import localFont from 'next/font/local';
import { Providers } from '@/providers/Providers';
import { NavbarWithAuth } from '@/components/common/NavbarWithAuth';
import { NavbarSkeleton } from '@/components/common/NavbarSkeleton';
import { Toaster } from '@/components/ui/sonner';
import './globals.css';

/**
 * 굵기마다 상용(preload)과 확장 두 벌입니다. 대체 폰트는 globals.css의 `--font-sans`에서 확장 파일 뒤에 이어 붙이므로, 여기서 `fallback`을 주면 표외 음절이 시스템 폰트로 떨어집니다.
 * @see docs/font-loading.md
 */
const omniGothic = localFont({
  src: '../fonts/omni-gothic-035.woff2',
  weight: '400',
  display: 'swap',
  variable: '--font-omni-035',
});

const omniGothicExt = localFont({
  src: '../fonts/omni-gothic-035-ext.woff2',
  weight: '400',
  display: 'swap',
  variable: '--font-omni-035-ext',
  preload: false,
  adjustFontFallback: false,
});

const omniGothicHeading = localFont({
  src: '../fonts/omni-gothic-045.woff2',
  weight: '400',
  display: 'swap',
  variable: '--font-omni-045',
});

const omniGothicHeadingExt = localFont({
  src: '../fonts/omni-gothic-045-ext.woff2',
  weight: '400',
  display: 'swap',
  variable: '--font-omni-045-ext',
  preload: false,
  adjustFontFallback: false,
});

// Gugi는 랜딩 하단의 "도담덕" 세 글자에만 쓰인다.
// subsets에 'latin'만 적었지만 Google은 Gugi를 unicode-range로 쪼갠 87개
// @font-face로 내려주고 subset 파라미터를 무시한다. 그래서 한글 글리프도 함께
// 들어오고, 브라우저는 실제로 필요한 조각만 받는다.
// 그 세 글자 때문에 첫 화면 대역폭을 쓸 이유는 없으므로 preload는 끈다.
const gugi = Gugi({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-gugi-next',
  preload: false,
});

export const metadata: Metadata = {
  title: '도담덕 - 유아용품 교환 & 나눔 플랫폼',
  description:
    '어제의 장난감을 오늘의 행복으로. 유아용품 교환과 나눔을 위한 플랫폼입니다.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="ko"
      className={`${omniGothic.variable} ${omniGothicExt.variable} ${omniGothicHeading.variable} ${omniGothicHeadingExt.variable} ${gugi.variable}`}
    >
      <head />
      <body>
        <Providers>
          <Suspense fallback={<NavbarSkeleton />}>
            <NavbarWithAuth />
          </Suspense>
          <main className="pt-14">{children}</main>
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
