'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Button,
  TextInput,
  Textarea,
  Stack,
  Text,
  Title,
  Paper,
  Center,
  Loader,
} from '@mantine/core';
import { useForm, schemaResolver } from '@mantine/form';
import { IconCamera } from '@tabler/icons-react';
import {
  createBoardPostSchema,
  type CreateBoardPostForm,
} from '@/libs/validations/board';
import { useCreateBoardPost } from '@/services/board/useBoard';
import { useUser } from '@/services/auth/useUser';
import { AuthGuard } from '@/components/common/AuthGuard';

export default function BoardNewPage() {
  return (
    <AuthGuard>
      <BoardNewContent />
    </AuthGuard>
  );
}

function BoardNewContent() {
  const router = useRouter();
  const { user, isLoading: isUserLoading } = useUser();
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const createPost = useCreateBoardPost();

  const form = useForm<CreateBoardPostForm>({
    validate: schemaResolver(createBoardPostSchema),
    initialValues: {
      title: '',
      content: '',
    },
  });

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImage(file);
    setImagePreview(URL.createObjectURL(file));
  }

  function handleSubmit(values: CreateBoardPostForm) {
    if (!image || !user) return;

    createPost.mutate(
      {
        title: values.title,
        content: values.content,
        image,
      },
      { onSuccess: () => router.push('/board') }
    );
  }

  if (isUserLoading) {
    return (
      <Center className="min-h-[60vh]">
        <Loader size="lg" />
      </Center>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Title order={2} className="mb-8">
        도담덕 게시판 글 올리기
      </Title>

      <Paper shadow="sm" p="xl" radius="md" withBorder>
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="lg">
            <TextInput
              label="제목"
              placeholder="글 제목을 입력해주세요"
              {...form.getInputProps('title')}
            />

            <div>
              <Text fw={500} size="sm" className="mb-2">
                이미지
              </Text>
              <label className="flex h-40 w-40 cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed border-gray-300 transition-colors hover:border-gray-400">
                {imagePreview ? (
                  <Image
                    src={imagePreview}
                    alt="미리보기"
                    width={160}
                    height={160}
                    className="h-full w-full rounded-md object-cover"
                  />
                ) : (
                  <Stack align="center" gap={4}>
                    <IconCamera size={32} color="gray" />
                    <Text size="xs" c="dimmed">
                      사진 추가
                    </Text>
                  </Stack>
                )}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </label>
            </div>

            <Textarea
              label="내용"
              placeholder="커뮤니티 가이드라인을 준수하며 내용을 작성해주세요"
              minRows={8}
              {...form.getInputProps('content')}
            />

            <Button
              type="submit"
              loading={createPost.isPending}
              disabled={!image}
            >
              등록
            </Button>
          </Stack>
        </form>
      </Paper>
    </div>
  );
}
