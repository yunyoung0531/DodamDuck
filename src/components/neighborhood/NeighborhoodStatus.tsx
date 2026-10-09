'use client';

import { MapPin } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { useNow } from '@/libs/use-now';
import {
  getVerificationStatus,
  toDongName,
} from '@/services/neighborhood/verification-status';

/** 만료가 이 일수 이하로 남으면 재인증 안내를 띄웁니다. */
const EXPIRY_WARNING_DAYS = 3;
const ONE_HOUR_MS = 60 * 60 * 1000;

export interface NeighborhoodStatusProps {
  /** `regions.name`. 인증한 적이 없으면 `null` */
  regionName: string | null;
  verificationCount: number;
  verifiedAt: string | null;
}

/**
 * @description 마이페이지에 인증한 동네와 인증 횟수, 만료 상태를 보여줍니다.
 *
 * @remarks
 * 남은 날은 화면을 켜둔 채 날짜가 바뀌어도 맞도록 한 시간마다 다시 계산합니다.
 * @internal
 * @name NeighborhoodStatus
 */
export function NeighborhoodStatus({
  regionName,
  verificationCount,
  verifiedAt,
}: NeighborhoodStatusProps) {
  const now = useNow(ONE_HOUR_MS);

  if (!regionName) {
    return (
      <p className="text-sm text-muted-foreground">
        아직 동네 인증을 하지 않았습니다.
      </p>
    );
  }

  const { isValid, daysLeft } = getVerificationStatus(verifiedAt, now);
  const dongName = toDongName(regionName);

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <Badge variant={isValid ? 'default' : 'outline'} className="w-fit">
          <MapPin className="size-3" />
          {dongName}
        </Badge>
        <span className="text-sm text-muted-foreground">
          {isValid ? `인증 ${verificationCount}회` : '인증 만료'}
        </span>
      </div>
      {!isValid && (
        <p className="text-sm text-muted-foreground">
          교환/나눔 글을 쓰려면 동네를 다시 인증해주세요.
        </p>
      )}
      {isValid && daysLeft <= EXPIRY_WARNING_DAYS && (
        <p className="text-sm text-muted-foreground">
          {daysLeft}일 뒤 인증이 만료됩니다. 미리 다시 인증해주세요.
        </p>
      )}
    </div>
  );
}
