import { redirect } from 'next/navigation';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import getQueryClient from '@/libs/query/query-client';
import { createClient } from '@/libs/supabase/server';
import { sharingQueries } from '@/services/sharing/queries';
import { servFetchSharingPosts } from '@/services/sharing/sharing-services';
import { likesQueries } from '@/services/likes/queries';
import { servFetchUserLikedSharingPosts } from '@/services/likes/likes-services';
import type { Profile } from '@/services/auth/auth.types';
import MyShopContents from './components/MyShopContents';

export default async function MyShopPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/signin?callbackUrl=/my-shop');
  }

  const queryClient = getQueryClient();

  const [, { data: profile }] = await Promise.all([
    queryClient.prefetchQuery({
      ...sharingQueries.all(),
      queryFn: () => servFetchSharingPosts(supabase),
    }),
    supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single<Profile>(),
    queryClient.prefetchQuery({
      ...likesQueries.userLikedSharingPosts(),
      queryFn: () => servFetchUserLikedSharingPosts(supabase),
    }),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <MyShopContents user={user} profile={profile!} />
    </HydrationBoundary>
  );
}
