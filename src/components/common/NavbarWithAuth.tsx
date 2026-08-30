import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import getQueryClient from '@/libs/query/query-client';
import { createServerSupabase } from '@/libs/supabase/server';
import { authQueries } from '@/services/auth/queries';
import { servFetchCurrentProfile } from '@/services/auth/auth-services';
import { Navbar } from './Navbar';

export async function NavbarWithAuth() {
  const queryClient = getQueryClient();
  const supabase = await createServerSupabase();

  await queryClient.prefetchQuery({
    ...authQueries.currentProfile(),
    queryFn: () => servFetchCurrentProfile(supabase),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Navbar />
    </HydrationBoundary>
  );
}