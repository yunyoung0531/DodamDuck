import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import getQueryClient from '@/libs/query/query-client';
import { createServerSupabase } from '@/libs/supabase/server';
import { sharingQueries } from '@/services/sharing/queries';
import {
  servFetchSharingPosts,
  servFetchPopularSearches,
} from '@/services/sharing/sharing-services';
import SharingContents from './components/SharingContents';

export default async function SharingPage() {
  const queryClient = getQueryClient();
  const supabase = await createServerSupabase();

  await Promise.all([
    queryClient.prefetchQuery({
      ...sharingQueries.all(),
      queryFn: () => servFetchSharingPosts(undefined, supabase),
    }),
    queryClient.prefetchQuery({
      ...sharingQueries.popularSearches(),
      queryFn: () => servFetchPopularSearches(supabase),
    }),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <SharingContents />
    </HydrationBoundary>
  );
}
