import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createBrowserSupabase } from '@/libs/supabase/client';
import { chatQueries } from './queries';
import {
  servCreateChatRoom,
  servSendMessage,
  servToggleReaction,
} from './chat-services';
import type {
  ChatMessage,
  ChatReaction,
  CreateChatRoomRequest,
  SendMessageRequest,
  ToggleReactionRequest,
} from './chat.types';

/**
 * 현재 사용자가 참여한 채팅방 목록을 구독합니다.
 *
 * @returns React Query 결과. `data`는 마지막 메시지가 최근인 방부터입니다
 * @internal
 */
export function useChatList() {
  return useQuery(chatQueries.list());
}

let channelSeq = 0;

/**
 * @description 채팅방의 메시지를 조회하고 변경을 실시간으로 구독합니다.
 *
 * @remarks
 * 메시지와 리액션이 도착하면 캐시를 무효화하므로 호출부가 따로 새로고침할 필요가 없습니다.
 * 구독은 `roomId`가 바뀔 때마다 새로 걸고 언마운트에서 정리합니다.
 * @param roomId 채팅방 id. 0 이하면 구독하지 않습니다
 * @returns React Query 결과. `data`는 오래된 메시지가 앞에 옵니다
 * @see docs/implementation-notes/chat.md 채널 이름에 일련번호를 붙이는 이유
 * @internal
 */
export function useChatMessages(roomId: number) {
  const queryClient = useQueryClient();

  const query = useQuery(chatQueries.messages(roomId));

  useEffect(() => {
    if (roomId <= 0) return;

    function invalidateMessages() {
      queryClient.invalidateQueries({
        queryKey: chatQueries.messages(roomId).queryKey,
      });
      queryClient.invalidateQueries({
        queryKey: chatQueries.list().queryKey,
      });
    }

    const supabase = createBrowserSupabase();
    const channel = supabase
      .channel(`chat-room-${roomId}-${++channelSeq}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `room_id=eq.${roomId}`,
        },
        invalidateMessages
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_message_reactions',
          filter: `room_id=eq.${roomId}`,
        },
        invalidateMessages
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId, queryClient]);

  return query;
}

/**
 * 상대와의 채팅방을 만들거나 기존 방을 가져옵니다.
 *
 * @returns 성공하면 방을 돌려주는 mutation. 채팅 관련 캐시를 모두 무효화합니다
 * @internal
 */
export function useCreateChatRoom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateChatRoomRequest) =>
      servCreateChatRoom(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat'] });
    },
  });
}

/**
 * @description 메시지 리액션을 달거나 취소합니다.
 *
 * @remarks
 * 탭한 즉시 칩이 반응하도록 캐시를 먼저 고치고 서버에 보냅니다. 실패하면 되돌린 뒤
 * 서버 상태를 다시 읽습니다. 성공했을 때는 Realtime 에코가 맞춰주므로 따로 무효화하지 않습니다.
 * @param roomId 대상 메시지가 속한 방 id
 * @param currentUserId 현재 사용자 id. 낙관적 갱신이 내 리액션을 넣고 뺄 때 씁니다
 * @returns `ToggleReactionRequest`를 받는 mutation
 * @internal
 */
export function useToggleReaction(roomId: number, currentUserId: string) {
  const queryClient = useQueryClient();
  const messagesKey = chatQueries.messages(roomId).queryKey;

  return useMutation({
    mutationFn: (request: ToggleReactionRequest) => servToggleReaction(request),

    onMutate: async (request) => {
      await queryClient.cancelQueries({ queryKey: messagesKey });
      const previous = queryClient.getQueryData<ChatMessage[]>(messagesKey);

      queryClient.setQueryData<ChatMessage[]>(messagesKey, (messages) =>
        messages?.map((message) =>
          message.id === request.messageId
            ? {
                ...message,
                chat_message_reactions: toggleReaction(
                  message.chat_message_reactions,
                  request.emoji,
                  currentUserId
                ),
              }
            : message
        )
      );

      return { previous };
    },

    onError: (_error, _request, context) => {
      if (context?.previous) {
        queryClient.setQueryData(messagesKey, context.previous);
      }
      queryClient.invalidateQueries({ queryKey: messagesKey });
    },
  });
}

/** 내 리액션 한 건을 넣거나 뺀 새 배열을 돌려줍니다. 원본은 건드리지 않습니다. */
function toggleReaction(
  reactions: ChatReaction[],
  emoji: string,
  userId: string
): ChatReaction[] {
  const mine = reactions.find(
    (reaction) => reaction.emoji === emoji && reaction.user_id === userId
  );

  if (mine) {
    return reactions.filter((reaction) => reaction !== mine);
  }

  return [...reactions, { emoji, user_id: userId }];
}

/**
 * @description 채팅방에 메시지를 보냅니다.
 *
 * @remarks
 * 성공하면 메시지와 방 목록 캐시를 무효화합니다. Realtime 에코에만 맡기면 구독이 끊긴
 * 동안 내가 보낸 메시지도 화면에 오르지 않습니다.
 * @returns `SendMessageRequest`를 받는 mutation
 * @internal
 */
export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: SendMessageRequest) => servSendMessage(request),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: chatQueries.messages(variables.roomId).queryKey,
      });
      queryClient.invalidateQueries({
        queryKey: chatQueries.list().queryKey,
      });
    },
  });
}
