import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import getQueryClient from '@/libs/query/query-client';
import { createClient } from '@/libs/supabase/server';
import { sharingQueries } from '@/services/sharing/queries';
import { servFetchSharingDetail } from '@/services/sharing/sharing-services';
import { likesQueries } from '@/services/likes/queries';
import { servFetchUserLikedPostIds } from '@/services/likes/likes-services';
import SharingDetailContents from './components/SharingDetailContents';

interface SharingDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function SharingDetailPage({
  params,
}: SharingDetailPageProps) {
  const { id } = await params;
  const postId = Number(id);
  const queryClient = getQueryClient();
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const prefetches = [
    queryClient.prefetchQuery({
      ...sharingQueries.detail(postId),
      queryFn: () => servFetchSharingDetail(postId, supabase),
    }),
  ];

  if (user) {
    prefetches.push(
      queryClient.prefetchQuery({
        ...likesQueries.userLikedIds(),
        queryFn: () => servFetchUserLikedPostIds(supabase),
      })
    );
  }

  await Promise.all(prefetches);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <SharingDetailContents />
    </HydrationBoundary>
  );
}
