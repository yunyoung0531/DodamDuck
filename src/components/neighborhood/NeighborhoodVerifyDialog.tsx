'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { NeighborhoodVerifyPanel } from '@/components/neighborhood/NeighborhoodVerifyPanel';

import { NEIGHBORHOOD_VERIFICATION_TTL_DAYS } from '@/services/neighborhood/neighborhood.types';

/**
 * @description 현재 위치로 동네를 인증하는 다이얼로그입니다.
 *
 * @remarks
 * 닫으면 패널이 언마운트되어 동의 체크와 찾은 동네가 초기화됩니다.
 * 인증에 성공하면 닫고 서버 컴포넌트를 새로 고칩니다.
 * @internal
 * @name NeighborhoodVerifyDialog
 * @tag button
 */
export function NeighborhoodVerifyDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  function handleVerified() {
    setOpen(false);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" size="sm" />}>
        <MapPin className="size-4" />
        동네 인증
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>동네 인증</DialogTitle>
          <DialogDescription>
            지금 있는 곳의 동네로 인증합니다. 인증은{' '}
            {NEIGHBORHOOD_VERIFICATION_TTL_DAYS}일 동안 유효합니다.
          </DialogDescription>
        </DialogHeader>

        <NeighborhoodVerifyPanel onVerified={handleVerified} />
      </DialogContent>
    </Dialog>
  );
}
