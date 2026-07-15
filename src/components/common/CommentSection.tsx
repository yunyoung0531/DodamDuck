'use client';

import { useState } from 'react';
import { Send, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { LoadingButton } from '@/components/common/LoadingButton';
import { EmptyState } from '@/components/common/EmptyState';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { cn } from '@/lib/utils';
import { formatTimeSince } from '@/libs/format-date';

interface Comment {
  id: number;
  user_id?: string;
  content: string;
  created_at: string;
  profiles: {
    display_name: string;
  };
}

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
  const [comment, setComment] = useState('');

  function handleSubmit() {
    if (!comment.trim()) return;
    onSubmit(comment);
    setComment('');
  }

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      <p className="font-semibold">댓글</p>
      <ScrollArea className="scrollbar-brand h-75">
        <div className="flex flex-col gap-3">
          {comments.map((c) => (
            <div key={c.id} className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold">
                    {c.profiles.display_name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatTimeSince(c.created_at)}
                  </p>
                </div>
                {onDelete && currentUserId && c.user_id === currentUserId && (
                  <ConfirmDialog
                    trigger={
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="text-destructive hover:text-destructive/80"
                        disabled={isDeletingId === c.id}
                      >
                        <X size={8} />
                      </Button>
                    }
                    title="댓글 삭제"
                    description="이 댓글을 삭제하시겠습니까?"
                    onConfirm={() => onDelete(c.id)}
                    isLoading={isDeletingId === c.id}
                  />
                )}
              </div>
              <p className="text-sm">{c.content}</p>
            </div>
          ))}
          {comments.length === 0 && (
            <EmptyState
              message="아직 댓글이 없습니다."
              iconSize={32}
              className="py-6"
            />
          )}
        </div>
      </ScrollArea>

      {isLoggedIn && (
        <div className="flex gap-2 pt-1">
          <Input
            placeholder="댓글을 입력해주세요."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="flex-1"
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSubmit();
            }}
          />
          <LoadingButton
            size="icon"
            onClick={handleSubmit}
            loading={isSubmitting}
          >
            <Send size={16} />
          </LoadingButton>
        </div>
      )}
    </div>
  );
}
