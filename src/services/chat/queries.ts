import { queryOptions } from '@tanstack/react-query';
import { servFetchChatList, servFetchMessages } from './chat-services';

export const chatQueries = {
  list: () =>
    queryOptions({
      queryKey: ['chat', 'list'] as const,
      queryFn: () => servFetchChatList(),
      staleTime: 30 * 1000,
      gcTime: 5 * 60 * 1000,
    }),

  messages: (roomId: number) =>
    queryOptions({
      queryKey: ['chat', 'messages', roomId] as const,
      queryFn: () => servFetchMessages(roomId),
      enabled: roomId > 0,
      staleTime: 0,
      gcTime: 5 * 60 * 1000,
    }),
};
