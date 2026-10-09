import {
  getVerificationStatus,
  toDongName,
} from '@/services/neighborhood/verification-status';

const DAY_MS = 24 * 60 * 60 * 1000;
const NOW = Date.parse('2026-10-07T12:00:00Z');

function daysAgo(days: number) {
  return new Date(NOW - days * DAY_MS).toISOString();
}

describe('getVerificationStatus', () => {
  it('인증한 적이 없으면 유효하지 않다', () => {
    expect(getVerificationStatus(null, NOW)).toEqual({
      isValid: false,
      daysLeft: 0,
    });
  });

  it('방금 인증했으면 30일이 남는다', () => {
    expect(getVerificationStatus(daysAgo(0), NOW)).toEqual({
      isValid: true,
      daysLeft: 30,
    });
  });

  it('29일 전 인증은 유효하고 1일이 남는다', () => {
    expect(getVerificationStatus(daysAgo(29), NOW)).toEqual({
      isValid: true,
      daysLeft: 1,
    });
  });

  it('정확히 30일 전 인증은 만료된다 (DB의 verified_at > now() - 30일과 같은 경계)', () => {
    expect(getVerificationStatus(daysAgo(30), NOW).isValid).toBe(false);
  });

  it('31일 전 인증은 만료된다', () => {
    expect(getVerificationStatus(daysAgo(31), NOW)).toEqual({
      isValid: false,
      daysLeft: 0,
    });
  });
});

describe('toDongName', () => {
  it('전체 이름에서 동 이름만 남긴다', () => {
    expect(toDongName('전남광주통합특별시 북구 용봉동')).toBe('용봉동');
  });

  it('공백 없는 이름은 그대로 둔다', () => {
    expect(toDongName('용봉동')).toBe('용봉동');
  });
});
