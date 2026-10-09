import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authQueries } from '@/services/auth/queries';
import { findNeighborhood } from './find-neighborhood';
import { neighborhoodQueries } from './queries';
import {
  servGetCurrentPosition,
  servVerifyNeighborhood,
} from './neighborhood-services';
import type { LocateNeighborhoodResult } from './neighborhood.types';

/**
 * @description 현재 위치를 얻어 어느 행정동인지 브라우저 안에서 판정합니다.
 *
 * @remarks
 * `mutate()`를 부를 때 위치 권한을 요청하고 경계 파일을 받습니다. 결과에는 좌표가 없습니다.
 * @returns React Query mutation. 실패하면 `error`가 `LocationError`이거나 경계 파일 에러입니다
 */
export function useLocateNeighborhood() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (): Promise<LocateNeighborhoodResult> => {
      const [position, boundaries] = await Promise.all([
        servGetCurrentPosition(),
        queryClient.fetchQuery(neighborhoodQueries.boundaries()),
      ]);

      return {
        neighborhood: findNeighborhood(boundaries, position),
        accuracy: position.accuracy,
      };
    },
  });
}

/**
 * @description 판정한 동으로 인증을 기록하고, 성공하면 내 프로필을 다시 불러옵니다.
 *
 * @returns React Query mutation. `mutate(regionCode)`로 호출합니다
 */
export function useVerifyNeighborhood() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (regionCode: string) => servVerifyNeighborhood(regionCode),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: authQueries.currentProfile().queryKey,
      }),
  });
}
