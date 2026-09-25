import { Label } from '@/components/ui/label';
import { FormFieldError } from '@/components/common/FormFieldError';

export interface FormFieldProps {
  /** 라벨이 가리킬 입력 요소의 id. 자식 입력에 같은 id를 준다. */
  htmlFor: string;
  /** 필드 라벨 */
  label: string;
  /** 검증 실패 메시지. 없으면 자리만 차지하지 않습니다. */
  error?: string;
  /** 라벨과 에러 사이에 놓일 입력 요소 */
  children: React.ReactNode;
}

/**
 * @description 라벨, 입력, 검증 메시지를 한 묶음으로 세로로 쌓습니다.
 *
 * @remarks
 * 입력 요소 자체는 받지 않고 `children`으로 넘겨받아, Input이든 Textarea든 같게 씁니다.
 * @public
 * @name FormField
 * @tag div
 */
export function FormField({
  htmlFor,
  label,
  error,
  children,
}: FormFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      <FormFieldError message={error} />
    </div>
  );
}
