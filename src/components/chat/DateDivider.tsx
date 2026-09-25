import { Separator } from '@/components/ui/separator';

export interface DateDividerProps {
  /** 가운데에 넣을 날짜 라벨. `formatDateDivider`가 만든 문자열을 그대로 받습니다. */
  label: string;
}

/**
 * @description 메시지 사이에 날짜가 바뀌는 지점을 알리는 가로 구분선입니다.
 *
 * @internal
 * @name DateDivider
 * @tag div
 */
export function DateDivider({ label }: DateDividerProps) {
  return (
    <div className="flex items-center gap-3 py-2">
      <Separator className="flex-1" />
      <span className="shrink-0 text-xs text-muted-foreground">{label}</span>
      <Separator className="flex-1" />
    </div>
  );
}
