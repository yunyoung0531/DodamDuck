'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { LoadingState } from '@/components/common/LoadingState';
import { useUser } from '@/services/auth/useUser';

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { user, isLoading } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push(`/signin?callbackUrl=${encodeURIComponent(pathname)}`);
    }
  }, [isLoading, user, router, pathname]);

  if (isLoading) {
    return <LoadingState height="lg" label="로딩 중..." />;
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}
