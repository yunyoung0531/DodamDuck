import { act, renderHook } from '@testing-library/react';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';

/**
 * lodash / es-toolkit 동작 동등성 검증용 테스트.
 * useDebouncedValue.ts의 import를 바꿔도 이 테스트가 그대로 통과해야 한다.
 * (실험 계획: debounce-benchmark-plan.md)
 */
describe('useDebouncedValue', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('초기값을 즉시 반환한다', () => {
    // Arrange & Act
    const { result } = renderHook(() => useDebouncedValue('레고'));

    // Assert
    expect(result.current.debouncedValue).toBe('레고');
  });

  it('지연시간이 지나기 전에는 이전 값을 유지한다', () => {
    // Arrange
    const { result, rerender } = renderHook(
      ({ value }) => useDebouncedValue(value, 300),
      { initialProps: { value: '' } }
    );

    // Act
    rerender({ value: '레고' });
    act(() => {
      vi.advanceTimersByTime(299);
    });

    // Assert
    expect(result.current.debouncedValue).toBe('');
  });

  it('지연시간이 지나면 최신 값을 반환한다', () => {
    // Arrange
    const { result, rerender } = renderHook(
      ({ value }) => useDebouncedValue(value, 300),
      { initialProps: { value: '' } }
    );

    // Act
    rerender({ value: '레고' });
    act(() => {
      vi.advanceTimersByTime(300);
    });

    // Assert
    expect(result.current.debouncedValue).toBe('레고');
  });

  it('연속 입력 중에는 마지막 값만 반영한다', () => {
    // Arrange
    const { result, rerender } = renderHook(
      ({ value }) => useDebouncedValue(value, 300),
      { initialProps: { value: '' } }
    );

    // Act — 100ms 간격으로 세 번 입력
    for (const value of ['레', '레고', '레고블록']) {
      rerender({ value });
      act(() => {
        vi.advanceTimersByTime(100);
      });
    }
    // 마지막 입력 이후 300ms 경과
    act(() => {
      vi.advanceTimersByTime(300);
    });

    // Assert — 중간 값을 거치지 않고 마지막 값만 반영
    expect(result.current.debouncedValue).toBe('레고블록');
  });

  it('commitNow는 지연을 건너뛰고 즉시 반영한다', () => {
    // Arrange
    const { result, rerender } = renderHook(
      ({ value }) => useDebouncedValue(value, 300),
      { initialProps: { value: '' } }
    );
    rerender({ value: '자전거' });

    // Act
    act(() => {
      result.current.commitNow('자전거');
    });

    // Assert — 타이머를 진행시키지 않았는데도 반영됨
    expect(result.current.debouncedValue).toBe('자전거');
  });

  it('언마운트 후에는 대기 중인 값을 반영하지 않는다', () => {
    // Arrange
    const { result, rerender, unmount } = renderHook(
      ({ value }) => useDebouncedValue(value, 300),
      { initialProps: { value: '' } }
    );
    rerender({ value: '뽀로로' });

    // Act
    unmount();
    act(() => {
      vi.advanceTimersByTime(300);
    });

    // Assert
    expect(result.current.debouncedValue).toBe('');
  });
});
