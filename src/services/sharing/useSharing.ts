import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { sharingQueries } from './queries';
import {
  servCreateSharingPost,
  servDeleteSharingPost,
  servIncrementSharingViewCount,
  servAddSharingComment,
  servDeleteSharingComment,
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
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: number) => servIncrementSharingViewCount(postId),
    onSuccess: (_data, postId) => {
      queryClient.invalidateQueries({ queryKey: ['sharing', 'list'] });
      queryClient.invalidateQueries({
        queryKey: ['sharing', 'detail', postId],
      });
    },
  });
}

export function useDeleteSharingComment(postId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (commentId: number) => servDeleteSharingComment(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['sharing', 'detail', postId],
      });
      toast.success('댓글이 삭제되었습니다.');
    },
    onError: (error) => {
      toast.error(`댓글 삭제 실패: ${error.message}`);
    },
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
