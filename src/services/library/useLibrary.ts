import { useQuery } from '@tanstack/react-query';
import { libraryQueries } from './queries';

export function useLibraryItems(page = 1, perPage = 30) {
  return useQuery(libraryQueries.all(page, perPage));
}
