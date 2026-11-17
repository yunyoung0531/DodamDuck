'use client';

import { LoadingState } from '@/components/common/LoadingState';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorState } from '@/components/common/ErrorState';
import { LikeButton } from '@/components/common/LikeButton';
import { MyShopPostGrid } from '@/components/my-shop/MyShopPostGrid';
import { useUserLikedSharingPosts } from '@/services/likes/useLikes';
import { getErrorMessage } from '@/libs/error-message';

/** 내가 좋아요한 교환/나눔 게시글 */
export function MyWishlistTab() {
  const {
    data: likedPosts,
    isLoading,
    isError,
    error,
    refetch,
  } = useUserLikedSharingPosts();

  if (isLoading) {
    return <LoadingState height="sm" />;
  }

  if (isError && !likedPosts) {
    return (
      <ErrorState
        message={getErrorMessage(error)}
        onRetry={() => refetch()}
        className="py-8"
      />
    );
  }

  if (!likedPosts || likedPosts.length === 0) {
    return (
      <EmptyState message="좋아요한 게시글이 없습니다." className="py-8" />
    );
  }

  return (
    <MyShopPostGrid
      posts={likedPosts}
      renderAction={(post) => (
        <LikeButton postId={post.id} likeCount={post.like_count} size="sm" />
      )}
    />
  );
}
