'use client';

import { Fragment, useMemo } from 'react';
import { MessageCircle } from 'lucide-react';
import { EmptyState } from '@/components/common/EmptyState';
import { formatDateDivider } from '@/libs/format-date';
import { useNow } from '@/libs/use-now';
import { useToggleReaction } from '@/services/chat/useChat';
import { DateDivider } from './DateDivider';
import { MessageBubble } from './MessageBubble';
import { buildMessageRows } from './message-rows';
import type { ChatMessage } from '@/services/chat/chat.types';

/** 상대 시간 라벨을 다시 계산하는 주기 */
const TIME_LABEL_REFRESH_MS = 60 * 1000;

export interface MessageListProps {
  messages: ChatMessage[];
  roomId: number;
  currentUserId: string;
  partnerName: string;
  partnerProfileUrl: string | null;
}

/**
 * @description 메시지 목록을 날짜 구분선과 함께 그립니다.
 *
 * @remarks
 * 1분마다 리렌더하여 상대 시간 라벨을 다시 계산합니다. 리액션 토글은 이 컴포넌트가
 * 소유하므로 호출부는 데이터만 넘기면 됩니다.
 * @see docs/implementation-notes/chat.md 행 계산을 메모이제이션하는 이유
 * @internal
 * @name MessageList
 * @tag div
 */
export function MessageList({
  messages,
  roomId,
  currentUserId,
  partnerName,
  partnerProfileUrl,
}: MessageListProps) {
  useNow(TIME_LABEL_REFRESH_MS);

  const toggleReaction = useToggleReaction(roomId, currentUserId);

  const rows = useMemo(() => buildMessageRows(messages), [messages]);

  function handleToggleReaction(
    messageId: number,
    emoji: string,
    isMine: boolean
  ) {
    toggleReaction.mutate({ messageId, roomId, emoji, isMine });
  }

  if (messages.length === 0) {
    return (
      <EmptyState
        icon={MessageCircle}
        iconSize={40}
        message="대화를 시작해보세요"
        className="py-10"
      />
    );
  }

  return (
    <div className="flex flex-col gap-1">
      {rows.map((row) => (
        <Fragment key={row.message.id}>
          {row.showDateDivider && (
            <DateDivider label={formatDateDivider(row.message.created_at)} />
          )}
          <MessageBubble
            message={row.message}
            isMine={row.message.sender_id === currentUserId}
            isFirstInGroup={row.isFirstInGroup}
            isLastInGroup={row.isLastInGroup}
            currentUserId={currentUserId}
            partnerName={partnerName}
            partnerProfileUrl={partnerProfileUrl}
            onToggleReaction={handleToggleReaction}
          />
        </Fragment>
      ))}
    </div>
  );
}
