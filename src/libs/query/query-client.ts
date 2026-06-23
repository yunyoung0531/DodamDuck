import { QueryClient } from '@tanstack/react-query';
import { cache } from 'react';

const queryClient = cache(
  () =>
    new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 5 * 60 * 1000,
          gcTime: 30 * 60 * 1000,
        },
      },
    })
);

export default queryClient;
