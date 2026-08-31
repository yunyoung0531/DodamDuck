'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/common/PageHeader';
import { FloatingActionButton } from '@/components/common/FloatingActionButton';
import { CategoryChips } from '@/components/sharing/CategoryChips';
import { SharingPostList } from './SharingPostList';
import { SharingSearchResults } from './SharingSearchResults';
import { usePopularSearches } from '@/services/sharing/useSharing';
import {
  SHARING_CATEGORY,
  MIN_SEARCH_QUERY_LENGTH,
} from '@/services/sharing/sharing.types';
import type { SharingCategory } from '@/services/sharing/sharing.types';
import { useUser } from '@/services/auth/useUser';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';

export default function SharingContents() {
  const [inputValue, setInputValue] = useState('');
  const [category, setCategory] = useState<SharingCategory>(
    SHARING_CATEGORY.ALL
  );
  const { user } = useUser();

  const { debouncedValue: debouncedQuery, commitNow } =
    useDebouncedValue(inputValue);

  const { data: popularSearches } = usePopularSearches();

  /**
   * 검색 모드와 목록 모드를 가르는 단 하나의 조건.
   * 지운 직후 이전 검색어로 잠깐 검색되는 것을 막으려 현재 입력값도 함께 본다.
   */
  const searchTerm =
    inputValue.trim().length >= MIN_SEARCH_QUERY_LENGTH &&
    debouncedQuery.trim().length >= MIN_SEARCH_QUERY_LENGTH
      ? debouncedQuery.trim()
      : '';

  function applySearchImmediately(query: string) {
    setInputValue(query);
    commitNow(query);
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    applySearchImmediately(inputValue);
  }

  function handleResetSearch() {
    applySearchImmediately('');
  }

  function handleResetCategory() {
    setCategory(SHARING_CATEGORY.ALL);
  }

  function handleResetAll() {
    handleResetSearch();
    handleResetCategory();
  }

  const emptyActions = {
    onResetSearch: handleResetSearch,
    onResetCategory: handleResetCategory,
    onResetAll: handleResetAll,
    suggestedQueries: popularSearches?.map((item) => item.query),
    onSelectQuery: applySearchImmediately,
  };

  return (
    <div className="flex justify-center px-4 py-10">
      <div className="flex w-full max-w-6xl flex-col gap-8">
      <PageHeader
        subtitle="나눔을 통해 행복을 나누다"
        title="교환 &amp; 나눔"
      />

      <div className="flex flex-col items-center gap-6">
        <form onSubmit={handleSearch} className="w-full max-w-lg">
          <div className="relative">
            <Input
              placeholder="어떤 제품을 찾으세요?"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="pr-10"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <Search size={18} />
            </button>
          </div>
        </form>

        {popularSearches && popularSearches.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-2">
          {popularSearches.slice(0, 5).map((item) => (
            <Badge
              key={item.query}
              variant="outline"
              className="cursor-pointer"
              render={
                <button
                  type="button"
                  onClick={() => applySearchImmediately(item.query)}
                >
                  #{item.query}
                </button>
              }
            />
          ))}
          </div>
        )}

        <CategoryChips value={category} onChange={setCategory} includeAll />
      </div>

      {searchTerm ? (
        <SharingSearchResults
          searchTerm={searchTerm}
          category={category}
          emptyActions={emptyActions}
        />
      ) : (
        <SharingPostList category={category} emptyActions={emptyActions} />
      )}

      {user && (
        <FloatingActionButton href="/sharing/new" label="교환/나눔 글쓰기" />
      )}
      </div>
    </div>
  );
}
