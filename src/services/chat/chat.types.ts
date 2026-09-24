import type { Database } from '@/types/supabase';

export type ChatRoomRow = Database['public']['Tables']['chat_rooms']['Row'];
export type ChatMessageRow =
  Database['public']['Tables']['chat_messages']['Row'];

export interface ChatRoom extends ChatRoomRow {
  user1_profile: {
    username: string;
    display_name: string;
    profile_url: string;
  };
  user2_profile: {
    username: string;
    display_name: string;
    profile_url: string;
  };
}

/**
 * @description 말풍선에 달 수 있는 이모지. 자유 입력은 받지 않습니다.
 *
 * @remarks
 * 칩 정렬 순서가 이 배열 순서입니다. 코드포인트가 DB에 저장된 값과 정확히 같아야 하므로
 * 눈으로 같아 보이는 변이 선택자를 섞지 않습니다.
 * @see docs/implementation-notes/chat.md
 * @public
 */
export const CHAT_REACTION_EMOJIS = [
  '🦆',
  '💛',
  '👍',
  '👀',
  '😃',
] as const;

export interface ChatReaction {
  emoji: string;
  user_id: string;
}

export interface ReactionSummary {
  emoji: string;
  count: number;
  isMine: boolean;
}

export interface ChatMessage extends ChatMessageRow {
  profiles: {
    username: string;
    display_name: string;
  };
  chat_message_reactions: ChatReaction[];
}

export interface ToggleReactionRequest {
  messageId: number;
  roomId: number;
  emoji: string;
  isMine: boolean;
}

export interface CreateChatRoomRequest {
  postId: number;
  otherUserId: string;
}

export interface SendMessageRequest {
  roomId: number;
  message: string;
}
