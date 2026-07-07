'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/libs/supabase/client';
import type { User } from '@supabase/supabase-js';
import type { Profile } from './auth.types';

interface UseUserOptions {
  initialUser?: User | null;
  initialProfile?: Profile | null;
}

interface UseUserReturn {
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
}

export function useUser(options?: UseUserOptions): UseUserReturn {
  const [user, setUser] = useState<User | null>(options?.initialUser ?? null);
  const [profile, setProfile] = useState<Profile | null>(options?.initialProfile ?? null);
  const [isLoading, setIsLoading] = useState(
    options?.initialUser === undefined,
  );
  const supabase = createClient();

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', currentUser.id)
          .single();

        setProfile(profileData);
      } else {
        setProfile(null);
      }

      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- supabase client is a singleton from @supabase/ssr
  }, []);

  return { user, profile, isLoading };
}
