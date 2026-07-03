import { formatTimeSince } from '@/libs/format-date';

describe('formatTimeSince', () => {
  it('방금 생성된 날짜면 "방금 전"을 반환한다', () => {
    const now = new Date().toISOString();
    expect(formatTimeSince(now)).toBe('방금 전');
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

  it('30일 전이면 날짜 형식을 반환한다', () => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const result = formatTimeSince(thirtyDaysAgo.toISOString());
    expect(result).toMatch(/^\d{4}\.\d{2}\.\d{2}$/);
  });
});
