'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Camera } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Spinner } from '@/components/common/Spinner';
import { toast } from 'sonner';
import { useUpdateProfileImage } from '@/services/auth/useAuth';
import {
  MAX_FILE_SIZE,
  SUPPORTED_MIMES,
  detectMimeType,
  convertHeicToJpeg,
} from '@/libs/image-utils';

interface ProfileAvatarUploadProps {
  profileUrl: string | null;
  displayName: string | null;
}

export function ProfileAvatarUpload({
  profileUrl,
  displayName,
}: ProfileAvatarUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const mutation = useUpdateProfileImage();
  const [isConverting, setIsConverting] = useState(false);

  const isProcessing = mutation.isPending || isConverting;
  const displayUrl = mutation.data ?? profileUrl;

  function handleClick() {
    if (isProcessing) return;
    inputRef.current?.click();
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

    let uploadFile: File;

    if (realMime === 'image/heic') {
      setIsConverting(true);
      try {
        uploadFile = await convertHeicToJpeg(file);
      } catch {
        toast.error('HEIC 변환 실패', {
          description: 'HEIC 파일을 JPEG으로 변환할 수 없습니다. 다른 이미지를 사용해주세요.',
        });
        return;
      } finally {
        setIsConverting(false);
      }
    } else {
      uploadFile =
        file.type === realMime
          ? file
          : new File([file], file.name, { type: realMime });
    }

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
    <div className="relative h-30 w-30">
      <button
        type="button"
        onClick={handleClick}
        disabled={isProcessing}
        aria-label="프로필 사진 변경"
        className="group relative h-30 w-30 cursor-pointer rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        <Avatar className="h-30 w-30">
          <AvatarImage src={displayUrl || undefined} />
          <AvatarFallback className="text-2xl">
            {displayName?.[0] ?? '?'}
          </AvatarFallback>
        </Avatar>

        {isProcessing ? (
          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50">
            <Spinner size="lg" className="text-white" />
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/0 transition-colors group-hover:bg-black/40">
            <Camera className="size-8 text-white opacity-0 transition-opacity group-hover:opacity-100" />
          </div>
        )}
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp,image/heic,.heic,.heif"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}
