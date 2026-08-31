'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Pencil, Camera } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { FormFieldError } from '@/components/common/FormFieldError';
import { LoadingButton } from '@/components/common/LoadingButton';
import { Spinner } from '@/components/common/Spinner';

import { useUpdateProfile } from '@/services/auth/useAuth';
import {
  editProfileSchema,
  type EditProfileForm,
} from '@/libs/validations/auth';
import {
  MAX_FILE_SIZE,
  SUPPORTED_MIMES,
  detectMimeType,
  convertHeicToJpeg,
} from '@/libs/image-utils';
import type { Profile } from '@/services/auth/auth.types';

interface EditProfileDialogProps {
  profile: Profile;
}

export function EditProfileDialog({ profile }: EditProfileDialogProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mutation = useUpdateProfile();

  const [open, setOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isConverting, setIsConverting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditProfileForm>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: {
      display_name: profile.display_name,
      location: profile.location,
    },
  });

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (nextOpen) {
      reset({
        display_name: profile.display_name,
        location: profile.location,
      });
      setSelectedFile(null);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      setPreviewUrl(null);
    }
  }

  function handleCleanup() {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setSelectedFile(null);
  }

  function handleAvatarClick() {
    if (isConverting) return;
    fileInputRef.current?.click();
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    e.target.value = '';

    if (file.size > MAX_FILE_SIZE) {
      toast.error('파일 크기 초과', {
        description: '5MB 이하의 파일만 업로드할 수 있습니다.',
      });
      return;
    }

    const header = await file.slice(0, 12).arrayBuffer();
    const realMime = detectMimeType(header);

    if (!realMime || !SUPPORTED_MIMES.has(realMime)) {
      toast.error('유효하지 않은 이미지 파일입니다', {
        description:
          '파일 확장자만 변경된 경우 원본 형식(JPG, PNG, GIF, WebP)의 이미지를 사용해주세요.',
      });
      return;
    }

    let processedFile: File;

    if (realMime === 'image/heic') {
      setIsConverting(true);
      try {
        processedFile = await convertHeicToJpeg(file);
      } catch {
        toast.error('HEIC 변환 실패', {
          description:
            'HEIC 파일을 JPEG으로 변환할 수 없습니다. 다른 이미지를 사용해주세요.',
        });
        return;
      } finally {
        setIsConverting(false);
      }
    } else {
      processedFile =
        file.type === realMime
          ? file
          : new File([file], file.name, { type: realMime });
    }

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(processedFile);
    setPreviewUrl(URL.createObjectURL(processedFile));
  }

  function onSubmit(values: EditProfileForm) {
    mutation.mutate(
      {
        display_name: values.display_name,
        location: values.location,
        profileImage: selectedFile ?? undefined,
      },
      {
        onSuccess: () => {
          toast.success('프로필이 수정되었습니다.');
          handleCleanup();
          setOpen(false);
          router.refresh();
        },
        onError: () => {
          toast.error('프로필 수정 실패', {
            description: '프로필 수정에 실패했습니다. 다시 시도해주세요.',
          });
        },
      }
    );
  }

  const avatarSrc = previewUrl ?? (profile.profile_url || undefined);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={<Button variant="outline" size="sm" />}
      >
        <Pencil className="size-4" />
        내 정보 수정
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>내 정보 수정</DialogTitle>
          <DialogDescription>
            프로필 사진, 닉네임, 위치를 수정할 수 있습니다.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-4"
        >
          <div className="flex justify-center">
            <div className="relative h-24 w-24">
              <button
                type="button"
                onClick={handleAvatarClick}
                disabled={isConverting}
                aria-label="프로필 사진 변경"
                className="group relative h-24 w-24 cursor-pointer rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                <Avatar className="h-24 w-24">
                  <AvatarImage src={avatarSrc} />
                  <AvatarFallback className="text-xl">
                    {profile.display_name?.[0] ?? '?'}
                  </AvatarFallback>
                </Avatar>

                {isConverting ? (
                  <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50">
                    <Spinner size="md" className="text-white" />
                  </div>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/0 transition-colors group-hover:bg-black/40">
                    <Camera className="size-6 text-white opacity-0 transition-opacity group-hover:opacity-100" />
                  </div>
                )}
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp,image/heic,.heic,.heif"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="display_name">닉네임</Label>
            <Input
              id="display_name"
              placeholder="닉네임을 입력하세요"
              {...register('display_name')}
            />
            <FormFieldError message={errors.display_name?.message} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="location">위치</Label>
            <Input
              id="location"
              placeholder="위치를 입력하세요"
              {...register('location')}
            />
            <FormFieldError message={errors.location?.message} />
          </div>

          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>
              취소
            </DialogClose>
            <LoadingButton type="submit" loading={mutation.isPending}>
              저장
            </LoadingButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
