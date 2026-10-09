import { render, screen } from '@testing-library/react';
import { NeighborhoodStatus } from '@/components/neighborhood/NeighborhoodStatus';

const DAY_MS = 24 * 60 * 60 * 1000;
const NOW = Date.parse('2026-10-07T12:00:00Z');
const REGION = '전남광주통합특별시 북구 용봉동';

function daysAgo(days: number) {
  return new Date(NOW - days * DAY_MS).toISOString();
}

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(NOW);
});

afterEach(() => {
  vi.useRealTimers();
});

describe('NeighborhoodStatus', () => {
  it('인증한 적이 없으면 미인증 안내를 보여준다', () => {
    render(
      <NeighborhoodStatus
        regionName={null}
        verificationCount={0}
        verifiedAt={null}
      />
    );

    expect(
      screen.getByText('아직 동네 인증을 하지 않았습니다.')
    ).toBeInTheDocument();
  });

  it('유효한 인증은 동 이름과 인증 횟수를 보여준다', () => {
    render(
      <NeighborhoodStatus
        regionName={REGION}
        verificationCount={3}
        verifiedAt={daysAgo(1)}
      />
    );

    expect(screen.getByText('용봉동')).toBeInTheDocument();
    expect(screen.getByText('인증 3회')).toBeInTheDocument();
    expect(screen.queryByText(/만료/)).not.toBeInTheDocument();
  });

  it('만료 3일 전부터 재인증을 안내한다', () => {
    render(
      <NeighborhoodStatus
        regionName={REGION}
        verificationCount={3}
        verifiedAt={daysAgo(27)}
      />
    );

    expect(screen.getByText(/3일 뒤 인증이 만료됩니다/)).toBeInTheDocument();
  });

  it('만료되면 인증 만료와 재인증 안내를 보여준다', () => {
    render(
      <NeighborhoodStatus
        regionName={REGION}
        verificationCount={3}
        verifiedAt={daysAgo(31)}
      />
    );

    expect(screen.getByText('인증 만료')).toBeInTheDocument();
    expect(screen.getByText(/동네를 다시 인증해주세요/)).toBeInTheDocument();
  });
});
