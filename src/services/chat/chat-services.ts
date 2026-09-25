import type { SupabaseClient } from '@supabase/supabase-js';
import { createBrowserSupabase } from '@/libs/supabase/client';
import type { Database } from '@/types/supabase';
import type {
  ChatRoom,
  ChatMessage,
  CreateChatRoomRequest,
  SendMessageRequest,
  ToggleReactionRequest,
} from './chat.types';

/**
 * @description 현재 사용자가 참여한 채팅방 목록을 가져옵니다.
 *
 * @remarks
 * 마지막 메시지가 최근인 방이 먼저 옵니다. 양쪽 참여자의 프로필을 함께 조인합니다.
 * @param client 서버에서 호출할 때 넘기는 Supabase 클라이언트. 생략하면 브라우저 클라이언트를 씁니다
 * @returns 방 목록. 참여한 방이 없으면 빈 배열
 * @throws 로그인하지 않았으면 인증 오류를 던집니다
 * @internal
 */
export async function servFetchChatList(
  client?: SupabaseClient<Database>
): Promise<ChatRoom[]> {
  const supabase = client ?? createBrowserSupabase();

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

/**
 * @description 채팅방의 메시지를 오래된 것부터 가져옵니다.
 *
 * @remarks
 * 보낸 사람 프로필과 달린 리액션을 함께 조인하므로 별도 조회가 필요 없습니다.
 * 읽을 수 있는 범위는 RLS가 정합니다. 남의 방을 넘기면 오류가 아니라 빈 배열이 옵니다.
 * @param roomId 채팅방 id
 * @param client 서버에서 호출할 때 넘기는 Supabase 클라이언트. 생략하면 브라우저 클라이언트를 씁니다
 * @returns 메시지 목록. 오래된 메시지가 앞에 옵니다
 * @internal
 */
export async function servFetchMessages(
  roomId: number,
  client?: SupabaseClient<Database>
): Promise<ChatMessage[]> {
  const supabase = client ?? createBrowserSupabase();

  const { data, error } = await supabase
    .from('chat_messages')
    .select(
      '*, profiles(username, display_name), chat_message_reactions(emoji, user_id)'
    )
    .eq('room_id', roomId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data as ChatMessage[];
}

/**
 * @description 메시지에 리액션을 달거나 이미 단 것을 취소합니다.
 *
 * @remarks
 * `request.isMine`이 호출 시점의 화면 상태이므로, 빠르게 두 번 누르면 이미 있는 행을
 * 다시 넣으려다 고유 제약에 걸립니다. 호출부가 실패를 되돌릴 수 있어야 합니다.
 * @param request 대상 메시지, 방, 이모지와 현재 내가 눌렀는지 여부
 * @throws 로그인하지 않았으면 인증 오류를 던집니다
 * @throws 같은 리액션이 이미 있는데 다시 넣으면 Postgres 고유 제약 오류를 던집니다
 * @see useToggleReaction 낙관적 갱신과 롤백을 묶은 훅
 * @internal
 */
export async function servToggleReaction(
  request: ToggleReactionRequest
): Promise<void> {
  const supabase = createBrowserSupabase();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('인증이 필요합니다');

  if (request.isMine) {
    const { error } = await supabase
      .from('chat_message_reactions')
      .delete()
      .eq('message_id', request.messageId)
      .eq('user_id', user.id)
      .eq('emoji', request.emoji);

    if (error) throw error;
    return;
  }

  const { error } = await supabase.from('chat_message_reactions').insert({
    message_id: request.messageId,
    room_id: request.roomId,
    user_id: user.id,
    emoji: request.emoji,
  });

  if (error) throw error;
}

/**
 * @description 상대와의 채팅방을 찾고, 없으면 만듭니다.
 *
 * @remarks
 * 같은 상대와 방이 둘로 갈리지 않도록 두 사용자 id를 정렬해 저장합니다. 이미 있으면
 * 만들지 않고 기존 방을 그대로 돌려주므로 호출부가 중복을 걱정하지 않아도 됩니다.
 * @param request 게시글 id와 상대 사용자 id
 * @returns 찾았거나 새로 만든 방
 * @throws 로그인하지 않았으면 인증 오류를 던집니다
 * @internal
 */
export async function servCreateChatRoom(
  request: CreateChatRoomRequest
): Promise<ChatRoom> {
  const supabase = createBrowserSupabase();

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

/**
 * 채팅방에 메시지를 보냅니다.
 *
 * @param request 방 id와 보낼 내용
 * @throws 로그인하지 않았으면 인증 오류를 던집니다
 * @internal
 */
export async function servSendMessage(
  request: SendMessageRequest
): Promise<void> {
  const supabase = createBrowserSupabase();

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
