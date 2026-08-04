import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/libs/supabase/client';
import { chatQueries } from './queries';
import { servCreateChatRoom, servSendMessage } from './chat-services';
import type { CreateChatRoomRequest, SendMessageRequest } from './chat.types';

export function useChatList() {
  return useQuery(chatQueries.list());
}

// realtime-js의 client.channel(topic)은 같은 토픽이면 기존 채널 객체를 재사용한다.
// StrictMode 이중 마운트에서는 정리(unsubscribe) 중인 채널을 두 번째 마운트가 그대로
// 재사용하고, 뒤늦게 도착한 teardown이 그 채널을 죽여서 에러 없이 이벤트만 끊긴다.
// 구독마다 토픽을 다르게 만들어 재사용 자체를 막는다.
let channelSeq = 0;

export function useChatMessages(roomId: number) {
  const queryClient = useQueryClient();

  const query = useQuery(chatQueries.messages(roomId));

  useEffect(() => {
    if (roomId <= 0) return;

    const supabase = createClient();
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
        () => {
          queryClient.invalidateQueries({
            queryKey: chatQueries.messages(roomId).queryKey,
          });
          queryClient.invalidateQueries({
            queryKey: chatQueries.list().queryKey,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId, queryClient]);

  return query;
}

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

export function useSendMessage() {
  const queryClient = useQueryClient();

  // Realtime 에코에만 의존하면 구독이 끊긴 동안 내가 보낸 메시지도 보이지 않는다.
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
