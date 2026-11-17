'use client';

import { CircleAlert, RotateCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/common/EmptyState';
import { DEFAULT_ERROR_MESSAGE } from '@/libs/error-message';

interface ErrorStateProps {
  /**
   * @description 사용자에게 보여 줄 문구. `getErrorMessage(error)`를 넘깁니다.
   * @default DEFAULT_ERROR_MESSAGE
   */
  message?: string;
  /** 재시도 버튼을 누르면 호출됩니다. 없으면 버튼을 그리지 않습니다. 없는 글처럼 다시 해도 같은 경우에 비웁니다. */
  onRetry?: () => void;
  /** `EmptyState` 루트에 병합되는 className */
  className?: string;
}

/**
 * @description 조회가 실패했을 때 목록이나 상세 자리에 대신 보여 주는 안내입니다.
 *
 * @remarks
 * 화면 읽기 프로그램이 바로 읽도록 `role="alert"`로 감쌉니다.
 * @see docs/error-handling.md
 * @public
 * @name ErrorState
 * @role alert
 */
export function ErrorState({
  message = DEFAULT_ERROR_MESSAGE,
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div role="alert">
      <EmptyState
        icon={CircleAlert}
        message={message}
        className={className}
        action={
          onRetry && (
            <Button variant="outline" size="sm" onClick={onRetry}>
              <RotateCw size={16} />
              다시 시도
            </Button>
          )
        }
      />
    </div>
  );
}
