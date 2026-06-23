import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sharingQueries } from './queries';
import {
  servCreateSharingPost,
  servDeleteSharingPost,
  servIncrementSharingViewCount,
  servAddSharingComment,
} from './sharing-services';
import type {
  CreateSharingPostRequest,
  AddSharingCommentRequest,
} from './sharing.types';

export function useSharingList() {
  return useQuery(sharingQueries.all());
}

export function useSharingDetail(postId: number) {
  return useQuery(sharingQueries.detail(postId));
}

export function useSharingSearch(query: string) {
  return useQuery(sharingQueries.search(query));
}

export function usePopularSearches() {
  return useQuery(sharingQueries.popularSearches());
}

export function useCreateSharingPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateSharingPostRequest) =>
      servCreateSharingPost(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sharing'] });
    },
  });
}

export function useDeleteSharingPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: number) => servDeleteSharingPost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sharing'] });
    },
  });
}

export function useIncrementSharingViewCount() {
  return useMutation({
    mutationFn: (postId: number) => servIncrementSharingViewCount(postId),
  });
}

export function useAddSharingComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: AddSharingCommentRequest) =>
      servAddSharingComment(request),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['sharing', 'detail', variables.postId],
      });
    },
  });
}
