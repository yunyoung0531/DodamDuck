import { NEIGHBORHOOD_VERIFICATION_TTL_DAYS } from './neighborhood.types';

const DAY_MS = 24 * 60 * 60 * 1000;

export interface VerificationStatus {
  /** 인증한 적이 있고 아직 만료되지 않았는가. DB의 `is_neighborhood_verified`와 같은 판단입니다. */
  isValid: boolean;
  /** 만료까지 남은 날(올림). 유효하지 않으면 0 */
  daysLeft: number;
}

/**
 * @description 마지막 인증 시각으로 인증이 유효한지와 남은 날을 계산합니다.
 *
 * @param verifiedAt `profiles.verified_at`. 인증한 적이 없으면 `null`
 * @param now 기준 시각(ms). 화면은 `useNow`의 값을 넘깁니다
 */
export function getVerificationStatus(
  verifiedAt: string | null,
  now: number
): VerificationStatus {
  if (!verifiedAt) return { isValid: false, daysLeft: 0 };

  const expiresAt =
    Date.parse(verifiedAt) + NEIGHBORHOOD_VERIFICATION_TTL_DAYS * DAY_MS;
  if (expiresAt <= now) return { isValid: false, daysLeft: 0 };

  return { isValid: true, daysLeft: Math.ceil((expiresAt - now) / DAY_MS) };
}

export function toDongName(regionName: string): string {
  return regionName.split(' ').at(-1) ?? regionName;
}
