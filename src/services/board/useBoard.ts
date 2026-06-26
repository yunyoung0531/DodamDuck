import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { boardQueries } from './queries';
import {
  servCreateBoardPost,
  servDeleteBoardPost,
  servIncrementBoardViewCount,
  servAddBoardComment,
} from './board-services';
import type {
  CreateBoardPostRequest,
  AddBoardCommentRequest,
} from './board.types';

export function useBoardList() {
  return useQuery(boardQueries.all());
}

export function useBoardDetail(postId: number) {
  return useQuery(boardQueries.detail(postId));
}

export function useCreateBoardPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateBoardPostRequest) =>
      servCreateBoardPost(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board'] });
    },
  });
}

export function useDeleteBoardPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: number) => servDeleteBoardPost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board'] });
    },
  });
}

export function useIncrementBoardViewCount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: number) => servIncrementBoardViewCount(postId),
    onSuccess: (_data, postId) => {
      queryClient.invalidateQueries({ queryKey: ['board', 'list'] });
      queryClient.invalidateQueries({
        queryKey: ['board', 'detail', postId],
      });
    },
  });
}

export function useAddBoardComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: AddBoardCommentRequest) =>
      servAddBoardComment(request),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['board', 'detail', variables.postId],
      });
    },
  });
}
