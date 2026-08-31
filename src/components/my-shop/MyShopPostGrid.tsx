'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useIncrementSharingViewCount } from '@/services/sharing/useSharing';
import type { SharingPost } from '@/services/sharing/sharing.types';

interface MyShopPostGridProps {
  posts: SharingPost[];
  /** 제목 옆에 붙일 요소. 하트 목록 탭만 좋아요 버튼을 붙인다. */
  renderAction?: (post: SharingPost) => React.ReactNode;
}

/** 내 상점의 게시글 썸네일 그리드. 상품 탭과 하트 목록 탭이 함께 쓴다. */
export function MyShopPostGrid({ posts, renderAction }: MyShopPostGridProps) {
  const incrementView = useIncrementSharingViewCount();

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
      {posts.map((post) => {
        const action = renderAction?.(post);

        return (
          <div key={post.id} className="relative isolate flex flex-col gap-2">
            <Link
              href={`/sharing/${post.id}`}
              aria-label={post.title}
              onClick={() => incrementView.mutate(post.id)}
              className="absolute inset-0 z-10 rounded-md focus-visible:outline-2 focus-visible:outline-ring focus-visible:[outline-offset:-2px]"
            />

            <div className="relative aspect-square overflow-hidden rounded-md">
              <Image
                src={post.image_url || '/images/도담덕로고.png'}
                alt={post.title}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
            {action ? (
              <div className="flex items-center justify-between">
                <p className="truncate text-sm">{post.title}</p>
                <div className="relative z-20">{action}</div>
              </div>
            ) : (
              <p className="truncate text-sm">{post.title}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
