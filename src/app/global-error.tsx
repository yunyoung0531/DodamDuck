'use client';

import { ErrorState } from '@/components/common/ErrorState';
import './globals.css';

interface GlobalErrorProps {
  /** 화면에 쓰지 않습니다. 개발 환경에서는 원문이 넘어오므로 노출하면 안 됩니다. */
  error: Error & { digest?: string };
  /** 루트 레이아웃부터 다시 불러와 그립니다. */
  unstable_retry: () => void;
}

/**
 * @description 루트 레이아웃에서 에러가 나면 화면 전체를 대신하는 안내입니다.
 *
 * @remarks
 * 루트 레이아웃을 대체하므로 `<html>`, `<body>`, 전역 CSS를 직접 둡니다. 내비게이션과 Provider는 없습니다.
 * @see docs/error-handling.md
 * @internal
 * @name GlobalError
 */
export default function GlobalError({ unstable_retry }: GlobalErrorProps) {
  return (
    <html lang="ko">
      <body className="flex min-h-screen items-center justify-center bg-background">
        <title>도담덕</title>
        <ErrorState onRetry={() => unstable_retry()} />
      </body>
    </html>
  );
}
