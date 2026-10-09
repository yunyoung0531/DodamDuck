import { queryOptions } from '@tanstack/react-query';
import { servFetchNeighborhoodBoundaries } from './neighborhood-services';

export const neighborhoodQueries = {
  /**
   * 정적 파일이라 배포 사이에는 바뀌지 않으므로 다시 받지 않습니다.
   * 4MB를 파싱한 객체라 쓰지 않을 때는 30분 뒤 메모리에서 내립니다.
   */
  boundaries: () =>
    queryOptions({
      queryKey: ['neighborhood', 'boundaries'] as const,
      queryFn: servFetchNeighborhoodBoundaries,
      staleTime: Infinity,
      gcTime: 30 * 60 * 1000,
    }),
};
