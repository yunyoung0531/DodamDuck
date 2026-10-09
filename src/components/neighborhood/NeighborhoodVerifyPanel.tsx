'use client';

import { useState } from 'react';
import { toast } from 'sonner';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { LoadingButton } from '@/components/common/LoadingButton';
import { NeighborhoodMap } from '@/components/neighborhood/NeighborhoodMap';

import { LocationError } from '@/services/neighborhood/neighborhood-services';
import {
  useLocateNeighborhood,
  useVerifyNeighborhood,
} from '@/services/neighborhood/useNeighborhood';
import {
  LOW_ACCURACY_METERS,
  type LocationErrorReason,
  type Neighborhood,
} from '@/services/neighborhood/neighborhood.types';

const LOCATION_ERROR_MESSAGES: Record<LocationErrorReason, string> = {
  unsupported: '이 브라우저는 위치 확인을 지원하지 않습니다.',
  denied:
    '위치 권한이 꺼져 있습니다. 주소창 왼쪽의 사이트 설정에서 위치를 허용한 뒤 다시 시도해주세요.',
  unavailable: '현재 위치를 찾을 수 없습니다. 잠시 후 다시 시도해주세요.',
  timeout: '위치 확인이 너무 오래 걸립니다. 다시 시도해주세요.',
};

export interface NeighborhoodVerifyPanelProps {
  /** 인증 기록에 성공한 뒤 호출됩니다. 다이얼로그를 닫는 데 씁니다. */
  onVerified: () => void;
}

/**
 * @description 위치 이용에 동의받고, 현재 위치의 동을 찾아 보여준 뒤 인증을 기록합니다.
 *
 * @internal
 * @name NeighborhoodVerifyPanel
 */
export function NeighborhoodVerifyPanel({
  onVerified,
}: NeighborhoodVerifyPanelProps) {
  const [hasConsent, setHasConsent] = useState(false);
  const locate = useLocateNeighborhood();
  const neighborhood = locate.data?.neighborhood;

  if (neighborhood && locate.data) {
    return (
      <NeighborhoodConfirm
        neighborhood={neighborhood}
        isLowAccuracy={locate.data.accuracy > LOW_ACCURACY_METERS}
        onRetry={() => locate.mutate()}
        onVerified={onVerified}
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        현재 위치는 이 기기 안에서 동네를 찾는 데만 씁니다. 위치 좌표는 서버로
        보내거나 저장하지 않고, 찾은 동네 이름만 기록합니다.
      </p>
      <div className="flex items-center gap-2">
        <Checkbox
          id="location-consent"
          checked={hasConsent}
          onCheckedChange={setHasConsent}
        />
        <Label htmlFor="location-consent" className="cursor-pointer">
          동네 확인을 위한 현재 위치 이용에 동의합니다
        </Label>
      </div>

      {locate.isError && (
        <Alert variant="destructive">
          <AlertDescription>{toErrorMessage(locate.error)}</AlertDescription>
        </Alert>
      )}
      {locate.isSuccess && (
        <Alert>
          <AlertDescription>
            현재 위치에서 동네를 찾지 못했습니다. 국내에서 다시 시도해주세요.
          </AlertDescription>
        </Alert>
      )}

      <LoadingButton
        loading={locate.isPending}
        disabled={!hasConsent}
        onClick={() => locate.mutate()}
      >
        현재 위치로 동네 찾기
      </LoadingButton>
    </div>
  );
}

interface NeighborhoodConfirmProps {
  neighborhood: Neighborhood;
  isLowAccuracy: boolean;
  onRetry: () => void;
  onVerified: () => void;
}

function NeighborhoodConfirm({
  neighborhood,
  isLowAccuracy,
  onRetry,
  onVerified,
}: NeighborhoodConfirmProps) {
  const verify = useVerifyNeighborhood();

  function handleVerify() {
    verify.mutate(neighborhood.code, {
      onSuccess: () => {
        toast.success('동네 인증이 완료되었습니다.');
        onVerified();
      },
      onError: () => {
        toast.error('동네 인증 실패', {
          description: '동네 인증에 실패했습니다. 다시 시도해주세요.',
        });
      },
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <NeighborhoodMap geometry={neighborhood.geometry} />
      <p className="text-center font-semibold">{neighborhood.name}</p>

      {isLowAccuracy && (
        <Alert>
          <AlertDescription>
            위치 오차가 큽니다. 동네가 다르게 나왔다면 GPS가 있는 휴대폰에서
            다시 시도해주세요.
          </AlertDescription>
        </Alert>
      )}

      <div className="flex gap-2">
        <Button
          variant="outline"
          className="flex-1"
          disabled={verify.isPending}
          onClick={onRetry}
        >
          다시 찾기
        </Button>
        <LoadingButton
          className="flex-1"
          loading={verify.isPending}
          onClick={handleVerify}
        >
          이 동네로 인증
        </LoadingButton>
      </div>

      <p className="text-xs text-muted-foreground">
        경계 데이터: 통계청 SGIS, vuski/admdongkor (CC BY 4.0)
      </p>
    </div>
  );
}

function toErrorMessage(error: Error): string {
  if (error instanceof LocationError)
    return LOCATION_ERROR_MESSAGES[error.reason];
  return '동네 정보를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.';
}
