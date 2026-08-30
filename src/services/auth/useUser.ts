'use client';

import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { createBrowserSupabase } from '@/libs/supabase/client';
import { authQueries } from './queries';
import type { User } from '@supabase/supabase-js';
import type { Profile } from './auth.types';

interface UseUserReturn {
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
}

export function useUser(): UseUserReturn {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery(authQueries.currentProfile());

  useEffect(() => {
    const supabase = createBrowserSupabase();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'INITIAL_SESSION') return;
      queryClient.invalidateQueries({
        queryKey: authQueries.currentProfile().queryKey,
      });
    });

    return () => subscription.unsubscribe();
  }, [queryClient]);

  const user = data
    ? ({ id: data.user.id, email: data.user.email } as User)
    : null;
  const profile = data?.profile ?? null;

  return { user, profile, isLoading };
}
