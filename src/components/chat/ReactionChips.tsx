'use client';

import { Button } from '@/components/ui/button';
import type { ReactionSummary } from '@/services/chat/chat.types';

/** 칩 하나의 모양. 누를 수 있든 없든 같게 보여야 한다. */
const CHIP_SHAPE = 'flex h-6 items-center gap-1 rounded-full px-2 text-xs';

export interface ReactionChipsProps {
  /** 이모지별 집계. 빈 배열이면 아무것도 렌더하지 않습니다. */
  summaries: ReactionSummary[];
  /** 칩을 누를 때 그 이모지와 누르기 직전의 `isMine`으로 호출됩니다. */
  onToggle: (emoji: string, isMine: boolean) => void;
  /**
   * @description 누를 수 없는 칩으로 보여줄지 여부
   * @default false
   */
  readOnly?: boolean;
}

/**
 * @description 말풍선에 달린 리액션을 이모지별 칩으로 보여줍니다.
 *
 * @remarks
 * 누를 수 있을 때만 버튼으로 렌더합니다. `readOnly`면 초점도 받지 않는 표시 전용이라
 * 키보드 사용자가 누를 수 없는 것에 걸리지 않습니다.
 * @internal
 * @name ReactionChips
 * @tag button
 */
export function ReactionChips({
  summaries,
  onToggle,
  readOnly = false,
}: ReactionChipsProps) {
  if (summaries.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1">
      {summaries.map((summary) =>
        readOnly ? (
          <span
            key={summary.emoji}
            className={`${CHIP_SHAPE} border border-gray-200 bg-white text-muted-foreground`}
          >
            <span aria-hidden="true">{summary.emoji}</span>
            <span>{summary.count}</span>
          </span>
        ) : (
          <Button
            key={summary.emoji}
            type="button"
            variant="outline"
            size="sm"
            aria-pressed={summary.isMine}
            aria-label={`${summary.emoji} 리액션 ${summary.count}개${
              summary.isMine ? ', 내가 누름' : ''
            }`}
            onClick={() => onToggle(summary.emoji, summary.isMine)}
            className={`${CHIP_SHAPE} ${
              summary.isMine ? 'border-dodam-yellow bg-dodam-light' : 'bg-white'
            }`}
          >
            <span aria-hidden="true">{summary.emoji}</span>
            <span>{summary.count}</span>
          </Button>
        )
      )}
    </div>
  );
}
