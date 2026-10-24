import { useEffect, useMemo, useState } from 'react';
import { debounce } from 'es-toolkit';

const DEFAULT_DELAY_MS = 300;

/**
 * 값이 안정될 때까지 지연시킨 사본을 돌려줍니다.
 *
 * lodash / es-toolkit 비교 실험의 대상 파일입니다.
 * 두 라이브러리 간 차이는 위 import 한 줄뿐이어야 합니다.
 * (실험 계획: debounce-benchmark-plan.md)
 */
export function useDebouncedValue<T>(value: T, delayMs = DEFAULT_DELAY_MS) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  const scheduleUpdate = useMemo(
    () => debounce((next: T) => setDebouncedValue(next), delayMs),
    [delayMs]
  );

  useEffect(() => {
    scheduleUpdate(value);
  }, [value, scheduleUpdate]);

  useEffect(() => () => scheduleUpdate.cancel(), [scheduleUpdate]);

  /** 지연을 건너뛰고 즉시 반영합니다 (엔터 입력, 인기 검색어 클릭 등). */
  function commitNow(next: T) {
    scheduleUpdate.cancel();
    setDebouncedValue(next);
  }

  return { debouncedValue, commitNow };
}
