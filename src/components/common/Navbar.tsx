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
import { NAV_LINKS } from './nav-links';

export function Navbar() {
  const [drawerOpened, setDrawerOpened] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile } = useUser();

  async function handleLogout() {
    await servSignOut();
    router.push('/');
    router.refresh();
  }

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex h-14 justify-center border-b border-gray-200 bg-white">
      <div className="relative flex h-full w-full items-center justify-between px-4 sm:px-8 lg:px-20">
        <Link href="/" className="flex shrink-0 items-center gap-2 no-underline">
          <Image
            src="/images/도담덕로고.png"
            alt="도담덕 로고"
            width={32}
            height={32}
          />
          <span className="text-lg font-bold text-dodam-500">도담덕</span>
        </Link>

        <nav className="pointer-events-none absolute inset-x-0 hidden items-center justify-center gap-6 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="pointer-events-auto no-underline"
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

        <div className="hidden shrink-0 items-center gap-2 lg:flex">
          {user && profile ? (
            <>
              <span className="max-w-52 text-sm">{profile.display_name}님 안녕하세요</span>
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
            <Button size="xs" nativeButton={false} render={<Link href="/signin" />}>
              <LogIn size={16} />
              로그인
            </Button>
          )}
        </div>

        <Sheet open={drawerOpened} onOpenChange={setDrawerOpened}>
          <SheetTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                aria-label="메뉴 열기"
              />
            }
          >
            {drawerOpened ? <X size={20} /> : <Menu size={20} />}
          </SheetTrigger>
          <SheetContent side="right" className="w-72">
            <SheetHeader className="px-4 pb-2">
              <SheetTitle className="text-dodam-500">도담덕</SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col gap-1 px-2 pt-2">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-lg px-3 py-2.5 no-underline transition-colors ${
                    isActive(link.href)
                      ? 'bg-dodam-50 font-bold text-dodam-500'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={() => setDrawerOpened(false)}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="border-t border-gray-200 px-4 pt-4">
              {user && profile ? (
                <div className="flex flex-col gap-3">
                  <p className="text-sm font-medium text-gray-900">
                    {profile.display_name}님 안녕하세요
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      setDrawerOpened(false);
                      handleLogout();
                    }}
                  >
                    <LogOut size={16} />
                    로그아웃
                  </Button>
                </div>
              ) : (
                <Button
                  className="w-full"
                  size="sm"
                  render={<Link href="/signin" />}
                  onClick={() => setDrawerOpened(false)}
                >
                  <LogIn size={16} />
                  로그인
                </Button>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
