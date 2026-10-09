import { http, HttpResponse } from 'msw';
import { QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { server } from '../mocks/server';
import { createTestQueryClient } from '../test-utils';
import { createBrowserSupabase } from '@/libs/supabase/client';
import {
  useLocateNeighborhood,
  useVerifyNeighborhood,
} from '@/services/neighborhood/useNeighborhood';
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

function stubPosition(latitude: number, longitude: number, accuracy: number) {
  Object.defineProperty(navigator, 'geolocation', {
    value: {
      getCurrentPosition: (onSuccess: PositionCallback) =>
        onSuccess({
          coords: { latitude, longitude, accuracy },
        } as GeolocationPosition),
    },
    configurable: true,
  });
}

function renderWithClient<T>(hook: () => T) {
  const queryClient = createTestQueryClient();
  const result = renderHook(hook, {
    wrapper: ({ children }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  });
  return { ...result, queryClient };
}

afterEach(() => {
  Object.defineProperty(navigator, 'geolocation', {
    value: undefined,
    configurable: true,
  });
});

describe('useLocateNeighborhood', () => {
  it('현재 위치의 동과 정확도를 반환하고 좌표는 결과에 남기지 않는다', async () => {
    stubPosition(35.1763, 126.9064, 15);
    server.use(
      http.get(`${APP_URL}/data/hangjeongdong.json`, () =>
        HttpResponse.json(YONGBONG)
      )
    );
    const { result } = renderWithClient(() => useLocateNeighborhood());

    act(() => result.current.mutate());

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.neighborhood?.code).toBe('1230059000');
    expect(result.current.data?.accuracy).toBe(15);
    expect(Object.keys(result.current.data ?? {})).toEqual([
      'neighborhood',
      'accuracy',
    ]);
  });

  it('경계 밖이면 neighborhood가 null이다', async () => {
    stubPosition(33.0, 125.0, 15);
    server.use(
      http.get(`${APP_URL}/data/hangjeongdong.json`, () =>
        HttpResponse.json(YONGBONG)
      )
    );
    const { result } = renderWithClient(() => useLocateNeighborhood());

    act(() => result.current.mutate());

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.neighborhood).toBeNull();
  });
});

describe('useVerifyNeighborhood', () => {
  it('인증에 성공하면 내 프로필 쿼리를 무효화한다', async () => {
    mockSupabase.rpc = vi.fn(() =>
      Promise.resolve({ data: null, error: null })
    );
    const { result, queryClient } = renderWithClient(() =>
      useVerifyNeighborhood()
    );
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries');

    act(() => result.current.mutate('1230059000'));

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockSupabase.rpc).toHaveBeenCalledWith('verify_neighborhood', {
      region_code: '1230059000',
    });
    expect(invalidate).toHaveBeenCalledWith({
      queryKey: ['auth', 'currentProfile'],
    });
  });
});
