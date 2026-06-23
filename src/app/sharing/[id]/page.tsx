import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import getQueryClient from '@/libs/query/query-client';
import { createClient } from '@/libs/supabase/server';
import { sharingQueries } from '@/services/sharing/queries';
import { servFetchSharingDetail } from '@/services/sharing/sharing-services';
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

  await queryClient.prefetchQuery({
    ...sharingQueries.detail(postId),
    queryFn: () => servFetchSharingDetail(postId, supabase),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <SharingDetailContents />
    </HydrationBoundary>
  );
}
