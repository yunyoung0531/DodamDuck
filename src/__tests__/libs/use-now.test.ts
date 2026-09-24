import { renderHook, act } from '@testing-library/react';
import { useNow } from '@/libs/use-now';

describe('useNow', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('처음에는 현재 시각을 반환한다', () => {
    // Arrange
    vi.setSystemTime(new Date('2026-09-23T10:00:00Z'));

    // Act
    const { result } = renderHook(() => useNow(60_000));

    // Assert
    expect(result.current).toBe(Date.now());
  });

  it('주기가 지나면 값이 갱신된다', () => {
    // Arrange
    vi.setSystemTime(new Date('2026-09-23T10:00:00Z'));
    const { result } = renderHook(() => useNow(60_000));
    const initial = result.current;

    // Act
    act(() => {
      vi.advanceTimersByTime(60_000);
    });

    // Assert
    expect(result.current).toBe(initial + 60_000);
  });

  it('주기 전에는 값이 그대로다', () => {
    // Arrange
    vi.setSystemTime(new Date('2026-09-23T10:00:00Z'));
    const { result } = renderHook(() => useNow(60_000));
    const initial = result.current;

    // Act
    act(() => {
      vi.advanceTimersByTime(59_000);
    });

    // Assert
    expect(result.current).toBe(initial);
  });

  it('언마운트하면 타이머를 정리한다', () => {
    // Arrange
    const clearIntervalSpy = vi.spyOn(globalThis, 'clearInterval');
    const { unmount } = renderHook(() => useNow(60_000));

    // Act
    unmount();

    // Assert
    expect(clearIntervalSpy).toHaveBeenCalled();
  });
});
