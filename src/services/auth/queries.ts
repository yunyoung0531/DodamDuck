import { queryOptions } from '@tanstack/react-query';
import { servCheckUsername } from './auth-services';

export const authQueries = {
  checkUsername: (username: string) =>
    queryOptions({
      queryKey: ['auth', 'checkUsername', username] as const,
      queryFn: () => servCheckUsername(username),
      enabled: username.length > 0,
      staleTime: 30 * 1000,
      gcTime: 60 * 1000,
    }),
};
