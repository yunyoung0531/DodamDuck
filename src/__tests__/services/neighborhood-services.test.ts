import { http, HttpResponse } from 'msw';
import { server } from '../mocks/server';
import { createBrowserSupabase } from '@/libs/supabase/client';
import {
  LocationError,
  servFetchNeighborhoodBoundaries,
  servGetCurrentPosition,
  servVerifyNeighborhood,
} from '@/services/neighborhood/neighborhood-services';
import type { BoundaryCollection } from '@/services/neighborhood/neighborhood.types';
import type { MockSupabaseClient } from '../mocks/supabase';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL;
const mockSupabase = createBrowserSupabase() as unknown as MockSupabaseClient;

function stubGeolocation(geolocation: Partial<Geolocation> | undefined) {
  Object.defineProperty(navigator, 'geolocation', {
    value: geolocation,
    configurable: true,
  });
}

afterEach(() => {
  stubGeolocation(undefined);
});

describe('servGetCurrentPosition', () => {
  it('위도, 경도, 정확도를 반환하고 고정밀 측위를 요청한다', async () => {
    const getCurrentPosition = vi.fn<Geolocation['getCurrentPosition']>(
      (onSuccess) =>
        onSuccess({
          coords: { latitude: 35.1763, longitude: 126.9064, accuracy: 12 },
        } as GeolocationPosition)
    );
    stubGeolocation({ getCurrentPosition });

    const result = await servGetCurrentPosition();

    expect(result).toEqual({
      latitude: 35.1763,
      longitude: 126.9064,
      accuracy: 12,
    });
    expect(getCurrentPosition.mock.calls[0]?.[2]).toMatchObject({
      enableHighAccuracy: true,
      maximumAge: 0,
    });
  });

  it.each([
    [1, 'denied'],
    [2, 'unavailable'],
    [3, 'timeout'],
  ])('에러 코드 %i는 reason %s로 바꿔 던진다', async (code, reason) => {
    stubGeolocation({
      getCurrentPosition: (
        _: PositionCallback,
        onError?: PositionErrorCallback | null
      ) => onError?.({ code } as GeolocationPositionError),
    });

    await expect(servGetCurrentPosition()).rejects.toMatchObject({
      name: 'LocationError',
      reason,
    });
  });

  it('Geolocation을 지원하지 않으면 unsupported를 던진다', async () => {
    stubGeolocation(undefined);

    const error = await servGetCurrentPosition().catch((e: unknown) => e);

    expect(error).toBeInstanceOf(LocationError);
    expect((error as LocationError).reason).toBe('unsupported');
  });
});

describe('servFetchNeighborhoodBoundaries', () => {
  it('경계 파일을 받아 반환한다', async () => {
    const collection: BoundaryCollection = {
      type: 'FeatureCollection',
      features: [],
    };
    server.use(
      http.get(`${APP_URL}/data/hangjeongdong.json`, () =>
        HttpResponse.json(collection)
      )
    );

    await expect(servFetchNeighborhoodBoundaries()).resolves.toEqual(
      collection
    );
  });

  it('응답이 실패하면 예외를 던진다', async () => {
    server.use(
      http.get(
        `${APP_URL}/data/hangjeongdong.json`,
        () => new HttpResponse(null, { status: 404 })
      )
    );

    await expect(servFetchNeighborhoodBoundaries()).rejects.toThrow();
  });
});

describe('servVerifyNeighborhood', () => {
  it('행정동 코드만 담아 verify_neighborhood를 호출한다', async () => {
    mockSupabase.rpc = vi.fn(() =>
      Promise.resolve({ data: null, error: null })
    );

    await servVerifyNeighborhood('1230059000');

    expect(mockSupabase.rpc).toHaveBeenCalledWith('verify_neighborhood', {
      region_code: '1230059000',
    });
  });

  it('RPC가 실패하면 예외를 던진다', async () => {
    mockSupabase.rpc = vi.fn(() =>
      Promise.resolve({ data: null, error: { message: 'unknown region code' } })
    );

    await expect(servVerifyNeighborhood('0000000000')).rejects.toBeTruthy();
  });
});
