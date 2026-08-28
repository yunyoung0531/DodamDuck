import { queryOptions, keepPreviousData } from '@tanstack/react-query';
import {
  servFetchSharingPosts,
  servFetchSharingDetail,
  servSearchSharingPosts,
  servFetchPopularSearches,
} from './sharing-services';
import { MIN_SEARCH_QUERY_LENGTH } from './sharing.types';
import type { SharingPostCategory } from './sharing.types';

export const sharingQueries = {
  all: (category?: SharingPostCategory) =>
    queryOptions({
      queryKey: ['sharing', 'list', category ?? null] as const,
      queryFn: () => servFetchSharingPosts(category),
      placeholderData: keepPreviousData,
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
    }),

  detail: (postId: number) =>
    queryOptions({
      queryKey: ['sharing', 'detail', postId] as const,
      queryFn: () => servFetchSharingDetail(postId),
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
    }),

  search: (query: string) =>
    queryOptions({
      queryKey: ['sharing', 'search', query] as const,
      queryFn: () => servSearchSharingPosts(query),
      enabled: query.trim().length >= MIN_SEARCH_QUERY_LENGTH,
      // 검색어가 바뀌는 동안 이전 결과를 유지해 목록이 빈 화면으로 깜빡이지 않게 한다.
      placeholderData: keepPreviousData,
      staleTime: 60 * 1000,
      gcTime: 5 * 60 * 1000,
    }),

  popularSearches: () =>
    queryOptions({
      queryKey: ['sharing', 'popularSearches'] as const,
      queryFn: () => servFetchPopularSearches(),
      staleTime: 10 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
    }),
};
