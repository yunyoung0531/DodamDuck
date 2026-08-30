'use client';

import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { EmptyState } from '@/components/common/EmptyState';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { formatTimeSince } from '@/libs/format-date';

export interface PostComment {
  id: number;
  user_id?: string;
  content: string;
  created_at: string;
  profiles: {
    display_name: string;
  };
}

interface CommentListProps {
  comments: PostComment[];
  onDelete?: (commentId: number) => void;
  currentUserId?: string;
  isDeletingId?: number | null;
}

export function CommentList({
  comments,
  onDelete,
  currentUserId,
  isDeletingId,
}: CommentListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [comments.length]);

  return (
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
        <div ref={bottomRef} />
        {comments.length === 0 && (
          <EmptyState
            message="아직 댓글이 없습니다."
            iconSize={32}
            className="py-6"
          />
        )}
      </div>
    </ScrollArea>
  );
}
