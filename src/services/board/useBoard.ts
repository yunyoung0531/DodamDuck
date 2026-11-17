import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { boardQueries } from './queries';
import {
  servCreateBoardPost,
  servDeleteBoardPost,
  servIncrementBoardViewCount,
  servAddBoardComment,
  servDeleteBoardComment,
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
    meta: { errorTitle: '글 등록 실패' },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board'] });
    },
  });
}

export function useDeleteBoardPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: number) => servDeleteBoardPost(postId),
    meta: { errorTitle: '글 삭제 실패' },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board'] });
    },
  });
}

export function useIncrementBoardViewCount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: number) => servIncrementBoardViewCount(postId),
    meta: { silent: true },
    onSuccess: (_data, postId) => {
      queryClient.invalidateQueries({ queryKey: ['board', 'list'] });
      queryClient.invalidateQueries({
        queryKey: ['board', 'detail', postId],
      });
    },
  });
}

export function useDeleteBoardComment(postId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (commentId: number) => servDeleteBoardComment(commentId),
    meta: { errorTitle: '댓글 삭제 실패' },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['board', 'detail', postId],
      });
      toast.success('댓글이 삭제되었습니다.');
    },
  });
}

export function useAddBoardComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: AddBoardCommentRequest) =>
      servAddBoardComment(request),
    meta: { errorTitle: '댓글 등록 실패' },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['board', 'detail', variables.postId],
      });
    },
  });
}
