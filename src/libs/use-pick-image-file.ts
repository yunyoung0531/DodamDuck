'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import {
  MAX_FILE_SIZE,
  SUPPORTED_MIMES,
  detectMimeType,
  convertHeicToJpeg,
} from '@/libs/image-utils';

/**
 * @description 고른 이미지를 검사하고 업로드할 수 있는 형태로 바꿉니다.
 *
 * @remarks
 * 크기, 실제 MIME, HEIC 변환을 한 번에 처리합니다. 걸러진 경우 toast로 사유를 알리고
 * `null`을 돌려주므로 호출부는 반환값만 보면 됩니다. 변환 중에는 `isConverting`이 참입니다.
 * @returns `isConverting` 플래그와 `pickImageFile(file)` 함수
 * @public
 */
export function usePickImageFile() {
  const [isConverting, setIsConverting] = useState(false);

  async function pickImageFile(file: File): Promise<File | null> {
    if (file.size > MAX_FILE_SIZE) {
      toast.error('파일 크기 초과', {
        description: '5MB 이하의 파일만 업로드할 수 있습니다.',
      });
      return null;
    }

    const header = await file.slice(0, 12).arrayBuffer();
    const realMime = detectMimeType(header);

    if (!realMime || !SUPPORTED_MIMES.has(realMime)) {
      toast.error('유효하지 않은 이미지 파일입니다', {
        description:
          '파일 확장자만 변경된 경우 원본 형식(JPG, PNG, GIF, WebP)의 이미지를 사용해주세요.',
      });
      return null;
    }

    if (realMime !== 'image/heic') {
      return file.type === realMime
        ? file
        : new File([file], file.name, { type: realMime });
    }

    setIsConverting(true);
    try {
      return await convertHeicToJpeg(file);
    } catch {
      toast.error('HEIC 변환 실패', {
        description:
          'HEIC 파일을 JPEG으로 변환할 수 없습니다. 다른 이미지를 사용해주세요.',
      });
      return null;
    } finally {
      setIsConverting(false);
    }
  }

  return { isConverting, pickImageFile };
}
