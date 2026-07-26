'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { LoadingState } from '@/components/common/LoadingState';
import { EmptyState } from '@/components/common/EmptyState';
import { PageHeader } from '@/components/common/PageHeader';
import { FloatingActionButton } from '@/components/common/FloatingActionButton';
import { LikeButton } from '@/components/common/LikeButton';
import {
  useSharingList,
  useSharingSearch,
  usePopularSearches,
} from '@/services/sharing/useSharing';
import { useUser } from '@/services/auth/useUser';
import { formatTimeSince } from '@/libs/format-date';

export default function SharingContents() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const router = useRouter();
  const { user } = useUser();

  const { data: posts, isLoading } = useSharingList();
  const { data: searchResults } = useSharingSearch(activeSearch);
  const { data: popularSearches } = usePopularSearches();

  const displayPosts = activeSearch ? searchResults : posts;

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setActiveSearch(searchQuery);
  }

  return (
    <div className="flex justify-center px-4 py-10">
      <div className="flex w-full max-w-6xl flex-col gap-8">
      <PageHeader
        subtitle="나눔을 통해 행복을 나누다"
        title="교환 &amp; 나눔"
      />

      <div className="flex flex-col items-center gap-6">
        <form onSubmit={handleSearch} className="w-full max-w-lg">
          <div className="relative">
            <Input
              placeholder="어떤 제품을 찾으세요?"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <Search size={18} />
            </button>
          </div>
        </form>

        {popularSearches && popularSearches.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-2">
          {popularSearches.slice(0, 5).map((item) => (
            <Badge
              key={item.query}
              variant="outline"
              className="cursor-pointer"
              onClick={() => {
                setSearchQuery(item.query);
                setActiveSearch(item.query);
              }}
            >
              #{item.query}
            </Badge>
          ))}
          </div>
        )}
      </div>

      {isLoading && <LoadingState />}

      {displayPosts && displayPosts.length > 0 && (
        <div className="grid grid-cols-1 gap-6 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4">
          {displayPosts.map((post) => (
            <div
              key={post.id}
              className="cursor-pointer overflow-hidden rounded-lg border bg-card transition-all hover:-translate-y-1 hover:shadow-lg"
              onClick={() => router.push(`/sharing/${post.id}`)}
            >
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
                    <LikeButton
                      postId={post.id}
                      likeCount={post.like_count}
                      size="sm"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {post.location} · {formatTimeSince(post.created_at)} · 조회{' '}
                    {post.views}
                  </p>
                </div>
                <div className="flex flex-col gap-1">
                  <Badge variant="secondary">
                    {post.exchange_option}
                  </Badge>
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
          ))}
        </div>
      )}

      {displayPosts && displayPosts.length === 0 && (
        <EmptyState message="게시글이 없습니다." />
      )}

      {user && (
        <FloatingActionButton href="/sharing/new" label="교환/나눔 글쓰기" />
      )}
      </div>
    </div>
  );
}
