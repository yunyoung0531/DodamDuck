import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/libs/supabase/client';
import { chatQueries } from './queries';
import { servCreateChatRoom, servSendMessage } from './chat-services';
import type { CreateChatRoomRequest, SendMessageRequest } from './chat.types';

export function useChatList() {
  return useQuery(chatQueries.list());
}

export function useChatMessages(roomId: number) {
  const queryClient = useQueryClient();

  const query = useQuery(chatQueries.messages(roomId));

  useEffect(() => {
    if (roomId <= 0) return;

    const supabase = createClient();
    const channel = supabase
      .channel(`chat-room-${roomId}`)
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
            queryKey: ['chat', 'messages', roomId],
          });
          queryClient.invalidateQueries({
            queryKey: ['chat', 'list'],
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
  return useMutation({
    mutationFn: (request: SendMessageRequest) => servSendMessage(request),
  });
}
