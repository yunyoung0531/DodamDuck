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

export interface ChatMessage extends ChatMessageRow {
  profiles: {
    username: string;
    display_name: string;
  };
}

export interface CreateChatRoomRequest {
  postId: number;
  otherUserId: string;
}

export interface SendMessageRequest {
  roomId: number;
  message: string;
}
