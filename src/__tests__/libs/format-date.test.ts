import { formatTimeSince } from '@/libs/format-date';

describe('formatTimeSince', () => {
  it('오늘 날짜면 "오늘"을 반환한다', () => {
    const now = new Date().toISOString();
    expect(formatTimeSince(now)).toBe('오늘');
  });

  it('1일 전이면 "1일 전"을 반환한다', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    expect(formatTimeSince(yesterday.toISOString())).toBe('1일 전');
  });

  it('3일 전이면 "3일 전"을 반환한다', () => {
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    expect(formatTimeSince(threeDaysAgo.toISOString())).toBe('3일 전');
  });

  it('30일 전이면 "30일 전"을 반환한다', () => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    expect(formatTimeSince(thirtyDaysAgo.toISOString())).toBe('30일 전');
  });
});
