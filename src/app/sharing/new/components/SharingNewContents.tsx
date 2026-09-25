'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { LoadingButton } from '@/components/common/LoadingButton';
import { LoadingState } from '@/components/common/LoadingState';
import { FormField } from '@/components/common/FormField';
import { FormFieldError } from '@/components/common/FormFieldError';
import { Label } from '@/components/ui/label';
import { ImageUploadField } from '@/components/common/ImageUploadField';
import { AIGenerateButton } from '@/components/sharing/AIGenerateButton';
import { CategoryChips } from '@/components/sharing/CategoryChips';
import { TagInputField } from '@/components/sharing/TagInputField';
import { ExchangeOptionField } from '@/components/sharing/ExchangeOptionField';
import {
  createSharingPostSchema,
  type CreateSharingPostForm,
} from '@/libs/validations/sharing';
import { useCreateSharingPost } from '@/services/sharing/useSharing';
import { useUser } from '@/services/auth/useUser';

export default function SharingNewContents() {
  const router = useRouter();
  const { user, isLoading: isUserLoading } = useUser();
  const [image, setImage] = useState<File | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const createPost = useCreateSharingPost();

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<CreateSharingPostForm>({
    resolver: zodResolver(createSharingPostSchema),
    defaultValues: {
      title: '',
      content: '',
      location: '',
      exchangeOption: '교환',
    },
  });

  function onSubmit(values: CreateSharingPostForm) {
    if (!image || !user) return;

    createPost.mutate(
      {
        title: values.title,
        content: values.content,
        location: values.location,
        exchangeOption: values.exchangeOption,
        category: values.category,
        tags,
        image,
      },
      { onSuccess: () => router.push('/sharing') }
    );
  }

  if (isUserLoading) {
    return <LoadingState height="lg" />;
  }

  return (
    <div className="flex justify-center px-4 py-10">
      <div className="flex w-full max-w-3xl flex-col gap-8">
      <h2 className="font-heading text-2xl font-bold">
        교환 &amp; 나눔 글 올리기
      </h2>

      <Card>
        <CardContent className="p-8">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-6">
              <ImageUploadField
                label="상품 이미지"
                onFileSelect={setImage}
              />

              <AIGenerateButton
                image={image}
                setValue={setValue}
                setTags={setTags}
              />

              <FormField htmlFor="title" label="상품명" error={errors.title?.message}>
                <Input
                  id="title"
                  placeholder="상품명을 등록해주세요"
                  {...register('title')}
                />
              </FormField>

              <FormField
                htmlFor="content"
                label="상품 설명"
                error={errors.content?.message}
              >
                <Textarea
                  id="content"
                  placeholder="상품의 상태, 브랜드, 사용감 등을 입력해주세요"
                  rows={5}
                  {...register('content')}
                />
              </FormField>

              <FormField htmlFor="location" label="거래 희망 장소" error={errors.location?.message}>
                <Input
                  id="location"
                  placeholder="거래 희망 장소를 입력해주세요"
                  {...register('location')}
                />
              </FormField>

              <Controller
                name="category"
                control={control}
                render={({ field }) => (
                  <div className="flex flex-col gap-1.5">
                    <Label id="category-label">카테고리</Label>
                    <CategoryChips
                      value={field.value}
                      onChange={field.onChange}
                      aria-labelledby="category-label"
                    />
                    <FormFieldError message={errors.category?.message} />
                  </div>
                )}
              />

              <Controller
                name="exchangeOption"
                control={control}
                render={({ field }) => (
                  <ExchangeOptionField
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />

              <TagInputField tags={tags} onChange={setTags} />

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
    </div>
  );
}
