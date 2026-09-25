'use client';

import { useEffect, useState } from 'react';

/**
 * @description 주기적으로 갱신되는 현재 시각을 밀리초로 돌려줍니다.
 *
 * @remarks
 * 상대 시간은 렌더 시점에 계산되므로, 화면을 켜둔 채 시간이 흘러도 라벨이 그대로
 * 굳습니다. 이 값을 구독하면 주기마다 리렌더되어 라벨이 다시 계산됩니다. 반환값을
 * 쓰지 않고 호출만 해도 됩니다.
 * @param intervalMs 갱신 주기. 이 값이 바뀌면 타이머를 다시 겁니다
 * @returns 마지막으로 갱신된 시각의 `Date.now()` 값
 * @see formatTimeSince 이 훅과 함께 쓰는 상대 시간 포맷
 * @public
 */
export function useNow(intervalMs: number): number {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(timer);
  }, [intervalMs]);

  return now;
}
