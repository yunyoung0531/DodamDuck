'use client';

import { Badge } from '@/components/ui/badge';
import {
  SHARING_CATEGORY,
  SHARING_CATEGORY_VALUES,
} from '@/services/sharing/sharing.types';
import type { SharingCategory } from '@/services/sharing/sharing.types';

interface CategoryChipsProps {
  value: SharingCategory | undefined;
  onChange: (category: SharingCategory) => void;
  /** 목록 필터용. 필터 해제를 뜻하는 `전체` 칩을 앞에 붙인다. */
  includeAll?: boolean;
  /**
   * 이 묶음을 설명하는 라벨의 id. 칩은 각자 button이라 `htmlFor`로는 묶을 수 없어,
   * 그룹 전체를 `aria-labelledby`로 가리킨다.
   */
  'aria-labelledby'?: string;
}

export function CategoryChips({
  value,
  onChange,
  includeAll,
  'aria-labelledby': ariaLabelledBy,
}: CategoryChipsProps) {
  const categories: readonly SharingCategory[] = includeAll
    ? [SHARING_CATEGORY.ALL, ...SHARING_CATEGORY_VALUES]
    : SHARING_CATEGORY_VALUES;

  return (
    <div
      role="group"
      aria-labelledby={ariaLabelledBy}
      className="flex flex-wrap gap-2"
    >
      {categories.map((category) => {
        const isSelected = value === category;

        return (
          <Badge
            key={category}
            variant={isSelected ? 'default' : 'outline'}
            className="h-7 cursor-pointer px-3"
            render={
              <button
                type="button"
                aria-pressed={isSelected}
                onClick={() => onChange(category)}
              />
            }
          >
            {category}
          </Badge>
        );
      })}
    </div>
  );
}
