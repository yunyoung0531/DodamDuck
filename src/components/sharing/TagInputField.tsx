'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MAX_TAG_COUNT } from '@/services/sharing/sharing.types';

export interface TagInputFieldProps {
  /** 현재 태그 목록. 이 컴포넌트는 값을 소유하지 않습니다. */
  tags: string[];
  /** 태그가 늘거나 줄 때 새 배열로 호출됩니다. */
  onChange: (tags: string[]) => void;
}

/**
 * @description 스페이스바나 Enter로 태그를 추가하고 배지로 보여줍니다.
 *
 * @remarks
 * 빈 값, 중복, 상한 초과는 무시하고 입력만 비웁니다. 상한은 `MAX_TAG_COUNT`입니다.
 * @internal
 * @name TagInputField
 * @tag div
 */
export function TagInputField({ tags, onChange }: TagInputFieldProps) {
  const [draft, setDraft] = useState('');

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key !== ' ' && e.key !== 'Enter') return;

    e.preventDefault();
    const trimmed = draft.trim();
    const canAdd =
      trimmed !== '' && !tags.includes(trimmed) && tags.length < MAX_TAG_COUNT;

    if (canAdd) onChange([...tags, trimmed]);
    setDraft('');
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="tagInput">해시태그</Label>
        <Input
          id="tagInput"
          placeholder={`태그 입력 후 스페이스바 (최대 ${MAX_TAG_COUNT}개)`}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
        />
      </div>

      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Badge key={tag} variant="outline" className="gap-2">
              #{tag}
              <button
                type="button"
                aria-label={`${tag} 태그 삭제`}
                className="text-muted-foreground hover:text-foreground"
                onClick={() => onChange(tags.filter((t) => t !== tag))}
              >
                <X size={12} />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
