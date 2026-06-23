'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  Card,
  Text,
  Title,
  Stack,
  Group,
  Avatar,
  TextInput,
  Divider,
  Center,
  Loader,
  Alert,
  ActionIcon,
  ScrollArea,
} from '@mantine/core';
import { IconTrash, IconSend } from '@tabler/icons-react';
import {
  useBoardDetail,
  useDeleteBoardPost,
  useAddBoardComment,
} from '@/services/board/useBoard';
import { useUser } from '@/services/auth/useUser';

export default function BoardDetailContents() {
  const { id } = useParams<{ id: string }>();
  const postId = Number(id);
  const router = useRouter();
  const { user } = useUser();
  const [comment, setComment] = useState('');

  const { data, isLoading } = useBoardDetail(postId);
  const deleteMutation = useDeleteBoardPost();
  const commentMutation = useAddBoardComment();

  if (isLoading) {
    return (
      <Center className="min-h-[60vh]">
        <Loader size="lg" />
      </Center>
    );
  }

  if (!data) {
    return (
      <Alert color="red" className="mx-auto mt-10 max-w-md">
        게시글을 찾을 수 없습니다.
      </Alert>
    );
  }

  const { post, comments } = data;
  const isAuthor = user?.id === post.user_id;

  function handleDelete() {
    if (!user) return;
    deleteMutation.mutate(postId, {
      onSuccess: () => router.push('/board'),
    });
  }

  function handleComment() {
    if (!comment.trim() || !user) return;
    commentMutation.mutate(
      { postId, content: comment },
      { onSuccess: () => setComment('') }
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <Card shadow="sm" radius="md" withBorder>
        <Card.Section className="border-b border-gray-200 p-4">
          <Text fw={600}>도담덕 정보 나눔 게시판</Text>
        </Card.Section>

        <div className="flex flex-col gap-6 p-6 md:flex-row">
          <div className="flex flex-col gap-4 md:w-1/2">
            <div className="relative aspect-square overflow-hidden rounded-md">
              <Image
                src={post.image_url || '/images/도담덕로고.png'}
                alt={post.title}
                fill
                className="object-cover"
                unoptimized
              />
            </div>

            <Group>
              <Avatar
                src={post.profiles.profile_url || undefined}
                size="lg"
                radius="xl"
              />
              <Stack gap={2}>
                <Text fw={600}>{post.profiles.display_name} 님</Text>
                <Text size="xs" c="dimmed">
                  {post.created_at}
                </Text>
              </Stack>
            </Group>
          </div>

          <Divider orientation="vertical" className="hidden md:block" />

          <div className="flex flex-1 flex-col">
            <Group justify="space-between">
              <Title order={3}>{post.title}</Title>
              {isAuthor && (
                <ActionIcon
                  variant="subtle"
                  color="red"
                  onClick={handleDelete}
                  loading={deleteMutation.isPending}
                >
                  <IconTrash size={18} />
                </ActionIcon>
              )}
            </Group>
            <Text size="xs" c="dimmed" className="mt-1">
              조회 {post.views}
            </Text>

            <Text className="mt-4 whitespace-pre-wrap">{post.content}</Text>

            <Divider className="my-6" />

            <Text fw={600} className="mb-3">
              댓글
            </Text>
            <ScrollArea.Autosize mah={300} className="scrollbar-brand">
              <Stack gap="sm">
                {comments.map((c) => (
                  <div key={c.id}>
                    <Group gap="xs">
                      <Text size="sm" fw={600}>
                        {c.profiles.display_name}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {c.created_at}
                      </Text>
                    </Group>
                    <Text size="sm" className="mt-1">
                      {c.content}
                    </Text>
                  </div>
                ))}
                {comments.length === 0 && (
                  <Text size="sm" c="dimmed">
                    아직 댓글이 없습니다.
                  </Text>
                )}
              </Stack>
            </ScrollArea.Autosize>

            {user && (
              <Group className="mt-4">
                <TextInput
                  placeholder="댓글을 입력해주세요."
                  value={comment}
                  onChange={(e) => setComment(e.currentTarget.value)}
                  className="flex-1"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleComment();
                  }}
                />
                <ActionIcon
                  onClick={handleComment}
                  loading={commentMutation.isPending}
                  variant="filled"
                >
                  <IconSend size={16} />
                </ActionIcon>
              </Group>
            )}
          </div>
        </div>

        <Card.Section className="border-t border-gray-200 p-4">
          <Text
            component={Link}
            href="/board"
            size="sm"
            c="dimmed"
            className="cursor-pointer hover:underline"
          >
            게시글 목록보기
          </Text>
        </Card.Section>
      </Card>
    </div>
  );
}
