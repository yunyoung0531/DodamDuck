'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogIn, LogOut, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LinkButton } from '@/components/common/LinkButton';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useUser } from '@/services/auth/useUser';
import { useLogout } from '@/services/auth/useAuth';
import { NAV_LINKS, isActivePath } from './nav-links';

/** 모바일(lg 미만) 햄버거 메뉴. 열림 상태를 스스로 관리한다. */
export function NavbarDrawer() {
  const [drawerOpened, setDrawerOpened] = useState(false);
  const pathname = usePathname();
  const { user, profile } = useUser();
  const logout = useLogout();

  return (
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
                isActivePath(pathname, link.href)
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
                  logout();
                }}
              >
                <LogOut size={16} />
                로그아웃
              </Button>
            </div>
          ) : (
            <LinkButton
              href="/signin"
              size="sm"
              className="w-full"
              onClick={() => setDrawerOpened(false)}
            >
              <LogIn size={16} />
              로그인
            </LinkButton>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
