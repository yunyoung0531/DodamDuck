'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { NeighborhoodVerifyPanel } from '@/components/neighborhood/NeighborhoodVerifyPanel';

import { NEIGHBORHOOD_VERIFICATION_TTL_DAYS } from '@/services/neighborhood/neighborhood.types';

export interface NeighborhoodRequiredDialogProps {
  /** 열림 상태. 호출부가 소유합니다. */
  open: boolean;
  /** "이전", 닫기 버튼, 바깥 클릭, Esc로 닫을 때 `false`로 호출됩니다. 닫을 때 할 일은 호출부가 정합니다. */
  onOpenChange: (open: boolean) => void;
  /** 다이얼로그 안에서 인증에 성공하면 호출됩니다. 원래 하려던 이동을 이어서 합니다. */
  onVerified: () => void;
}

/**
 * @description 동네 인증이 필요한 동작을 시도했을 때 안내하고, 그 자리에서 인증까지 받습니다.
 *
 * @remarks
 * 처음에는 안내만 보이고 "동네 인증"을 누르면 인증 패널로 바뀝니다. 닫으면 안내로 돌아갑니다.
 * @internal
 * @name NeighborhoodRequiredDialog
 */
export function NeighborhoodRequiredDialog({
  open,
  onOpenChange,
  onVerified,
}: NeighborhoodRequiredDialogProps) {
  const [isVerifying, setIsVerifying] = useState(false);

  function handleOpenChange(next: boolean) {
    if (!next) setIsVerifying(false);
    onOpenChange(next);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>동네 인증이 필요합니다</DialogTitle>
          <DialogDescription>
            교환/나눔 글은 동네를 인증한 이웃만 쓸 수 있습니다. 인증은{' '}
            {NEIGHBORHOOD_VERIFICATION_TTL_DAYS}일 동안 유효합니다.
          </DialogDescription>
        </DialogHeader>

        {isVerifying ? (
          <NeighborhoodVerifyPanel onVerified={onVerified} />
        ) : (
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>
              이전
            </DialogClose>
            <Button onClick={() => setIsVerifying(true)}>동네 인증</Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
