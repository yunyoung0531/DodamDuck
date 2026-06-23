'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Card,
  Text,
  Title,
  Stack,
  Group,
  Avatar,
  Badge,
  SimpleGrid,
  Tabs,
  Center,
  Loader,
} from '@mantine/core';
import { useSharingList, useIncrementSharingViewCount } from '@/services/sharing/useSharing';
import type { User } from '@supabase/supabase-js';
import type { Profile } from '@/services/auth/auth.types';

interface MyShopContentsProps {
  user: User;
  profile: Profile;
}

export default function MyShopContents({ user, profile }: MyShopContentsProps) {
  const router = useRouter();
  const { data: allPosts, isLoading } = useSharingList();
  const incrementView = useIncrementSharingViewCount();

  const myPosts = allPosts?.filter((post) => post.user_id === user.id);

  function handleProductClick(postId: number) {
    incrementView.mutate(postId);
    router.push(`/sharing/${postId}`);
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <Card shadow="sm" padding="xl" radius="md" withBorder className="mb-8">
        <Group>
          <Avatar
            src={profile.profile_url || undefined}
            size={120}
            radius="xl"
          />
          <Stack gap="xs">
            <Title order={3}>
              {profile.display_name}({profile.username}) 님
            </Title>
            <Badge variant="light">level.{profile.level}</Badge>
            <Text size="sm" c="dimmed">
              인증 횟수: {profile.verification_count}
            </Text>
            <Text size="sm" c="dimmed">
              위치: {profile.location}
            </Text>
          </Stack>
        </Group>
      </Card>

      <Tabs defaultValue="products">
        <Tabs.List>
          <Tabs.Tab value="products">상품</Tabs.Tab>
          <Tabs.Tab value="wishlist">하트목록</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="products" className="pt-6">
          {isLoading && (
            <Center className="min-h-[20vh]">
              <Loader size="md" />
            </Center>
          )}

          {myPosts && myPosts.length > 0 ? (
            <SimpleGrid cols={{ base: 2, sm: 3, md: 4 }} spacing="md">
              {myPosts.map((post) => (
                <div
                  key={post.id}
                  className="cursor-pointer"
                  onClick={() => handleProductClick(post.id)}
                >
                  <div className="relative aspect-square overflow-hidden rounded-md">
                    <Image
                      src={post.image_url || '/images/도담덕로고.png'}
                      alt={post.title}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                  <Text size="sm" className="mt-2" lineClamp={1}>
                    {post.title}
                  </Text>
                </div>
              ))}
            </SimpleGrid>
          ) : (
            !isLoading && (
              <Text c="dimmed" className="text-center">
                등록한 상품이 없습니다.
              </Text>
            )
          )}
        </Tabs.Panel>

        <Tabs.Panel value="wishlist" className="pt-6">
          <Text c="dimmed" className="text-center">
            준비중입니다.
          </Text>
        </Tabs.Panel>
      </Tabs>
    </div>
  );
}
