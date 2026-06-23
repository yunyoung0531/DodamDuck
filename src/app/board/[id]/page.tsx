import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import getQueryClient from '@/libs/query/query-client';
import { createClient } from '@/libs/supabase/server';
import { boardQueries } from '@/services/board/queries';
import { servFetchBoardDetail } from '@/services/board/board-services';
import BoardDetailContents from './components/BoardDetailContents';

interface BoardDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function BoardDetailPage({
  params,
}: BoardDetailPageProps) {
  const { id } = await params;
  const postId = Number(id);
  const queryClient = getQueryClient();
  const supabase = await createClient();

  await queryClient.prefetchQuery({
    ...boardQueries.detail(postId),
    queryFn: () => servFetchBoardDetail(postId, supabase),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <BoardDetailContents />
    </HydrationBoundary>
  );
}
