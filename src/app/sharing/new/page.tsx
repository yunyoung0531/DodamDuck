'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Button,
  TextInput,
  Textarea,
  Radio,
  Group,
  Stack,
  Text,
  Title,
  Paper,
  Badge,
  ActionIcon,
  Center,
  Loader,
} from '@mantine/core';
import { useForm, schemaResolver } from '@mantine/form';
import { IconCamera, IconX } from '@tabler/icons-react';
import {
  createSharingPostSchema,
  type CreateSharingPostForm,
} from '@/libs/validations/sharing';
import { useCreateSharingPost } from '@/services/sharing/useSharing';
import { useUser } from '@/services/auth/useUser';
import { AuthGuard } from '@/components/common/AuthGuard';

export default function SharingNewPage() {
  return (
    <AuthGuard>
      <SharingNewContent />
    </AuthGuard>
  );
}

function SharingNewContent() {
  const router = useRouter();
  const { user, isLoading: isUserLoading } = useUser();
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const createPost = useCreateSharingPost();

  const form = useForm<CreateSharingPostForm>({
    validate: schemaResolver(createSharingPostSchema),
    initialValues: {
      title: '',
      content: '',
      location: '',
      exchangeOption: '교환',
    },
  });

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImage(file);
    setImagePreview(URL.createObjectURL(file));
  }

  function handleTagKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      const trimmed = tagInput.trim();
      if (trimmed && !tags.includes(trimmed) && tags.length < 5) {
        setTags([...tags, trimmed]);
      }
      setTagInput('');
    }
  }

  function handleSubmit(values: CreateSharingPostForm) {
    if (!image || !user) return;

    createPost.mutate(
      {
        title: values.title,
        content: values.content,
        location: values.location,
        exchangeOption: values.exchangeOption,
        tags,
        image,
      },
      { onSuccess: () => router.push('/sharing') }
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
        교환 &amp; 나눔 글 올리기
      </Title>

      <Paper shadow="sm" p="xl" radius="md" withBorder>
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="lg">
            <div>
              <Text fw={500} size="sm" className="mb-2">
                상품 이미지
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

            <TextInput
              label="상품명"
              placeholder="상품명을 등록해주세요"
              {...form.getInputProps('title')}
            />

            <Textarea
              label="상품 설명"
              placeholder="상품의 상태, 브랜드, 사용감 등을 입력해주세요"
              minRows={5}
              {...form.getInputProps('content')}
            />

            <TextInput
              label="거래 희망 장소"
              placeholder="거래 희망 장소를 입력해주세요"
              {...form.getInputProps('location')}
            />

            <Radio.Group
              label="거래 방식"
              {...form.getInputProps('exchangeOption')}
            >
              <Group>
                <Radio value="교환" label="교환" />
                <Radio value="나눔" label="나눔" />
              </Group>
            </Radio.Group>

            <div>
              <TextInput
                label="해시태그"
                placeholder="태그 입력 후 스페이스바 (최대 5개)"
                value={tagInput}
                onChange={(e) => setTagInput(e.currentTarget.value)}
                onKeyDown={handleTagKeyDown}
              />
              {tags.length > 0 && (
                <Group gap="xs" className="mt-2">
                  {tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="outline"
                      rightSection={
                        <ActionIcon
                          size="xs"
                          variant="transparent"
                          onClick={() =>
                            setTags(tags.filter((t) => t !== tag))
                          }
                        >
                          <IconX size={12} />
                        </ActionIcon>
                      }
                    >
                      #{tag}
                    </Badge>
                  ))}
                </Group>
              )}
            </div>

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
