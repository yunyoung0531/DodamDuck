import {
  formatTimeSince,
  formatDate,
  formatDateTime,
  formatDateDivider,
  isSameMinute,
} from '@/libs/format-date';

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

  it('29일 전이면 "29일 전"을 반환한다', () => {
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - 29);

    expect(formatTimeSince(daysAgo.toISOString())).toBe('29일 전');
  });

  it('30일 전이면 "1개월 전"을 반환한다', () => {
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - 30);

    expect(formatTimeSince(daysAgo.toISOString())).toBe('1개월 전');
  });

  it('364일 전이면 개월 표현을 반환한다', () => {
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - 364);

    expect(formatTimeSince(daysAgo.toISOString())).toBe('12개월 전');
  });

  it('365일 전이면 절대 날짜를 반환한다', () => {
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - 365);

    expect(formatTimeSince(daysAgo.toISOString())).toMatch(
      /^\d{4}\.\d{2}\.\d{2}$/
    );
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

describe('formatDateDivider', () => {
  it('오늘 날짜면 "오늘"을 반환한다', () => {
    expect(formatDateDivider(new Date().toISOString())).toBe('오늘');
  });

  it('어제 날짜면 "어제"를 반환한다', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    expect(formatDateDivider(yesterday.toISOString())).toBe('어제');
  });

  it('올해 안의 다른 날이면 "N월 N일"을 반환한다', () => {
    const date = new Date();
    date.setDate(date.getDate() - 10);

    expect(formatDateDivider(date.toISOString())).toBe(
      `${date.getMonth() + 1}월 ${date.getDate()}일`
    );
  });

  it('작년 이전이면 연도를 붙인다', () => {
    const date = new Date();
    date.setFullYear(date.getFullYear() - 2);

    expect(formatDateDivider(date.toISOString())).toBe(
      `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`
    );
  });
});

describe('isSameMinute', () => {
  it('같은 분이면 true를 반환한다', () => {
    const a = new Date('2026-09-23T10:30:10');
    const b = new Date('2026-09-23T10:30:59');

    expect(isSameMinute(a, b)).toBe(true);
  });

  it('분이 다르면 false를 반환한다', () => {
    const a = new Date('2026-09-23T10:30:59');
    const b = new Date('2026-09-23T10:31:00');

    expect(isSameMinute(a, b)).toBe(false);
  });

  it('시각은 같아도 날짜가 다르면 false를 반환한다', () => {
    const a = new Date('2026-09-22T10:30:00');
    const b = new Date('2026-09-23T10:30:00');

    expect(isSameMinute(a, b)).toBe(false);
  });
});
