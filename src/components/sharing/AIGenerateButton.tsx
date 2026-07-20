'use client';

import { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { LoadingButton } from '@/components/common/LoadingButton';
import { useGeneratePost } from '@/services/ai/useAI';
import type { UseFormSetValue } from 'react-hook-form';
import type { CreateSharingPostForm } from '@/libs/validations/sharing';

interface AIGenerateButtonProps {
  image: File | null;
  setValue: UseFormSetValue<CreateSharingPostForm>;
  setTags: (tags: string[]) => void;
}

const STATUS_MESSAGES = [
  '사진을 분석하고 있어요...',
  '장난감 정보를 파악하고 있어요...',
  'AI가 게시글을 작성하고 있어요...',
  '거의 완료됐어요...',
];

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.replace(/^data:[^;]+;base64,/, ''));
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function extractMessage(error: unknown): string {
  if (error instanceof Error) {
    const raw = error.message;
    try {
      const parsed = JSON.parse(raw) as Record<string, unknown>;
      if (typeof parsed.error === 'string') {
        return parsed.error;
      }
    } catch {
      // not JSON
    }
    return raw;
  }
  if (typeof error === 'string') {
    try {
      const parsed = JSON.parse(error) as Record<string, unknown>;
      if (typeof parsed.error === 'string') {
        return parsed.error;
      }
    } catch {
      // not JSON
    }
    return error;
  }
  return '게시글 생성에 실패했습니다';
}

function StatusProgress() {
  const [progress, setProgress] = useState(0);
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return 90;
        const remaining = 90 - prev;
        return prev + remaining * 0.08;
      });
    }, 300);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) =>
        prev < STATUS_MESSAGES.length - 1 ? prev + 1 : prev
      );
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const rounded = Math.round(progress);

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">{STATUS_MESSAGES[messageIndex]}</p>
        <span className="text-xs tabular-nums text-muted-foreground">{rounded}%</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
        <div
          className="h-full rounded-full bg-dodam-400 transition-[width] duration-300 ease-out w-[var(--progress)]"
          ref={(el) => { el?.style.setProperty('--progress', `${progress}%`); }}
        />
      </div>
    </div>
  );
}

export function AIGenerateButton({
  image,
  setValue,
  setTags,
}: AIGenerateButtonProps) {
  const generatePost = useGeneratePost();

  async function handleClick() {
    if (!image) return;

    const imageBase64 = await fileToBase64(image);

    try {
      const response = await generatePost.mutateAsync({
        imageBase64,
        mimeType: image.type,
      });
      setValue('title', response.data.title);
      setValue('content', response.data.content);
      setTags(response.data.tags);
      toast.success('AI가 게시글을 작성했습니다. 내용을 확인해주세요!');
    } catch (error) {
      toast.error(extractMessage(error));
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <LoadingButton
        type="button"
        variant="outline"
        loading={generatePost.isPending}
        disabled={!image}
        onClick={handleClick}
      >
        <Sparkles size={16} />
        AI 자동 작성
      </LoadingButton>
      {generatePost.isPending && <StatusProgress />}
    </div>
  );
}
