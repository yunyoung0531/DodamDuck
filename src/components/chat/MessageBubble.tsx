'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDateTime, formatTimeSince } from '@/libs/format-date';
import { ReactionChips } from './ReactionChips';
import { ReactionPicker } from './ReactionPicker';
import { toReactionSummaries } from './reaction-summaries';
import type { ChatMessage } from '@/services/chat/chat.types';

export interface MessageBubbleProps {
  message: ChatMessage;
  isMine: boolean;
  isFirstInGroup: boolean;
  isLastInGroup: boolean;
  currentUserId: string;
  partnerName: string;
  partnerProfileUrl: string | null;
  onToggleReaction: (messageId: number, emoji: string, isMine: boolean) => void;
}

/**
 * @description 메시지 한 건을 말풍선과 리액션으로 그립니다.
 *
 * @remarks
 * 내 메시지에는 리액션을 달 수 없습니다. 추가 버튼을 감추고 달린 칩도 표시 전용으로 둡니다.
 * 루트에 `group` 클래스를 두어 상대 메시지에서 호버할 때만 추가 버튼이 드러납니다.
 * @internal
 * @name MessageBubble
 * @tag div
 */
export function MessageBubble({
  message,
  isMine,
  isFirstInGroup,
  isLastInGroup,
  currentUserId,
  partnerName,
  partnerProfileUrl,
  onToggleReaction,
}: MessageBubbleProps) {
  const reactions = message.chat_message_reactions ?? [];
  const summaries = toReactionSummaries(reactions, currentUserId);
  const myEmojis = reactions
    .filter((reaction) => reaction.user_id === currentUserId)
    .map((reaction) => reaction.emoji);

  function handleToggle(emoji: string, wasMine: boolean) {
    onToggleReaction(message.id, emoji, wasMine);
  }

  const sentAt = isLastInGroup ? (
    <SentAt createdAt={message.created_at} />
  ) : null;

  return (
    <div
      className={`group flex items-end gap-2 ${isMine ? 'justify-end' : 'justify-start'}`}
    >
      {!isMine && (
        <PartnerAvatar
          show={isFirstInGroup}
          name={partnerName}
          profileUrl={partnerProfileUrl}
        />
      )}

      <div
        className={`flex max-w-[70%] flex-col gap-1 ${isMine ? 'items-end' : 'items-start'}`}
      >
        {/* 시간은 말풍선과 같은 줄에 둔다. 바깥 열에 두면 아래 리액션 줄에 끌려 내려간다. */}
        <div
          className={`flex items-end gap-1 ${isMine ? 'flex-row-reverse' : ''}`}
        >
          <div
            className={`px-4 py-2 ${
              isMine
                ? 'chat-bubble-me bg-dodam-yellow text-white'
                : 'chat-bubble-partner bg-gray-100 text-gray-800'
            }`}
          >
            <p className="text-sm break-words whitespace-pre-wrap">
              {message.message}
            </p>
          </div>

          {sentAt}
        </div>

        {(summaries.length > 0 || !isMine) && (
          <div className="flex items-center gap-1">
            <ReactionChips
              summaries={summaries}
              onToggle={handleToggle}
              readOnly={isMine}
            />
            {!isMine && (
              <ReactionPicker myEmojis={myEmojis} onSelect={handleToggle} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/** 말풍선 옆 시간 라벨. 마우스를 올리면 정확한 시각을 보여줍니다. */
function SentAt({ createdAt }: { createdAt: string }) {
  return (
    <time
      dateTime={createdAt}
      title={formatDateTime(createdAt)}
      className="shrink-0 pb-0.5 text-[0.625rem] leading-none text-muted-foreground"
    >
      {formatTimeSince(createdAt)}
    </time>
  );
}

interface PartnerAvatarProps {
  show: boolean;
  name: string;
  profileUrl: string | null;
}

/** 묶음의 첫 메시지에만 프로필을 보여주고, 나머지는 같은 크기의 빈 자리로 줄을 맞춥니다. */
function PartnerAvatar({ show, name, profileUrl }: PartnerAvatarProps) {
  if (!show) return <div className="h-8 w-8 shrink-0" aria-hidden="true" />;

  return (
    <Avatar className="h-8 w-8 shrink-0">
      <AvatarImage src={profileUrl || undefined} alt="" />
      <AvatarFallback>{name[0] ?? '?'}</AvatarFallback>
    </Avatar>
  );
}
