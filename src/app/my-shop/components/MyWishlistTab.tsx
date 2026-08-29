'use client';

import { LoadingState } from '@/components/common/LoadingState';
import { EmptyState } from '@/components/common/EmptyState';
import { LikeButton } from '@/components/common/LikeButton';
import { MyShopPostGrid } from '@/components/my-shop/MyShopPostGrid';
import { useUserLikedSharingPosts } from '@/services/likes/useLikes';

/** 내가 좋아요한 교환·나눔 게시글. */
export function MyWishlistTab() {
  const { data: likedPosts, isLoading } = useUserLikedSharingPosts();

  if (isLoading) {
    return <LoadingState height="sm" />;
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
