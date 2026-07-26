'use client';

import { useRouter } from 'next/navigation';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useIsLiked, useToggleLike } from '@/services/likes/useLikes';
import { useUser } from '@/services/auth/useUser';
import { cn } from '@/lib/utils';

interface LikeButtonProps {
  postId: number;
  likeCount: number;
  size?: 'sm' | 'default';
}

export function LikeButton({
  postId,
  likeCount,
  size = 'default',
}: LikeButtonProps) {
  const router = useRouter();
  const { user } = useUser();
  const isLiked = useIsLiked(postId);
  const toggleLike = useToggleLike();

  function handleClick(e: React.MouseEvent) {
    e.stopPropagation();
    e.preventDefault();

    if (!user) {
      router.push('/signin');
      return;
    }

    toggleLike.mutate(postId);
  }

  const iconSize = size === 'sm' ? 14 : 18;

  return (
    <Button
      variant="ghost"
      size={size === 'sm' ? 'icon-sm' : 'sm'}
      className={cn(
        'gap-1',
        isLiked && 'text-red-500 hover:text-red-600'
      )}
      onClick={handleClick}
      aria-label={isLiked ? '좋아요 취소' : '좋아요'}
    >
      <Heart
        size={iconSize}
        className={cn(isLiked && 'fill-current')}
      />
      <span className="text-xs">{likeCount}</span>
    </Button>
  );
}
