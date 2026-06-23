import { queryOptions } from '@tanstack/react-query';
import { servFetchLibraryItems } from './library-services';

export const libraryQueries = {
  all: (page = 1, perPage = 30) =>
    queryOptions({
      queryKey: ['library', 'list', page, perPage] as const,
      queryFn: () => servFetchLibraryItems(page, perPage),
      staleTime: 30 * 60 * 1000,
      gcTime: 60 * 60 * 1000,
    }),
};
