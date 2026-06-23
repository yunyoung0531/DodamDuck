'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { Group, Burger, Drawer, Button, Text, Stack } from '@mantine/core';
import { IconLogin, IconLogout } from '@tabler/icons-react';
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
    <>
      <header className="fixed top-0 left-0 right-0 z-50 h-14 border-b border-gray-200 bg-white">
        <Group className="mx-auto h-full max-w-6xl px-4" justify="space-between">
          <Link href="/" className="flex items-center gap-2 no-underline">
            <Image
              src="/images/도담덕로고.png"
              alt="도담덕 로고"
              width={32}
              height={32}
            />
            <Text fw={700} size="lg" c="dodamYellow.5">
              도담덕
            </Text>
          </Link>

          <Group gap="lg" visibleFrom="sm">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="no-underline"
              >
                <Text
                  size="sm"
                  fw={isActive(link.href) ? 700 : 400}
                  c={isActive(link.href) ? 'dodamYellow.5' : 'dark'}
                >
                  {link.label}
                </Text>
              </Link>
            ))}
          </Group>

          <Group gap="sm" visibleFrom="sm">
            {!isLoading && user && profile ? (
              <>
                <Text size="sm">{profile.display_name}님 안녕하세요</Text>
                <Button
                  variant="subtle"
                  size="xs"
                  leftSection={<IconLogout size={16} />}
                  onClick={handleLogout}
                >
                  로그아웃
                </Button>
              </>
            ) : (
              !isLoading && (
                <Button
                  component={Link}
                  href="/login"
                  variant="filled"
                  size="xs"
                  leftSection={<IconLogin size={16} />}
                >
                  로그인
                </Button>
              )
            )}
          </Group>

          <Burger
            opened={drawerOpened}
            onClick={() => setDrawerOpened((prev) => !prev)}
            hiddenFrom="sm"
            aria-label="메뉴 열기"
          />
        </Group>
      </header>

      <Drawer
        opened={drawerOpened}
        onClose={() => setDrawerOpened(false)}
        title="메뉴"
        padding="md"
        size="xs"
        position="right"
      >
        <Stack gap="md">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="no-underline"
              onClick={() => setDrawerOpened(false)}
            >
              <Text
                size="md"
                fw={isActive(link.href) ? 700 : 400}
                c={isActive(link.href) ? 'dodamYellow.5' : 'dark'}
              >
                {link.label}
              </Text>
            </Link>
          ))}

          {!isLoading && user && profile ? (
            <>
              <Text size="sm" c="dimmed">
                {profile.display_name}님 안녕하세요
              </Text>
              <Button
                variant="subtle"
                leftSection={<IconLogout size={16} />}
                onClick={() => {
                  setDrawerOpened(false);
                  handleLogout();
                }}
              >
                로그아웃
              </Button>
            </>
          ) : (
            !isLoading && (
              <Button
                component={Link}
                href="/login"
                variant="filled"
                leftSection={<IconLogin size={16} />}
                onClick={() => setDrawerOpened(false)}
              >
                로그인
              </Button>
            )
          )}
        </Stack>
      </Drawer>
    </>
  );
}
