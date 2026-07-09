import { queryOptions } from '@tanstack/react-query';
import { servCheckUsername, servFetchCurrentProfile } from './auth-services';

export const authQueries = {
  currentProfile: () =>
    queryOptions({
      queryKey: ['auth', 'currentProfile'] as const,
      queryFn: () => servFetchCurrentProfile(),
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
    }),

  checkUsername: (username: string) =>
    queryOptions({
      queryKey: ['auth', 'checkUsername', username] as const,
      queryFn: () => servCheckUsername(username),
      enabled: username.length > 0,
      staleTime: 30 * 1000,
      gcTime: 60 * 1000,
    }),
};
