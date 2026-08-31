'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { LikeButton } from '@/components/common/LikeButton';
import { formatTimeSince } from '@/libs/format-date';
import type { SharingPost } from '@/services/sharing/sharing.types';

function SharingPostCard({ post }: { post: SharingPost }) {
  return (
    <div className="relative isolate overflow-hidden rounded-lg border bg-card transition-all hover:-translate-y-1 hover:shadow-lg">
      <Link
        href={`/sharing/${post.id}`}
        aria-label={post.title}
        className="absolute inset-0 z-10 focus-visible:outline-2 focus-visible:outline-ring focus-visible:[outline-offset:-2px]"
      />

      <div className="relative h-48">
        <Image
          src={post.image_url || '/images/도담덕로고.png'}
          alt={post.title}
          fill
          className="object-cover"
          unoptimized
        />
      </div>

      <div className="flex flex-col gap-2 p-3">
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <p className="truncate text-sm font-semibold">{post.title}</p>
            <div className="relative z-20">
              <LikeButton
                postId={post.id}
                likeCount={post.like_count}
                size="sm"
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            {post.location} · {formatTimeSince(post.created_at)} · 조회{' '}
            {post.views}
          </p>
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex flex-wrap gap-1">
            <Badge variant="secondary">{post.exchange_option}</Badge>
            <Badge variant="outline">{post.category}</Badge>
          </div>
          {post.tags && post.tags.length > 0 && (
            <div className="flex gap-1">
              {post.tags.map((tag) => (
                <span key={tag} className="text-xs text-muted-foreground">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/** 교환·나눔 게시글 카드 그리드. 목록 모드와 검색 모드가 함께 쓴다. */
export function SharingPostGrid({ posts }: { posts: SharingPost[] }) {
  return (
    <div className="grid grid-cols-1 gap-6 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4">
      {posts.map((post) => (
        <SharingPostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
