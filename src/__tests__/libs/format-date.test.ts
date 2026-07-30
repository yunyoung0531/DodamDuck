import { formatTimeSince, formatDate, formatDateTime } from '@/libs/format-date';

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

  it('30분 전이면 "30분 전"을 반환한다', () => {
    const thirtyMinAgo = new Date();
    thirtyMinAgo.setMinutes(thirtyMinAgo.getMinutes() - 30);

    expect(formatTimeSince(thirtyMinAgo.toISOString())).toBe('30분 전');
  });

  it('5시간 전이면 "5시간 전"을 반환한다', () => {
    const fiveHoursAgo = new Date();
    fiveHoursAgo.setHours(fiveHoursAgo.getHours() - 5);

    expect(formatTimeSince(fiveHoursAgo.toISOString())).toBe('5시간 전');
  });
});

describe('formatDate', () => {
  it('날짜를 YYYY.MM.DD 형식으로 반환한다', () => {
    expect(formatDate('2024-01-15T10:30:00Z')).toMatch(/^\d{4}\.\d{2}\.\d{2}$/);
  });

  it('월과 일을 2자리로 패딩한다', () => {
    const result = formatDate('2024-03-05T00:00:00Z');
    const parts = result.split('.');
    expect(parts[1]).toHaveLength(2);
    expect(parts[2]).toHaveLength(2);
  });
});

describe('formatDateTime', () => {
  it('날짜와 시간을 YYYY.MM.DD HH:mm 형식으로 반환한다', () => {
    expect(formatDateTime('2024-01-15T10:30:00Z')).toMatch(
      /^\d{4}\.\d{2}\.\d{2} \d{2}:\d{2}$/
    );
  });

  it('시간과 분을 2자리로 패딩한다', () => {
    const result = formatDateTime('2024-01-15T03:05:00Z');
    const timePart = result.split(' ')[1]!;
    const [hours, minutes] = timePart.split(':');
    expect(hours).toHaveLength(2);
    expect(minutes).toHaveLength(2);
  });
});
