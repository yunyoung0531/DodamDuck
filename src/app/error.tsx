'use client';

import { ErrorState } from '@/components/common/ErrorState';

interface ErrorPageProps {
  /** 화면에 쓰지 않습니다. 개발 환경에서는 원문이 넘어오므로 노출하면 안 됩니다. */
  error: Error & { digest?: string };
  /** 세그먼트를 다시 불러와 그립니다. */
  unstable_retry: () => void;
}

/**
 * @description 렌더 중 예상 못 한 에러가 나면 세그먼트 대신 보여 주는 화면입니다.
 *
 * @remarks
 * 이벤트 핸들러와 비동기 코드의 에러는 잡지 못합니다. 조회와 동작의 실패는 각각 `ErrorState`와 전역 토스트가 맡습니다.
 * @see docs/error-handling.md
 * @internal
 * @name ErrorPage
 */
export default function ErrorPage({ unstable_retry }: ErrorPageProps) {
  return (
    <ErrorState onRetry={() => unstable_retry()} className="min-h-[60vh]" />
  );
}
