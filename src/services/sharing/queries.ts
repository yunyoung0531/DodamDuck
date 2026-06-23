import { queryOptions } from '@tanstack/react-query';
import {
  servFetchSharingPosts,
  servFetchSharingDetail,
  servSearchSharingPosts,
  servFetchPopularSearches,
} from './sharing-services';

export const sharingQueries = {
  all: () =>
    queryOptions({
      queryKey: ['sharing', 'list'] as const,
      queryFn: () => servFetchSharingPosts(),
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
      enabled: query.length > 0,
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
