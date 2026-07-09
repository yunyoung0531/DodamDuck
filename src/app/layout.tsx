import { Suspense } from 'react';
import type { Metadata } from 'next';
import { Gugi } from 'next/font/google';
import { Providers } from '@/providers/Providers';
import { NavbarWithAuth } from '@/components/common/NavbarWithAuth';
import { NavbarSkeleton } from '@/components/common/NavbarSkeleton';
import { Toaster } from '@/components/ui/sonner';
import './globals.css';

const gugi = Gugi({ weight: '400', subsets: ['latin'], display: 'swap', variable: '--font-gugi-next' });

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
    <html lang="ko" className={gugi.variable}>
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