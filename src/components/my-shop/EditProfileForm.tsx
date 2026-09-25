'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DialogClose, DialogFooter } from '@/components/ui/dialog';
import { FormField } from '@/components/common/FormField';
import { LoadingButton } from '@/components/common/LoadingButton';
import { AvatarFilePicker } from '@/components/my-shop/AvatarFilePicker';

import { useUpdateProfile } from '@/services/auth/useAuth';
import { usePickImageFile } from '@/libs/use-pick-image-file';
import {
  editProfileSchema,
  type EditProfileForm as EditProfileValues,
} from '@/libs/validations/auth';
import type { Profile } from '@/services/auth/auth.types';

export interface EditProfileFormProps {
  /** 폼의 초기값이 되는 현재 프로필 */
  profile: Profile;
  /** 저장에 성공하면 호출됩니다. 다이얼로그를 닫는 데 씁니다. */
  onDone: () => void;
}

/**
 * @description 프로필 사진, 닉네임, 위치를 고치는 폼입니다.
 *
 * @remarks
 * 저장에 성공하면 `onDone`을 부르고 서버 컴포넌트를 새로 고칩니다.
 * @internal
 * @name EditProfileForm
 * @tag form
 */
export function EditProfileForm({ profile, onDone }: EditProfileFormProps) {
  const router = useRouter();
  const mutation = useUpdateProfile();
  const { isConverting, pickImageFile } = usePickImageFile();
  const preview = useImagePreview();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EditProfileValues>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: {
      display_name: profile.display_name,
      location: profile.location,
    },
  });

  async function handlePick(file: File) {
    const processed = await pickImageFile(file);
    if (processed) preview.select(processed);
  }

  function handleSave(values: EditProfileValues) {
    mutation.mutate(
      { ...values, profileImage: preview.file ?? undefined },
      {
        onSuccess: () => {
          toast.success('프로필이 수정되었습니다.');
          onDone();
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

  return (
    <form onSubmit={handleSubmit(handleSave)} className="flex flex-col gap-4">
      <div className="flex justify-center">
        <AvatarFilePicker
          src={preview.url ?? (profile.profile_url || undefined)}
          displayName={profile.display_name}
          isProcessing={isConverting}
          onPick={handlePick}
        />
      </div>

      <FormField
        htmlFor="display_name"
        label="닉네임"
        error={errors.display_name?.message}
      >
        <Input
          id="display_name"
          placeholder="닉네임을 입력하세요"
          {...register('display_name')}
        />
      </FormField>

      <FormField htmlFor="location" label="위치" error={errors.location?.message}>
        <Input
          id="location"
          placeholder="위치를 입력하세요"
          {...register('location')}
        />
      </FormField>

      <DialogFooter>
        <DialogClose render={<Button variant="outline" />}>취소</DialogClose>
        <LoadingButton type="submit" loading={mutation.isPending}>
          저장
        </LoadingButton>
      </DialogFooter>
    </form>
  );
}

/**
 * 고른 이미지와 그 미리보기 URL을 함께 들고 있습니다.
 *
 * @remarks
 * `URL.createObjectURL`은 직접 해제하지 않으면 남습니다. 새 파일을 고를 때와
 * 언마운트할 때 이전 URL을 거둡니다.
 * @returns 고른 `file`, 미리보기 `url`, 새 파일을 지정하는 `select`
 */
function useImagePreview() {
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [url]);

  function select(next: File) {
    setFile(next);
    setUrl(URL.createObjectURL(next));
  }

  return { file, url, select };
}
