'use client';

import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

/** 저장되는 값은 한글이고, id에는 영문 키를 쓴다. */
const OPTIONS = [
  { value: '교환', key: 'trade' },
  { value: '나눔', key: 'share' },
] as const;

export interface ExchangeOptionFieldProps {
  /** 현재 선택된 거래 방식 */
  value: string;
  /** 다른 값을 고르면 호출됩니다. */
  onChange: (value: string) => void;
}

/**
 * @description 교환과 나눔 중 하나를 고르는 라디오 묶음입니다.
 *
 * @internal
 * @name ExchangeOptionField
 * @tag div
 */
export function ExchangeOptionField({
  value,
  onChange,
}: ExchangeOptionFieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <Label id="exchange-option-label">거래 방식</Label>
      <RadioGroup
        value={value}
        onValueChange={onChange}
        aria-labelledby="exchange-option-label"
        className="flex gap-4"
      >
        {OPTIONS.map((option) => (
          <div key={option.key} className="flex items-center gap-2">
            <RadioGroupItem value={option.value} id={`exchange-${option.key}`} />
            <Label
              htmlFor={`exchange-${option.key}`}
              className="cursor-pointer"
            >
              {option.value}
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
}
