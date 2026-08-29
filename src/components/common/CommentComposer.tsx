'use client';

import { useState } from 'react';
import { Send } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { LoadingButton } from '@/components/common/LoadingButton';

interface CommentComposerProps {
  onSubmit: (content: string) => void;
  isSubmitting: boolean;
}

/** 댓글 입력. 로그인한 사용자에게만 마운트되므로 인증 분기를 알 필요가 없다. */
export function CommentComposer({
  onSubmit,
  isSubmitting,
}: CommentComposerProps) {
  const [comment, setComment] = useState('');

  function handleSubmit() {
    if (!comment.trim()) return;
    onSubmit(comment);
    setComment('');
  }

  return (
    <div className="flex gap-2 pt-1">
      <Input
        placeholder="댓글을 입력해주세요."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        className="flex-1"
        onKeyDown={(e) => {
          // 한글 조합 중 Enter는 조합 확정이므로 제출로 보지 않는다.
          if (e.key === 'Enter' && !e.nativeEvent.isComposing) handleSubmit();
        }}
      />
      <LoadingButton size="icon" onClick={handleSubmit} loading={isSubmitting}>
        <Send size={16} />
      </LoadingButton>
    </div>
  );
}
