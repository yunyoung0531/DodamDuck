import { queryOptions } from '@tanstack/react-query';
import {
  servFetchUserLikedPostIds,
  servFetchUserLikedSharingPosts,
} from './likes-services';

export const likesQueries = {
  userLikedIds: () =>
    queryOptions({
      queryKey: ['likes', 'userIds'] as const,
      queryFn: () => servFetchUserLikedPostIds(),
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
    }),

  userLikedSharingPosts: () =>
    queryOptions({
      queryKey: ['likes', 'userPosts', 'sharing'] as const,
      queryFn: () => servFetchUserLikedSharingPosts(),
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
    }),
};
