'use client';

import { CommentList, type Comment } from '@/components/common/CommentList';
import { CommentComposer } from '@/components/common/CommentComposer';
import { cn } from '@/lib/utils';

interface CommentSectionProps {
  comments: Comment[];
  isLoggedIn: boolean;
  onSubmit: (content: string) => void;
  isSubmitting: boolean;
  className?: string;
  onDelete?: (commentId: number) => void;
  currentUserId?: string;
  isDeletingId?: number | null;
}

export function CommentSection({
  comments,
  isLoggedIn,
  onSubmit,
  isSubmitting,
  className,
  onDelete,
  currentUserId,
  isDeletingId,
}: CommentSectionProps) {
  return (
    <div className={cn('flex flex-col gap-3', className)}>
      <p className="font-semibold">댓글</p>

      <CommentList
        comments={comments}
        onDelete={onDelete}
        currentUserId={currentUserId}
        isDeletingId={isDeletingId}
      />

      {isLoggedIn && (
        <CommentComposer onSubmit={onSubmit} isSubmitting={isSubmitting} />
      )}
    </div>
  );
}
