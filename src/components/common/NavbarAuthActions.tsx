'use client';

import { LogIn, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LinkButton } from '@/components/common/LinkButton';
import { useUser } from '@/services/auth/useUser';
import { useLogout } from '@/services/auth/useAuth';

/**
 * 데스크톱 헤더 우측의 인증 영역.
 * 모바일 드로어(`NavbarDrawer`)는 배치·버튼 스타일이 전부 달라 따로 그린다.
 */
export function NavbarAuthActions() {
  const { user, profile } = useUser();
  const logout = useLogout();

  return (
    <div className="hidden shrink-0 items-center gap-2 lg:flex">
      {user && profile ? (
        <>
          <span className="max-w-52 text-sm">
            {profile.display_name}님 안녕하세요
          </span>
          <Button variant="ghost" size="xs" onClick={logout}>
            <LogOut size={16} />
            로그아웃
          </Button>
        </>
      ) : (
        <LinkButton href="/signin" size="xs">
          <LogIn size={16} />
          로그인
        </LinkButton>
      )}
    </div>
  );
}
