import {
  CHAT_REACTION_EMOJIS,
  type ChatReaction,
  type ReactionSummary,
} from '@/services/chat/chat.types';

/**
 * @description 리액션 목록을 이모지별로 묶어 칩에 그릴 집계를 만듭니다.
 *
 * @remarks
 * `CHAT_REACTION_EMOJIS`에서 빠진 이모지도 버리지 않고 뒤에 붙입니다. 세트를 바꿨을 때
 * 이미 달린 리액션이 화면에서 사라지면 취소할 방법이 없어집니다.
 * @param reactions 한 메시지에 달린 리액션 전부
 * @param currentUserId 현재 사용자 id. 각 묶음의 `isMine`을 정합니다
 * @returns 개수가 1 이상인 묶음만. 피커 순서를 먼저 따릅니다
 * @see docs/implementation-notes/chat.md 칩을 누른 순서로 정렬하지 않는 이유
 * @internal
 */
export function toReactionSummaries(
  reactions: ChatReaction[],
  currentUserId: string
): ReactionSummary[] {
  const pickerEmojis: readonly string[] = CHAT_REACTION_EMOJIS;
  const seen = [...new Set(reactions.map((reaction) => reaction.emoji))];
  const ordered = [
    ...pickerEmojis.filter((emoji) => seen.includes(emoji)),
    ...seen.filter((emoji) => !pickerEmojis.includes(emoji)),
  ];

  return ordered.map((emoji) => {
    const matched = reactions.filter((reaction) => reaction.emoji === emoji);

    return {
      emoji,
      count: matched.length,
      isMine: matched.some((reaction) => reaction.user_id === currentUserId),
    };
  });
}
