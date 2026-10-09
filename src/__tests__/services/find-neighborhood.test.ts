import { readFileSync } from 'fs';
import { resolve } from 'path';
import { findNeighborhood } from '@/services/neighborhood/find-neighborhood';
import type {
  BoundaryCollection,
  BoundaryFeature,
  Position,
} from '@/services/neighborhood/neighborhood.types';

// 실제 배포 파일로 판정한다. 기대값은 단순화 전 원본 경계로 같은 좌표를 판정해 얻었다.
const boundaries: BoundaryCollection = JSON.parse(
  readFileSync(
    resolve(process.cwd(), 'public/data/hangjeongdong.json'),
    'utf-8'
  )
);

function square([x, y]: Position, size: number): Position[] {
  return [
    [x, y],
    [x + size, y],
    [x + size, y + size],
    [x, y + size],
    [x, y],
  ];
}

function feature(
  code: string,
  geometry: BoundaryFeature['geometry']
): BoundaryFeature {
  return {
    type: 'Feature',
    properties: { adm_cd2: code, adm_nm: `테스트 ${code}` },
    geometry,
  };
}

describe('findNeighborhood', () => {
  it.each([
    {
      place: '전남대 용봉캠퍼스',
      latitude: 35.1763,
      longitude: 126.9064,
      code: '1230059000',
      name: '전남광주통합특별시 북구 용봉동',
    },
    {
      place: '광주시청',
      latitude: 35.1601,
      longitude: 126.8514,
      code: '1224074500',
      name: '전남광주통합특별시 서구 치평동',
    },
    {
      place: '광주송정역',
      latitude: 35.1378,
      longitude: 126.7914,
      code: '1233052500',
      name: '전남광주통합특별시 광산구 송정2동',
    },
    {
      place: '국립아시아문화전당',
      latitude: 35.1467,
      longitude: 126.9205,
      code: '1221065500',
      name: '전남광주통합특별시 동구 서남동',
    },
    {
      place: '서울시청',
      latitude: 37.5663,
      longitude: 126.9779,
      code: '1114055000',
      name: '서울특별시 중구 명동',
    },
  ])(
    '$place 좌표를 $name(으)로 판정한다',
    ({ latitude, longitude, code, name }) => {
      const result = findNeighborhood(boundaries, { latitude, longitude });

      expect(result?.code).toBe(code);
      expect(result?.name).toBe(name);
    }
  );

  it('어느 동에도 속하지 않는 바다 좌표는 null을 반환한다', () => {
    expect(
      findNeighborhood(boundaries, { latitude: 33.0, longitude: 125.0 })
    ).toBeNull();
  });

  it('구멍 안의 좌표는 그 동으로 판정하지 않는다', () => {
    const donut = feature('1', {
      type: 'Polygon',
      coordinates: [square([0, 0], 10), square([4, 4], 2)],
    });
    const collection: BoundaryCollection = {
      type: 'FeatureCollection',
      features: [donut],
    };

    expect(
      findNeighborhood(collection, { latitude: 5, longitude: 5 })
    ).toBeNull();
    expect(
      findNeighborhood(collection, { latitude: 1, longitude: 1 })?.code
    ).toBe('1');
  });

  it('MultiPolygon의 두 번째 조각에 있는 좌표도 찾는다', () => {
    const islands = feature('2', {
      type: 'MultiPolygon',
      coordinates: [[square([0, 0], 1)], [square([10, 10], 1)]],
    });
    const collection: BoundaryCollection = {
      type: 'FeatureCollection',
      features: [islands],
    };

    expect(
      findNeighborhood(collection, { latitude: 10.5, longitude: 10.5 })?.code
    ).toBe('2');
  });
});
