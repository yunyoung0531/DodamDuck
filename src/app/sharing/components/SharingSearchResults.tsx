'use client';

import { LoadingState } from '@/components/common/LoadingState';
import { SharingPostGrid } from '@/components/sharing/SharingPostGrid';
import {
  SharingEmptyState,
  type SharingEmptyStateActions,
} from '@/components/sharing/SharingEmptyState';
import { useSharingSearch } from '@/services/sharing/useSharing';
import { SHARING_CATEGORY } from '@/services/sharing/sharing.types';
import type { SharingCategory } from '@/services/sharing/sharing.types';

interface SharingSearchResultsProps {
  /** 최소 글자 수를 넘겨 실제로 검색을 실행할 검색어. 빈 문자열로 렌더하지 않는다. */
  searchTerm: string;
  category: SharingCategory;
  emptyActions: SharingEmptyStateActions;
}

/**
 * 검색 중일 때의 목록. 검색 RPC는 카테고리를 받지 않으므로 필터는 여기서 적용한다.
 */
export function SharingSearchResults({
  searchTerm,
  category,
  emptyActions,
}: SharingSearchResultsProps) {
  const { data: results, isLoading } = useSharingSearch(searchTerm);

  const posts = results?.filter(
    (post) =>
      category === SHARING_CATEGORY.ALL || post.category === category
  );

  if (isLoading) {
    return <LoadingState />;
  }

  if (!posts) {
    return null;
  }

  if (posts.length === 0) {
    return (
      <SharingEmptyState
        searchTerm={searchTerm}
        category={category}
        {...emptyActions}
      />
    );
  }

  return <SharingPostGrid posts={posts} />;
}
