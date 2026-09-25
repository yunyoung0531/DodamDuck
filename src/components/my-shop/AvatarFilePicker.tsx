'use client';

import { useRef } from 'react';
import { Camera } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Spinner } from '@/components/common/Spinner';

/** 실제 MIME까지 검사하므로 확장자는 넉넉히 받는다. */
const ACCEPT =
  'image/jpeg,image/png,image/gif,image/webp,image/heic,.heic,.heif';

/** 지름 하나가 바뀌면 글자와 아이콘도 같이 바뀐다. 따로 받지 않고 묶어 둔다. */
const SIZES = {
  md: { root: 'h-24 w-24', fallback: 'text-xl', camera: 'size-6' },
  lg: { root: 'h-30 w-30', fallback: 'text-2xl', camera: 'size-8' },
} as const;

type AvatarSize = keyof typeof SIZES;

export interface AvatarFilePickerProps {
  /** 보여줄 이미지 주소. 없으면 이름 첫 글자를 씁니다. */
  src: string | undefined;
  /** 이미지가 없을 때 쓸 이름 */
  displayName: string | null;
  /** 처리 중이면 스피너를 덮고 클릭을 막습니다. */
  isProcessing: boolean;
  /** 파일을 고르면 호출됩니다. 같은 파일을 다시 골라도 호출되도록 input을 비웁니다. */
  onPick: (file: File) => void;
  /**
   * @description 아바타 크기
   * @default "md"
   */
  size?: AvatarSize;
}

/**
 * @description 눌러서 이미지를 고르는 원형 아바타입니다.
 *
 * @remarks
 * 숨긴 input을 버튼 밖에 두어 버튼 안에 상호작용 요소가 중첩되지 않게 합니다.
 * @internal
 * @name AvatarFilePicker
 * @tag div
 */
export function AvatarFilePicker({
  src,
  displayName,
  isProcessing,
  onPick,
  size = 'md',
}: AvatarFilePickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const style = SIZES[size];

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (file) onPick(file);
  }

  return (
    <div className={`relative ${style.root}`}>
      <button
        type="button"
        onClick={() => !isProcessing && inputRef.current?.click()}
        disabled={isProcessing}
        aria-label="프로필 사진 변경"
        className={`group relative cursor-pointer rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${style.root}`}
      >
        <Avatar className={style.root}>
          <AvatarImage src={src} />
          <AvatarFallback className={style.fallback}>
            {displayName?.[0] ?? '?'}
          </AvatarFallback>
        </Avatar>

        {isProcessing ? (
          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50">
            <Spinner size={size} className="text-white" />
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/0 transition-colors group-hover:bg-black/40">
            <Camera className={`${style.camera} text-white opacity-0 transition-opacity group-hover:opacity-100`} />
          </div>
        )}
      </button>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        className="hidden"
        onChange={handleChange}
      />
    </div>
  );
}
