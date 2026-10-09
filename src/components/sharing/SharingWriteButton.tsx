'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { ReactNode } from 'react';
import type { VariantProps } from 'class-variance-authority';

import { Button, type buttonVariants } from '@/components/ui/button';
import { LinkButton } from '@/components/common/LinkButton';
import { NeighborhoodRequiredDialog } from '@/components/neighborhood/NeighborhoodRequiredDialog';

import { useNow } from '@/libs/use-now';
import { useUser } from '@/services/auth/useUser';
import { getVerificationStatus } from '@/services/neighborhood/verification-status';

const SHARING_NEW_PATH = '/sharing/new';
const ONE_MINUTE_MS = 60 * 1000;

export interface SharingWriteButtonProps {
  /** 버튼 안에 들어갈 내용. 아이콘만 넣을 때는 `sr-only` 라벨을 함께 넣습니다. */
  children: ReactNode;
  size?: VariantProps<typeof buttonVariants>['size'];
  className?: string;
}

/**
 * @description 교환/나눔 글쓰기로 가는 버튼입니다. 동네 인증이 유효하지 않으면 이동 대신 인증 안내를 엽니다.
 *
 * @remarks
 * 로그인하지 않았거나 프로필을 읽는 중이면 링크로 둡니다. 로그인은 proxy가, 인증은 글쓰기 페이지의 서버 확인이 한 번 더 막습니다.
 * @internal
 * @name SharingWriteButton
 */
export function SharingWriteButton(props: SharingWriteButtonProps) {
  const { user, profile } = useUser();
  const now = useNow(ONE_MINUTE_MS);

  const needsVerification =
    user !== null &&
    profile !== null &&
    !getVerificationStatus(profile.verified_at, now).isValid;

  if (needsVerification) return <GatedWriteButton {...props} />;

  return (
    <LinkButton
      href={SHARING_NEW_PATH}
      size={props.size}
      className={props.className}
    >
      {props.children}
    </LinkButton>
  );
}

function GatedWriteButton({
  children,
  size,
  className,
}: SharingWriteButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  function handleVerified() {
    setOpen(false);
    router.push(SHARING_NEW_PATH);
  }

  return (
    <>
      <Button size={size} className={className} onClick={() => setOpen(true)}>
        {children}
      </Button>
      <NeighborhoodRequiredDialog
        open={open}
        onOpenChange={setOpen}
        onVerified={handleVerified}
      />
    </>
  );
}
