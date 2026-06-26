'use client';

import { useState } from 'react';
import { Send } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { LoadingButton } from '@/components/common/LoadingButton';
import { EmptyState } from '@/components/common/EmptyState';
import { cn } from '@/lib/utils';
import { formatTimeSince } from '@/libs/format-date';

interface Comment {
  id: number;
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
}

export function CommentSection({
  comments,
  isLoggedIn,
  onSubmit,
  isSubmitting,
  className,
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
      <ScrollArea className="scrollbar-brand h-[300px]">
        <div className="flex flex-col gap-3">
          {comments.map((c) => (
            <div key={c.id} className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold">
                  {c.profiles.display_name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatTimeSince(c.created_at)}
                </p>
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
