'use client';

import { useRouter } from 'next/navigation';
import { AvatarFilePicker } from '@/components/my-shop/AvatarFilePicker';
import { toast } from 'sonner';
import { useUpdateProfileImage } from '@/services/auth/useAuth';
import { usePickImageFile } from '@/libs/use-pick-image-file';

interface ProfileAvatarUploadProps {
  profileUrl: string | null;
  displayName: string | null;
}

export function ProfileAvatarUpload({
  profileUrl,
  displayName,
}: ProfileAvatarUploadProps) {
  const router = useRouter();
  const mutation = useUpdateProfileImage();
  const { isConverting, pickImageFile } = usePickImageFile();

  const isProcessing = mutation.isPending || isConverting;
  const displayUrl = mutation.data ?? profileUrl;

  async function handlePick(file: File) {
    const uploadFile = await pickImageFile(file);
    if (!uploadFile) return;

    mutation.mutate(uploadFile, {
      onSuccess: () => {
        toast.success('프로필 사진이 변경되었습니다.');
        router.refresh();
      },
      onError: () => {
        toast.error('업로드 실패', {
          description: '프로필 사진 업로드에 실패했습니다. 다시 시도해주세요.',
        });
      },
    });
  }

  return (
    <AvatarFilePicker
      src={displayUrl || undefined}
      displayName={displayName}
      isProcessing={isProcessing}
      onPick={handlePick}
      size="lg"
    />
  );
}
