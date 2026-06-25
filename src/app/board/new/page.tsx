'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { LoadingButton } from '@/components/common/LoadingButton';
import { LoadingState } from '@/components/common/LoadingState';
import { FormFieldError } from '@/components/common/FormFieldError';
import { ImageUploadField } from '@/components/common/ImageUploadField';
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
  const createPost = useCreateBoardPost();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateBoardPostForm>({
    resolver: zodResolver(createBoardPostSchema),
    defaultValues: {
      title: '',
      content: '',
    },
  });

  function onSubmit(values: CreateBoardPostForm) {
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
    return <LoadingState height="lg" />;
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h2 className="mb-8 font-heading text-2xl font-bold">
        도담덕 게시판 글 올리기
      </h2>

      <Card>
        <CardContent className="p-8">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-6">
              <div>
                <Label htmlFor="title">제목</Label>
                <Input
                  id="title"
                  placeholder="글 제목을 입력해주세요"
                  {...register('title')}
                />
                <FormFieldError message={errors.title?.message} />
              </div>

              <ImageUploadField
                label="이미지"
                onFileSelect={setImage}
              />

              <div>
                <Label htmlFor="content">내용</Label>
                <Textarea
                  id="content"
                  placeholder="커뮤니티 가이드라인을 준수하며 내용을 작성해주세요"
                  rows={8}
                  {...register('content')}
                />
                <FormFieldError message={errors.content?.message} />
              </div>

              <LoadingButton
                type="submit"
                loading={createPost.isPending}
                disabled={!image}
              >
                등록
              </LoadingButton>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
