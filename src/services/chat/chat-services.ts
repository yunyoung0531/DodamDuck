import type { SupabaseClient } from '@supabase/supabase-js';
import { createClient } from '@/libs/supabase/client';
import type { Database } from '@/types/supabase';
import type {
  ChatRoom,
  ChatMessage,
  CreateChatRoomRequest,
  SendMessageRequest,
} from './chat.types';

export async function servFetchChatList(
  client?: SupabaseClient<Database>
): Promise<ChatRoom[]> {
  const supabase = client ?? createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('인증이 필요합니다');

  const { data, error } = await supabase
    .from('chat_rooms')
    .select(
      '*, user1_profile:profiles!chat_rooms_user1_id_fkey(username, display_name, profile_url), user2_profile:profiles!chat_rooms_user2_id_fkey(username, display_name, profile_url)'
    )
    .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
    .order('last_message_at', { ascending: false });

  if (error) throw error;
  return data as ChatRoom[];
}

export async function servFetchMessages(
  roomId: number,
  client?: SupabaseClient<Database>
): Promise<ChatMessage[]> {
  const supabase = client ?? createClient();

  const { data, error } = await supabase
    .from('chat_messages')
    .select('*, profiles(username, display_name)')
    .eq('room_id', roomId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data as ChatMessage[];
}

export async function servCreateChatRoom(
  request: CreateChatRoomRequest
): Promise<ChatRoom> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('인증이 필요합니다');

  const [uid1, uid2] =
    user.id < request.otherUserId
      ? [user.id, request.otherUserId]
      : [request.otherUserId, user.id];

  const { data: existing } = await supabase
    .from('chat_rooms')
    .select(
      '*, user1_profile:profiles!chat_rooms_user1_id_fkey(username, display_name, profile_url), user2_profile:profiles!chat_rooms_user2_id_fkey(username, display_name, profile_url)'
    )
    .eq('user1_id', uid1)
    .eq('user2_id', uid2)
    .maybeSingle();

  if (existing) return existing as ChatRoom;

  const { data, error } = await supabase
    .from('chat_rooms')
    .insert({
      user1_id: uid1,
      user2_id: uid2,
      post_id: request.postId,
    })
    .select(
      '*, user1_profile:profiles!chat_rooms_user1_id_fkey(username, display_name, profile_url), user2_profile:profiles!chat_rooms_user2_id_fkey(username, display_name, profile_url)'
    )
    .single();

  if (error) throw error;
  return data as ChatRoom;
}

export async function servSendMessage(
  request: SendMessageRequest
): Promise<void> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('인증이 필요합니다');

  const { error } = await supabase.from('chat_messages').insert({
    room_id: request.roomId,
    sender_id: user.id,
    message: request.message,
  });

  if (error) throw error;
}
