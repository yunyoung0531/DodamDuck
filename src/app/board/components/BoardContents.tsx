'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Text,
  Title,
  Stack,
  Center,
  Loader,
  Alert,
  ActionIcon,
  Affix,
} from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import { useBoardList, useIncrementBoardViewCount } from '@/services/board/useBoard';
import { useUser } from '@/services/auth/useUser';
import { formatTimeSince } from '@/libs/format-date';

export default function BoardContents() {
  const router = useRouter();
  const { user } = useUser();
  const { data: posts, isLoading } = useBoardList();
  const incrementView = useIncrementBoardViewCount();

  function handleCardClick(postId: number) {
    incrementView.mutate(postId);
    router.push(`/board/${postId}`);
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <Stack align="center" gap="xs" className="mb-8">
        <Text c="dimmed" size="lg">
          나눔을 통해 행복을 나누다
        </Text>
        <Title order={1}>도담덕 정보 나눔</Title>
      </Stack>

      {isLoading && (
        <Center className="min-h-[40vh]">
          <Loader size="lg" />
        </Center>
      )}

      {posts && (
        <Stack gap="md">
          {posts.map((post) => (
            <div
              key={post.id}
              className="flex cursor-pointer items-center gap-5 rounded-md border border-gray-200 bg-white p-4 transition-all hover:-translate-y-0.5 hover:shadow-lg"
              onClick={() => handleCardClick(post.id)}
            >
              <div className="relative h-32 w-44 shrink-0 overflow-hidden rounded-md">
                <Image
                  src={post.image_url || '/images/도담덕로고.png'}
                  alt={post.title}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
              <div className="flex flex-1 flex-col">
                <Text fw={600} size="lg" lineClamp={1}>
                  {post.title}
                </Text>
                <Text size="sm" c="dimmed" className="mt-1">
                  댓글 {post.comment_count}개 · {formatTimeSince(post.created_at)}{' '}
                  · 조회 {post.views}
                </Text>
                <Text size="sm" c="dimmed" className="mt-2" lineClamp={2}>
                  {post.content}
                </Text>
              </div>
            </div>
          ))}
        </Stack>
      )}

      {posts && posts.length === 0 && (
        <Alert className="mx-auto max-w-md">게시글이 없습니다.</Alert>
      )}

      {user && (
        <Affix position={{ bottom: 40, right: 40 }}>
          <ActionIcon
            component={Link}
            href="/board/new"
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
