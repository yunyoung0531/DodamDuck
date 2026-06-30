'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { LoadingState } from '@/components/common/LoadingState';
import { EmptyState } from '@/components/common/EmptyState';
import { PageHeader } from '@/components/common/PageHeader';
import { FloatingActionButton } from '@/components/common/FloatingActionButton';
import { useBoardList } from '@/services/board/useBoard';
import { useUser } from '@/services/auth/useUser';
import { formatTimeSince } from '@/libs/format-date';

export default function BoardContents() {
  const router = useRouter();
  const { user } = useUser();
  const { data: posts, isLoading } = useBoardList();

  return (
    <div className="flex justify-center px-4 py-10">
      <div className="flex w-full max-w-4xl flex-col gap-8">
      <PageHeader
        subtitle="나눔을 통해 행복을 나누다"
        title="도담덕 정보 나눔"
      />

      {isLoading && <LoadingState />}

      {posts && posts.length > 0 && (
        <div className="flex flex-col gap-4">
          {posts.map((post) => (
            <div
              key={post.id}
              className="flex cursor-pointer items-center gap-5 rounded-md border border-gray-200 bg-white p-4 transition-all hover:-translate-y-0.5 hover:shadow-lg"
              onClick={() => router.push(`/board/${post.id}`)}
            >
              <div className="relative h-32 w-44 shrink-0 overflow-hidden rounded-md">
                <Image
                  src={post.image_url || '/images/도담덕로고.png'}
                  alt={post.title}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
              <div className="flex flex-1 flex-col gap-2">
                <div className="flex flex-col gap-1">
                  <p className="truncate text-lg font-semibold">{post.title}</p>
                  <p className="text-sm text-muted-foreground">
                    댓글 {post.comment_count}개 · {formatTimeSince(post.created_at)}{' '}
                    · 조회 {post.views}
                  </p>
                </div>
                <p className="line-clamp-2 text-sm text-muted-foreground">
                  {post.content}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {posts && posts.length === 0 && (
        <EmptyState message="게시글이 없습니다." />
      )}

      {user && (
        <FloatingActionButton href="/board/new" label="게시판 글쓰기" />
      )}
      </div>
    </div>
  );
}
