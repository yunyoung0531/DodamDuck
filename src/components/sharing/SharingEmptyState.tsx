'use client';

import { Inbox, Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/common/EmptyState';
import { LinkButton } from '@/components/common/LinkButton';
import { SHARING_CATEGORY } from '@/services/sharing/sharing.types';
import type { SharingCategory } from '@/services/sharing/sharing.types';

/**
 * 0건일 때 조건을 되돌리는 수단들. 목록·검색 컴포넌트가 그대로 전달만 하므로
 * 하나로 묶어 중간 단계의 props 배관을 줄인다.
 */
export interface SharingEmptyStateActions {
  onResetSearch: () => void;
  onResetCategory: () => void;
  onResetAll: () => void;
  /** 검색어만 걸린 경우 대안으로 제시할 인기 검색어. */
  suggestedQueries?: string[];
  onSelectQuery?: (query: string) => void;
}

interface SharingEmptyStateProps extends SharingEmptyStateActions {
  /** 현재 적용된 검색어. 빈 문자열이면 검색 중이 아니다. */
  searchTerm: string;
  category: SharingCategory;
}

/**
 * 결과가 0건일 때, 왜 0건인지와 무엇을 하면 되는지를 함께 보여준다.
 *
 * 조건을 좁혀서 0건인 경우와 등록된 물건이 없는 경우를 구분하지 않으면
 * 사용자는 "이 서비스에 물건이 없다"로 해석한다.
 */
export function SharingEmptyState({
  searchTerm,
  category,
  onResetSearch,
  onResetCategory,
  onResetAll,
  suggestedQueries,
  onSelectQuery,
}: SharingEmptyStateProps) {
  const hasSearch = searchTerm !== '';
  const hasCategory = category !== SHARING_CATEGORY.ALL;

  // 검색어 + 카테고리 둘 다 걸린 경우 — 어느 쪽을 풀지 사용자가 고르게 한다.
  if (hasSearch && hasCategory) {
    return (
      <EmptyState
        icon={Search}
        message={`"${searchTerm}" 검색 결과가 ${category} 카테고리에 없습니다`}
        action={
          <div className="flex flex-wrap justify-center gap-2">
            <Button variant="outline" size="sm" onClick={onResetCategory}>
              전체 카테고리에서 찾기
            </Button>
            <Button variant="outline" size="sm" onClick={onResetSearch}>
              검색어 지우기
            </Button>
            <Button variant="ghost" size="sm" onClick={onResetAll}>
              조건 모두 해제
            </Button>
          </div>
        }
      />
    );
  }

  // 검색어만 걸린 경우 — 다른 검색어를 제안한다.
  if (hasSearch) {
    return (
      <EmptyState
        icon={Search}
        message={`"${searchTerm}"에 대한 결과가 없습니다`}
        action={
          <div className="flex flex-col items-center gap-4">
            {suggestedQueries && suggestedQueries.length > 0 && (
              <div className="flex flex-col items-center gap-2">
                <p className="text-xs text-muted-foreground">
                  이런 검색어는 어떠세요?
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {suggestedQueries.slice(0, 5).map((query) => (
                    <Badge
                      key={query}
                      variant="outline"
                      className="h-7 cursor-pointer px-3"
                      render={
                        <button
                          type="button"
                          onClick={() => onSelectQuery?.(query)}
                        >
                          #{query}
                        </button>
                      }
                    />
                  ))}
                </div>
              </div>
            )}
            <Button variant="outline" size="sm" onClick={onResetSearch}>
              검색어 지우기
            </Button>
          </div>
        }
      />
    );
  }

  // 카테고리만 걸린 경우 — 이 카테고리가 비어있다는 사실을 명시한다.
  if (hasCategory) {
    return (
      <EmptyState
        message={`${category} 카테고리에 아직 등록된 물건이 없습니다`}
        action={
          <div className="flex flex-wrap justify-center gap-2">
            <Button variant="outline" size="sm" onClick={onResetCategory}>
              전체 보기
            </Button>
            <LinkButton href="/sharing/new" size="sm">
              첫 글 올리기
            </LinkButton>
          </div>
        }
      />
    );
  }

  // 조건이 없는데도 0건 — 실제로 등록된 물건이 없다.
  return (
    <EmptyState
      icon={Inbox}
      message="아직 등록된 물건이 없습니다"
      action={
        <div className="flex flex-col items-center gap-3">
          <p className="text-sm text-muted-foreground">
            첫 번째 나눔을 시작해보세요
          </p>
          <LinkButton href="/sharing/new" size="sm">
            글쓰기
          </LinkButton>
        </div>
      }
    />
  );
}
