'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useIncrementSharingViewCount } from '@/services/sharing/useSharing';
import type { SharingPost } from '@/services/sharing/sharing.types';

interface MyShopPostGridProps {
  posts: SharingPost[];
  /** 제목 옆에 붙일 요소. 하트 목록 탭만 좋아요 버튼을 붙인다. */
  renderAction?: (post: SharingPost) => React.ReactNode;
}

/** 내 상점의 게시글 썸네일 그리드. 상품 탭과 하트 목록 탭이 함께 쓴다. */
export function MyShopPostGrid({ posts, renderAction }: MyShopPostGridProps) {
  const router = useRouter();
  const incrementView = useIncrementSharingViewCount();

  function handleClick(postId: number) {
    incrementView.mutate(postId);
    router.push(`/sharing/${postId}`);
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
      {posts.map((post) => {
        const action = renderAction?.(post);

        return (
          <div
            key={post.id}
            className="flex cursor-pointer flex-col gap-2"
            onClick={() => handleClick(post.id)}
          >
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
                {action}
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
