'use client';

import type { UseFormRegisterReturn } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { LoadingButton } from '@/components/common/LoadingButton';
import { FormField } from '@/components/common/FormField';

/** 아이디 중복 확인의 진행 상태 */
export type UserIdStatus = 'idle' | 'checking' | 'available' | 'taken';

export interface UserIdFieldProps {
  /** 중복 확인 결과. `idle`이면 아무 안내도 띄우지 않습니다. */
  status: UserIdStatus;
  /** `register('userID', ...)`의 반환값을 그대로 넘깁니다. */
  register: UseFormRegisterReturn;
  /** 검증 실패 메시지 */
  error?: string;
  /** 중복확인 버튼을 누르면 호출됩니다. */
  onCheck: () => void;
}

/**
 * @description 아이디 입력과 중복 확인 버튼, 확인 결과를 함께 보여줍니다.
 *
 * @remarks
 * 상태를 소유하지 않습니다. 확인 요청과 결과는 호출부가 관리합니다.
 * @internal
 * @name UserIdField
 * @tag div
 */
export function UserIdField({
  status,
  register,
  error,
  onCheck,
}: UserIdFieldProps) {
  return (
    <FormField htmlFor="userID" label="아이디" error={error}>
      <div className="flex gap-2">
        <Input
          id="userID"
          placeholder="아이디를 입력하세요"
          className="flex-1"
          {...register}
        />
        <LoadingButton
          type="button"
          variant="outline"
          size="sm"
          loading={status === 'checking'}
          onClick={onCheck}
        >
          중복확인
        </LoadingButton>
      </div>

      {status === 'available' && (
        <p className="text-sm text-green-600">사용 가능한 아이디입니다.</p>
      )}
      {status === 'taken' && (
        <p className="text-sm text-destructive">이미 사용 중인 아이디입니다.</p>
      )}
    </FormField>
  );
}
