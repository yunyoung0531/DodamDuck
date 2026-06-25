'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Camera } from 'lucide-react';
import { Label } from '@/components/ui/label';

interface ImageUploadFieldProps {
  label: string;
  onFileSelect: (file: File) => void;
  accept?: string;
}

export function ImageUploadField({
  label,
  onFileSelect,
  accept = 'image/jpeg,image/png,image/gif,image/webp',
}: ImageUploadFieldProps) {
  const [preview, setPreview] = useState<string | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    onFileSelect(file);
    setPreview(URL.createObjectURL(file));
  }

  return (
    <div>
      <Label className="mb-2 block">{label}</Label>
      <label className="flex h-40 w-40 cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed border-gray-300 transition-colors hover:border-gray-400">
        {preview ? (
          <Image
            src={preview}
            alt="미리보기"
            width={160}
            height={160}
            className="h-full w-full rounded-md object-cover"
          />
        ) : (
          <div className="flex flex-col items-center gap-1">
            <Camera size={32} className="text-gray-400" />
            <span className="text-xs text-muted-foreground">사진 추가</span>
          </div>
        )}
        <input
          type="file"
          accept={accept}
          className="hidden"
          onChange={handleChange}
        />
      </label>
    </div>
  );
}
