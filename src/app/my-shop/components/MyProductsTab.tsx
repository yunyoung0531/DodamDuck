'use client';

import { LoadingState } from '@/components/common/LoadingState';
import { EmptyState } from '@/components/common/EmptyState';
import { MyShopPostGrid } from '@/components/my-shop/MyShopPostGrid';
import { useSharingList } from '@/services/sharing/useSharing';

interface MyProductsTabProps {
  userId: string;
}

/** 내가 등록한 교환·나눔 게시글. */
export function MyProductsTab({ userId }: MyProductsTabProps) {
  const { data: allPosts, isLoading } = useSharingList();
  const myPosts = allPosts?.filter((post) => post.user_id === userId);

  if (isLoading) {
    return <LoadingState height="sm" />;
  }

  if (!myPosts || myPosts.length === 0) {
    return <EmptyState message="등록한 상품이 없습니다." className="py-8" />;
  }

  return <MyShopPostGrid posts={myPosts} />;
}
