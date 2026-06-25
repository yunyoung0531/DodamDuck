'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { LogIn, LogOut, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useUser } from '@/services/auth/useUser';
import { servSignOut } from '@/services/auth/auth-services';

const NAV_LINKS = [
  { href: '/sharing', label: '장난감 교환' },
  { href: '/library', label: '장난감 도서관' },
  { href: '/board', label: '게시판' },
  { href: '/my-shop', label: '내 상점' },
  { href: '/chat', label: '채팅' },
] as const;

export function Navbar() {
  const [drawerOpened, setDrawerOpened] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile, isLoading } = useUser();

  async function handleLogout() {
    await servSignOut();
    router.push('/');
    router.refresh();
  }

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-14 border-b border-gray-200 bg-white">
      <div className="mx-auto flex h-full max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 no-underline">
          <Image
            src="/images/도담덕로고.png"
            alt="도담덕 로고"
            width={32}
            height={32}
          />
          <span className="text-lg font-bold text-dodam-500">도담덕</span>
        </Link>

        <nav className="hidden items-center gap-6 sm:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="no-underline"
            >
              <span
                className={`text-sm ${
                  isActive(link.href)
                    ? 'font-bold text-dodam-500'
                    : 'text-gray-800'
                }`}
              >
                {link.label}
              </span>
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 sm:flex">
          {!isLoading && user && profile ? (
            <>
              <span className="text-sm">{profile.display_name}님 안녕하세요</span>
              <Button
                variant="ghost"
                size="xs"
                onClick={handleLogout}
              >
                <LogOut size={16} />
                로그아웃
              </Button>
            </>
          ) : (
            !isLoading && (
              <Button size="xs" render={<Link href="/signin" />}>
                <LogIn size={16} />
                로그인
              </Button>
            )
          )}
        </div>

        <Sheet open={drawerOpened} onOpenChange={setDrawerOpened}>
          <SheetTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                className="sm:hidden"
                aria-label="메뉴 열기"
              />
            }
          >
            {drawerOpened ? <X size={20} /> : <Menu size={20} />}
          </SheetTrigger>
          <SheetContent side="right" className="w-64">
            <SheetHeader>
              <SheetTitle>메뉴</SheetTitle>
            </SheetHeader>
            <div className="mt-6 flex flex-col gap-4">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="no-underline"
                  onClick={() => setDrawerOpened(false)}
                >
                  <span
                    className={`text-base ${
                      isActive(link.href)
                        ? 'font-bold text-dodam-500'
                        : 'text-gray-800'
                    }`}
                  >
                    {link.label}
                  </span>
                </Link>
              ))}

              {!isLoading && user && profile ? (
                <>
                  <p className="text-sm text-muted-foreground">
                    {profile.display_name}님 안녕하세요
                  </p>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setDrawerOpened(false);
                      handleLogout();
                    }}
                  >
                    <LogOut size={16} />
                    로그아웃
                  </Button>
                </>
              ) : (
                !isLoading && (
                  <Button
                    render={<Link href="/signin" />}
                    onClick={() => setDrawerOpened(false)}
                  >
                    <LogIn size={16} />
                    로그인
                  </Button>
                )
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
