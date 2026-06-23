import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import getQueryClient from '@/libs/query/query-client';
import { libraryQueries } from '@/services/library/queries';
import { servFetchLibraryItemsServer } from '@/services/library/library-services';
import LibraryContents from './components/LibraryContents';

export default async function LibraryPage() {
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery({
    ...libraryQueries.all(),
    queryFn: () => servFetchLibraryItemsServer(),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <LibraryContents />
    </HydrationBoundary>
  );
}
