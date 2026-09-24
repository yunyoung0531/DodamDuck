import { isSameDay, isSameMinute } from '@/libs/format-date';
import type { ChatMessage } from '@/services/chat/chat.types';

export interface MessageRow {
  message: ChatMessage;
  showDateDivider: boolean;
  isFirstInGroup: boolean;
  isLastInGroup: boolean;
}

/**
 * @description 메시지 목록에 날짜 구분선과 묶음 정보를 채웁니다.
 *
 * @remarks
 * 같은 사람이 같은 분에 연달아 보낸 메시지를 하나의 묶음으로 봅니다. 묶음마다 프로필은
 * 처음에, 시간은 마지막에 한 번만 붙여 연타한 구간이 지저분해지지 않게 합니다.
 * @param messages 오래된 것이 앞에 오도록 정렬된 메시지 목록
 * @returns 입력과 같은 순서의 행 목록
 * @internal
 */
export function buildMessageRows(messages: ChatMessage[]): MessageRow[] {
  return messages.map((message, index) => {
    const prev = messages[index - 1];
    const next = messages[index + 1];
    const sentAt = new Date(message.created_at);

    const showDateDivider =
      !prev || !isSameDay(new Date(prev.created_at), sentAt);

    const isFirstInGroup =
      showDateDivider ||
      !prev ||
      prev.sender_id !== message.sender_id ||
      !isSameMinute(new Date(prev.created_at), sentAt);

    const isLastInGroup =
      !next ||
      next.sender_id !== message.sender_id ||
      !isSameMinute(new Date(next.created_at), sentAt);

    return { message, showDateDivider, isFirstInGroup, isLastInGroup };
  });
}
