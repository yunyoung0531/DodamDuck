import { createBrowserSupabase } from '@/libs/supabase/client';
import {
  LOCATION_ERROR_REASON,
  type BoundaryCollection,
  type CurrentPosition,
  type LocationErrorReason,
} from './neighborhood.types';

const BOUNDARIES_URL = '/data/hangjeongdong.json';

/** 현재 위치를 얻지 못한 이유를 `reason`에 담습니다. 화면은 이 값으로 안내 문구를 고릅니다. */
export class LocationError extends Error {
  constructor(readonly reason: LocationErrorReason) {
    super(`현재 위치를 가져올 수 없습니다: ${reason}`);
    this.name = 'LocationError';
  }
}

const REASON_BY_CODE: Record<number, LocationErrorReason> = {
  1: LOCATION_ERROR_REASON.DENIED,
  2: LOCATION_ERROR_REASON.UNAVAILABLE,
  3: LOCATION_ERROR_REASON.TIMEOUT,
};

/**
 * @description 브라우저 Geolocation API로 현재 위치를 한 번 얻습니다.
 *
 * @remarks
 * 좌표를 어디에도 보내거나 저장하지 않습니다. 호출부도 좌표를 상태나 캐시에 두지 않아야 합니다.
 * @throws `LocationError`. 브라우저가 지원하지 않거나, 권한이 거부되었거나, 시간이 초과된 경우
 */
export function servGetCurrentPosition(): Promise<CurrentPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new LocationError(LOCATION_ERROR_REASON.UNSUPPORTED));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      ({ coords }) =>
        resolve({
          latitude: coords.latitude,
          longitude: coords.longitude,
          accuracy: coords.accuracy,
        }),
      (error) =>
        reject(
          new LocationError(
            REASON_BY_CODE[error.code] ?? LOCATION_ERROR_REASON.UNAVAILABLE
          )
        ),
      { enableHighAccuracy: true, timeout: 10_000, maximumAge: 0 }
    );
  });
}

/**
 * @description 전국 행정동 경계 파일(gzip 약 900KB)을 받습니다.
 *
 * @throws 파일 응답이 실패하면 예외를 던집니다.
 */
export async function servFetchNeighborhoodBoundaries(): Promise<BoundaryCollection> {
  const response = await fetch(BOUNDARIES_URL);
  if (!response.ok) throw new Error('동네 경계 데이터를 불러올 수 없습니다');

  return response.json();
}

/**
 * @description 로그인한 사용자의 동네 인증을 기록합니다.
 *
 * @remarks
 * 행정동 코드만 보냅니다. 동 이름은 서버가 `regions`에서 찾고, 횟수 규칙도 서버 함수가 정합니다.
 * @param regionCode `findNeighborhood`가 돌려준 행정동 코드
 * @throws 로그인하지 않았거나 `regions`에 없는 코드면 Supabase 에러를 던집니다.
 */
export async function servVerifyNeighborhood(
  regionCode: string
): Promise<void> {
  const supabase = createBrowserSupabase();

  const { error } = await supabase.rpc('verify_neighborhood', {
    region_code: regionCode,
  });

  if (error) throw error;
}
