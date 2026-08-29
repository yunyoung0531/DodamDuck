'use client';

import { LoadingState } from '@/components/common/LoadingState';
import { SharingPostGrid } from '@/components/sharing/SharingPostGrid';
import {
  SharingEmptyState,
  type SharingEmptyStateActions,
} from '@/components/sharing/SharingEmptyState';
import { useSharingList } from '@/services/sharing/useSharing';
import { SHARING_CATEGORY } from '@/services/sharing/sharing.types';
import type { SharingCategory } from '@/services/sharing/sharing.types';

interface SharingPostListProps {
  category: SharingCategory;
  emptyActions: SharingEmptyStateActions;
}

/**
 * 검색 중이 아닐 때의 목록. 카테고리 필터는 서버에서 적용한다.
 */
export function SharingPostList({
  category,
  emptyActions,
}: SharingPostListProps) {
  const categoryFilter =
    category === SHARING_CATEGORY.ALL ? undefined : category;

  const { data: posts, isLoading } = useSharingList(categoryFilter);

  if (isLoading) {
    return <LoadingState />;
  }

  if (!posts) {
    return null;
  }

  if (posts.length === 0) {
    return (
      <SharingEmptyState searchTerm="" category={category} {...emptyActions} />
    );
  }

  return <SharingPostGrid posts={posts} />;
}
