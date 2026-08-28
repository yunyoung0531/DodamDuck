'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { LoadingButton } from '@/components/common/LoadingButton';
import { LoadingState } from '@/components/common/LoadingState';
import { FormFieldError } from '@/components/common/FormFieldError';
import { ImageUploadField } from '@/components/common/ImageUploadField';
import { AIGenerateButton } from '@/components/sharing/AIGenerateButton';
import { CategoryChips } from '@/components/sharing/CategoryChips';
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
  const [tagInput, setTagInput] = useState('');
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

              <div className="flex flex-col gap-1">
                <Label htmlFor="title">상품명</Label>
                <Input
                  id="title"
                  placeholder="상품명을 등록해주세요"
                  {...register('title')}
                />
                <FormFieldError message={errors.title?.message} />
              </div>

              <div className="flex flex-col gap-1">
                <Label htmlFor="content">상품 설명</Label>
                <Textarea
                  id="content"
                  placeholder="상품의 상태, 브랜드, 사용감 등을 입력해주세요"
                  rows={5}
                  {...register('content')}
                />
                <FormFieldError message={errors.content?.message} />
              </div>

              <div className="flex flex-col gap-1">
                <Label htmlFor="location">거래 희망 장소</Label>
                <Input
                  id="location"
                  placeholder="거래 희망 장소를 입력해주세요"
                  {...register('location')}
                />
                <FormFieldError message={errors.location?.message} />
              </div>

              <Controller
                name="category"
                control={control}
                render={({ field }) => (
                  <div className="flex flex-col gap-2">
                    <Label className="block">카테고리</Label>
                    <CategoryChips
                      value={field.value}
                      onChange={field.onChange}
                    />
                    <FormFieldError message={errors.category?.message} />
                  </div>
                )}
              />

              <Controller
                name="exchangeOption"
                control={control}
                render={({ field }) => (
                  <div className="flex flex-col gap-2">
                    <Label className="block">거래 방식</Label>
                    <RadioGroup
                      value={field.value}
                      onValueChange={field.onChange}
                      className="flex gap-4"
                    >
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="교환" id="exchange" />
                        <Label htmlFor="exchange" className="cursor-pointer">
                          교환
                        </Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="나눔" id="share" />
                        <Label htmlFor="share" className="cursor-pointer">
                          나눔
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                )}
              />

              <div className="flex flex-col gap-2">
                <div>
                  <Label htmlFor="tagInput">해시태그</Label>
                  <Input
                    id="tagInput"
                    placeholder="태그 입력 후 스페이스바 (최대 5개)"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleTagKeyDown}
                  />
                </div>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="gap-2">
                        #{tag}
                        <button
                          type="button"
                          className="text-muted-foreground hover:text-foreground"
                          onClick={() =>
                            setTags(tags.filter((t) => t !== tag))
                          }
                        >
                          <X size={12} />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
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
    </div>
  );
}
