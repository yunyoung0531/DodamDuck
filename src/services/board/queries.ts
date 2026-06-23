import { queryOptions } from '@tanstack/react-query';
import {
  servFetchBoardPosts,
  servFetchBoardDetail,
} from './board-services';

export const boardQueries = {
  all: () =>
    queryOptions({
      queryKey: ['board', 'list'] as const,
      queryFn: servFetchBoardPosts,
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
    }),

  detail: (postId: number) =>
    queryOptions({
      queryKey: ['board', 'detail', postId] as const,
      queryFn: () => servFetchBoardDetail(postId),
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
    }),
};
