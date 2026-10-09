import { http, HttpResponse } from 'msw';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { server } from '../mocks/server';
import { renderWithProviders } from '../test-utils';
import { createBrowserSupabase } from '@/libs/supabase/client';
import { NeighborhoodVerifyPanel } from '@/components/neighborhood/NeighborhoodVerifyPanel';
import type { BoundaryCollection } from '@/services/neighborhood/neighborhood.types';
import type { MockSupabaseClient } from '../mocks/supabase';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL;
const mockSupabase = createBrowserSupabase() as unknown as MockSupabaseClient;

const YONGBONG: BoundaryCollection = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: {
        adm_cd2: '1230059000',
        adm_nm: '전남광주통합특별시 북구 용봉동',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [126.9, 35.17],
            [126.92, 35.17],
            [126.92, 35.19],
            [126.9, 35.19],
            [126.9, 35.17],
          ],
        ],
      },
    },
  ],
};

function stubGeolocation(
  getCurrentPosition: Geolocation['getCurrentPosition']
) {
  Object.defineProperty(navigator, 'geolocation', {
    value: { getCurrentPosition },
    configurable: true,
  });
}

function stubPosition(latitude: number, longitude: number, accuracy = 20) {
  stubGeolocation((onSuccess) =>
    onSuccess({
      coords: { latitude, longitude, accuracy },
    } as GeolocationPosition)
  );
}

async function consentAndLocate() {
  const user = userEvent.setup();
  await user.click(
    screen.getByRole('checkbox', {
      name: '동네 확인을 위한 현재 위치 이용에 동의합니다',
    })
  );
  await user.click(
    screen.getByRole('button', { name: '현재 위치로 동네 찾기' })
  );
  return user;
}

beforeEach(() => {
  server.use(
    http.get(`${APP_URL}/data/hangjeongdong.json`, () =>
      HttpResponse.json(YONGBONG)
    )
  );
});

afterEach(() => {
  Object.defineProperty(navigator, 'geolocation', {
    value: undefined,
    configurable: true,
  });
});

describe('NeighborhoodVerifyPanel', () => {
  it('위치 이용에 동의하기 전에는 동네 찾기 버튼이 비활성화된다', () => {
    renderWithProviders(<NeighborhoodVerifyPanel onVerified={vi.fn()} />);

    expect(
      screen.getByRole('button', { name: '현재 위치로 동네 찾기' })
    ).toBeDisabled();
  });

  it('찾은 동네로 인증하면 행정동 코드만 보내고 onVerified를 호출한다', async () => {
    stubPosition(35.1763, 126.9064);
    mockSupabase.rpc = vi.fn(() =>
      Promise.resolve({ data: null, error: null })
    );
    const onVerified = vi.fn();
    renderWithProviders(<NeighborhoodVerifyPanel onVerified={onVerified} />);

    const user = await consentAndLocate();
    expect(
      await screen.findByText('전남광주통합특별시 북구 용봉동')
    ).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '이 동네로 인증' }));

    await waitFor(() => expect(onVerified).toHaveBeenCalled());
    expect(mockSupabase.rpc).toHaveBeenCalledWith('verify_neighborhood', {
      region_code: '1230059000',
    });
  });

  it('위치 권한이 거부되면 허용 방법을 안내한다', async () => {
    stubGeolocation((_, onError) =>
      onError?.({ code: 1 } as GeolocationPositionError)
    );
    renderWithProviders(<NeighborhoodVerifyPanel onVerified={vi.fn()} />);

    await consentAndLocate();

    expect(
      await screen.findByText(/위치 권한이 꺼져 있습니다/)
    ).toBeInTheDocument();
  });

  it('위치 오차가 크면 휴대폰에서 다시 시도하라고 안내한다', async () => {
    stubPosition(35.1763, 126.9064, 3000);
    renderWithProviders(<NeighborhoodVerifyPanel onVerified={vi.fn()} />);

    await consentAndLocate();

    expect(await screen.findByText(/위치 오차가 큽니다/)).toBeInTheDocument();
  });

  it('어느 동에도 속하지 않으면 찾지 못했다고 안내한다', async () => {
    stubPosition(33.0, 125.0);
    renderWithProviders(<NeighborhoodVerifyPanel onVerified={vi.fn()} />);

    await consentAndLocate();

    expect(
      await screen.findByText(/동네를 찾지 못했습니다/)
    ).toBeInTheDocument();
  });
});
