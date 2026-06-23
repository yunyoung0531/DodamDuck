'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Card,
  Text,
  Title,
  Stack,
  TextInput,
  Badge,
  Group,
  SimpleGrid,
  Center,
  Loader,
  ActionIcon,
  Alert,
  Affix,
} from '@mantine/core';
import { IconSearch, IconPlus } from '@tabler/icons-react';
import {
  useSharingList,
  useSharingSearch,
  usePopularSearches,
  useIncrementSharingViewCount,
} from '@/services/sharing/useSharing';
import { useUser } from '@/services/auth/useUser';
import { formatTimeSince } from '@/libs/format-date';

export default function SharingPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const router = useRouter();
  const { user } = useUser();

  const { data: posts, isLoading } = useSharingList();
  const { data: searchResults } = useSharingSearch(activeSearch);
  const { data: popularSearches } = usePopularSearches();
  const incrementView = useIncrementSharingViewCount();

  const displayPosts = activeSearch ? searchResults : posts;

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setActiveSearch(searchQuery);
  }

  function handleCardClick(postId: number) {
    incrementView.mutate(postId);
    router.push(`/sharing/${postId}`);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <Stack align="center" gap="xs" className="mb-8">
        <Text c="dimmed" size="lg">
          나눔을 통해 행복을 나누다
        </Text>
        <Title order={1}>교환 &amp; 나눔</Title>
      </Stack>

      <form onSubmit={handleSearch} className="mx-auto mb-6 max-w-lg">
        <TextInput
          placeholder="어떤 제품을 찾으세요?"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.currentTarget.value)}
          rightSection={
            <ActionIcon type="submit" variant="subtle">
              <IconSearch size={18} />
            </ActionIcon>
          }
        />
      </form>

      {popularSearches && popularSearches.length > 0 && (
        <Group gap="xs" justify="center" className="mb-8">
          {popularSearches.slice(0, 5).map((item) => (
            <Badge
              key={item.query}
              variant="outline"
              className="cursor-pointer"
              onClick={() => {
                setSearchQuery(item.query);
                setActiveSearch(item.query);
              }}
            >
              #{item.query}
            </Badge>
          ))}
        </Group>
      )}

      {isLoading && (
        <Center className="min-h-[40vh]">
          <Loader size="lg" />
        </Center>
      )}

      {displayPosts && (
        <SimpleGrid cols={{ base: 1, xs: 2, sm: 3, md: 4 }} spacing="lg">
          {displayPosts.map((post) => (
            <Card
              key={post.id}
              shadow="sm"
              padding="sm"
              radius="md"
              withBorder
              className="cursor-pointer transition-all hover:-translate-y-1 hover:shadow-lg"
              onClick={() => handleCardClick(post.id)}
            >
              <Card.Section className="relative h-48">
                <Image
                  src={post.image_url || '/images/도담덕로고.png'}
                  alt={post.title}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </Card.Section>

              <Text fw={600} size="sm" className="mt-3" lineClamp={1}>
                {post.title}
              </Text>
              <Text size="xs" c="dimmed" className="mt-1">
                {post.location} · {formatTimeSince(post.created_at)} · 조회{' '}
                {post.views}
              </Text>
              <Badge size="sm" variant="light" className="mt-2">
                {post.exchange_option}
              </Badge>
              {post.tags && post.tags.length > 0 && (
                <Group gap={4} className="mt-1">
                  {post.tags.map((tag) => (
                    <Text key={tag} size="xs" c="dimmed">
                      #{tag}
                    </Text>
                  ))}
                </Group>
              )}
            </Card>
          ))}
        </SimpleGrid>
      )}

      {displayPosts && displayPosts.length === 0 && (
        <Alert className="mx-auto max-w-md">게시글이 없습니다.</Alert>
      )}

      {user && (
        <Affix position={{ bottom: 40, right: 40 }}>
          <ActionIcon
            component={Link}
            href="/sharing/new"
            size={56}
            radius="xl"
            variant="filled"
          >
            <IconPlus size={24} />
          </ActionIcon>
        </Affix>
      )}
    </div>
  );
}
