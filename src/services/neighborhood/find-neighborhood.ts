import type {
  BoundaryCollection,
  BoundaryGeometry,
  CurrentPosition,
  Neighborhood,
  Position,
} from './neighborhood.types';

/**
 * @description 좌표가 들어 있는 행정동을 찾습니다. 네트워크를 쓰지 않습니다.
 *
 * @remarks
 * 경계는 단순화된 데이터라 동 경계 근처 수십 m 안에서는 옆 동으로 판정될 수 있습니다.
 * @param boundaries `servFetchNeighborhoodBoundaries`가 돌려준 전국 행정동 경계
 * @param position 판정할 좌표
 * @returns 좌표를 포함하는 동. 어느 동에도 속하지 않으면 `null`
 */
export function findNeighborhood(
  boundaries: BoundaryCollection,
  { latitude, longitude }: Pick<CurrentPosition, 'latitude' | 'longitude'>
): Neighborhood | null {
  const point: Position = [longitude, latitude];
  const feature = boundaries.features.find((f) =>
    containsPoint(f.geometry, point)
  );
  if (!feature) return null;

  return {
    code: feature.properties.adm_cd2,
    name: feature.properties.adm_nm,
    geometry: feature.geometry,
  };
}

function containsPoint(geometry: BoundaryGeometry, point: Position): boolean {
  const polygons =
    geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.coordinates;

  return polygons.some(
    ([outer, ...holes]) =>
      outer !== undefined &&
      isInRing(point, outer) &&
      !holes.some((hole) => isInRing(point, hole))
  );
}

/** 짝홀 규칙(ray casting). 점에서 오른쪽으로 그은 선이 경계를 홀수 번 넘으면 안쪽입니다. */
function isInRing([x, y]: Position, ring: Position[]): boolean {
  let isInside = false;
  let prev = ring[ring.length - 1];

  for (const curr of ring) {
    if (prev) {
      const [x1, y1] = curr;
      const [x2, y2] = prev;
      const crosses =
        y1 > y !== y2 > y && x < ((x2 - x1) * (y - y1)) / (y2 - y1) + x1;
      if (crosses) isInside = !isInside;
    }
    prev = curr;
  }

  return isInside;
}
