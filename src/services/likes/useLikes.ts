import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { likesQueries } from './queries';
import { servToggleLike } from './likes-services';
import { useUser } from '@/services/auth/useUser';
import type { SharingPost, SharingDetailResponse } from '@/services/sharing/sharing.types';

export function useUserLikedIds() {
  const { user } = useUser();

  return useQuery({
    ...likesQueries.userLikedIds(),
    enabled: !!user,
  });
}

export function useIsLiked(postId: number) {
  const { data: likedIds } = useUserLikedIds();
  return likedIds?.includes(postId) ?? false;
}

export function useToggleLike() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: number) => servToggleLike(postId),
    onMutate: async (postId) => {
      await queryClient.cancelQueries({
        queryKey: likesQueries.userLikedIds().queryKey,
      });

      const previousIds = queryClient.getQueryData<number[]>(
        likesQueries.userLikedIds().queryKey
      );

      const wasLiked = previousIds?.includes(postId) ?? false;
      const delta = wasLiked ? -1 : 1;

      queryClient.setQueryData<number[]>(
        likesQueries.userLikedIds().queryKey,
        (old) => {
          if (!old) return wasLiked ? [] : [postId];
          return wasLiked
            ? old.filter((id) => id !== postId)
            : [...old, postId];
        }
      );

      queryClient.setQueriesData<SharingPost[]>(
        { queryKey: ['sharing', 'list'] },
        (old) =>
          old?.map((post) =>
            post.id === postId
              ? { ...post, like_count: Math.max(0, post.like_count + delta) }
              : post
          )
      );

      queryClient.setQueriesData<SharingDetailResponse>(
        { queryKey: ['sharing', 'detail', postId] },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            post: {
              ...old.post,
              like_count: Math.max(0, old.post.like_count + delta),
            },
          };
        }
      );

      return { previousIds };
    },
    onError: (_err, _postId, context) => {
      if (context?.previousIds !== undefined) {
        queryClient.setQueryData(
          likesQueries.userLikedIds().queryKey,
          context.previousIds
        );
      }
      queryClient.invalidateQueries({ queryKey: ['sharing', 'list'] });
      queryClient.invalidateQueries({ queryKey: ['sharing', 'detail'] });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['likes'] });
      queryClient.invalidateQueries({ queryKey: ['sharing', 'list'] });
    },
  });
}

export function useUserLikedSharingPosts() {
  const { user } = useUser();

  return useQuery({
    ...likesQueries.userLikedSharingPosts(),
    enabled: !!user,
  });
}
