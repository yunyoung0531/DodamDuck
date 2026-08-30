import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import getQueryClient from '@/libs/query/query-client';
import { createServerSupabase } from '@/libs/supabase/server';
import { boardQueries } from '@/services/board/queries';
import { servFetchBoardPosts } from '@/services/board/board-services';
import BoardContents from './components/BoardContents';

export default async function BoardPage() {
  const queryClient = getQueryClient();
  const supabase = await createServerSupabase();

  await queryClient.prefetchQuery({
    ...boardQueries.all(),
    queryFn: () => servFetchBoardPosts(supabase),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <BoardContents />
    </HydrationBoundary>
  );
}
