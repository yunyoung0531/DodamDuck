import { Suspense } from 'react';
import type { Metadata } from 'next';
import { Gugi } from 'next/font/google';
import localFont from 'next/font/local';
import { Providers } from '@/providers/Providers';
import { NavbarWithAuth } from '@/components/common/NavbarWithAuth';
import { NavbarSkeleton } from '@/components/common/NavbarSkeleton';
import { Toaster } from '@/components/ui/sonner';
import './globals.css';

// 폰트는 굵기당 두 벌로 나뉘어 있다. 상용(KS X 1001 2,350자)은 preload 하고,
// 확장(나머지 8,822자)은 하지 않는다. 브라우저는 상용 파일에 없는 글자를
// 실제로 그려야 할 때만 확장 파일을 받으므로, "똠" 같은 표외 음절을 버리지
// 않으면서 첫 화면 비용은 상용분(굵기당 약 90KB)만 낸다.
// 재생성은 scripts/subset-fonts.sh 참고.
//
// 대체 폰트 목록은 여기 두지 않고 globals.css 의 --font-sans 에서 이어붙인다.
// next/font 는 굵기·분할별로 변수를 따로 내주는데, 각 변수에 fallback 을 주면
// 시스템 고딕이 확장 파일보다 앞에 끼어들어 표외 음절이 시스템 폰트로 떨어진다.
// 스택 전체가 한 줄에 보이는 편이 순서를 확인하기도 쉽다.
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

// Gugi 는 랜딩 하단의 "도담덕" 세 글자에만 쓰인다.
// subsets 에 'latin' 만 적었지만 Google 은 Gugi 를 unicode-range 로 쪼갠 87개
// @font-face 로 내려주고 subset 파라미터를 무시한다. 그래서 한글 글리프도 함께
// 들어오고, 브라우저는 실제로 필요한 조각만 받는다.
// 그 세 글자 때문에 첫 화면 대역폭을 쓸 이유는 없으므로 preload 는 끈다.
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