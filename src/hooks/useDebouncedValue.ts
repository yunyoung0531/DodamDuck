import { useEffect, useMemo, useState } from 'react';
import { debounce } from 'es-toolkit';

const DEFAULT_DELAY_MS = 300;

/**
 * 값이 안정될 때까지 지연시킨 사본을 돌려준다.
 *
 * lodash / es-toolkit 비교 실험의 대상 파일이다.
 * 두 라이브러리 간 차이는 위 import 한 줄뿐이어야 한다.
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

  // 언마운트 또는 지연시간 변경 시에만 대기 중인 호출을 취소한다.
  // 위 효과의 정리 함수로 합쳐도 동작은 같다. React가 정리 → 새 효과 순서로
  // 실행하고 debounce도 호출 시 이전 타이머를 지우므로 마지막 예약은 살아남는다.
  // "값 변경 시 예약" / "언마운트 시 정리"라는 의도를 드러내려고 효과를 나눴다.
  useEffect(() => () => scheduleUpdate.cancel(), [scheduleUpdate]);

  /** 지연을 건너뛰고 즉시 반영한다 (엔터 입력, 인기 검색어 클릭 등). */
  function commitNow(next: T) {
    scheduleUpdate.cancel();
    setDebouncedValue(next);
  }

  return { debouncedValue, commitNow };
}
