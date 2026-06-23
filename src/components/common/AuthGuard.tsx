'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Center, Loader, Stack, Text } from '@mantine/core';
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
      router.push(`/login?callbackUrl=${encodeURIComponent(pathname)}`);
    }
  }, [isLoading, user, router, pathname]);

  if (isLoading) {
    return (
      <Center className="min-h-[50vh]">
        <Stack align="center" gap="sm">
          <Loader size="lg" />
          <Text c="dimmed" size="sm">
            로딩 중...
          </Text>
        </Stack>
      </Center>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}
