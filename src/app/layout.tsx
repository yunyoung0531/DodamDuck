import type { Metadata } from 'next';
import { Gugi } from 'next/font/google';
import { Providers } from '@/providers/Providers';
import { Navbar } from '@/components/common/Navbar';
import { Toaster } from '@/components/ui/sonner';
import { createClient } from '@/libs/supabase/server';
import type { Profile } from '@/services/auth/auth.types';
import './globals.css';

const gugi = Gugi({ weight: '400', subsets: ['latin'], display: 'swap', variable: '--font-gugi-next' });

export const metadata: Metadata = {
  title: '도담덕 - 유아용품 교환 & 나눔 플랫폼',
  description:
    '어제의 장난감을 오늘의 행복으로. 유아용품 교환과 나눔을 위한 플랫폼입니다.',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profile: Profile | null = null;
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('id, username, display_name, location, profile_url, level, verification_count, created_at, updated_at')
      .eq('id', user.id)
      .single<Profile>();
    profile = data;
  }

  return (
    <html lang="ko" className={gugi.variable}>
      <head />
      <body>
        <Providers>
          <Navbar serverUser={user ?? null} serverProfile={profile} />
          <main className="pt-14">{children}</main>
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
