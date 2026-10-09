'use client';

import { useRouter } from 'next/navigation';

import { NeighborhoodRequiredDialog } from '@/components/neighborhood/NeighborhoodRequiredDialog';

const SHARING_LIST_PATH = '/sharing';

/**
 * @description 동네 인증 없이 글쓰기 주소로 들어왔을 때 폼 대신 띄우는 안내 모달입니다.
 *
 * @remarks
 * 닫으면 교환/나눔 목록으로 갑니다. 뒤로 가기는 쓰지 않습니다. 다른 사이트에서 바로 들어온 경우 도담덕을 벗어나기 때문입니다.
 * 인증에 성공하면 서버 컴포넌트를 새로 고쳐 이 자리에 폼이 나타납니다.
 * @internal
 * @name NeighborhoodRequiredNotice
 */
export function NeighborhoodRequiredNotice() {
  const router = useRouter();

  function handleOpenChange(open: boolean) {
    if (!open) router.push(SHARING_LIST_PATH);
  }

  return (
    <NeighborhoodRequiredDialog
      open
      onOpenChange={handleOpenChange}
      onVerified={() => router.refresh()}
    />
  );
}
