/** GeoJSON 좌표 순서 그대로 [경도, 위도] */
export type Position = [longitude: number, latitude: number];

/** 첫 번째 고리가 바깥 경계이고, 나머지는 구멍입니다. */
type PolygonRings = Position[][];

/** 행정동 하나의 경계. 섬이 있는 동은 `MultiPolygon`입니다. */
export type BoundaryGeometry =
  | { type: 'Polygon'; coordinates: PolygonRings }
  | { type: 'MultiPolygon'; coordinates: PolygonRings[] };

export interface BoundaryFeature {
  type: 'Feature';
  properties: {
    /** 행정안전부 10자리 행정동 코드. `regions.code`와 같습니다. */
    adm_cd2: string;
    /** "전남광주통합특별시 북구 용봉동" 형태의 전체 이름 */
    adm_nm: string;
  };
  geometry: BoundaryGeometry;
}

/** `public/data/hangjeongdong.json`의 형태. `scripts/build-neighborhood-boundaries.sh`가 만듭니다. */
export interface BoundaryCollection {
  type: 'FeatureCollection';
  features: BoundaryFeature[];
}

export interface Neighborhood {
  /** 행정동 코드. `verify_neighborhood`에 이 값을 보냅니다. */
  code: string;
  name: string;
  /** 지도에 동 경계를 그릴 때 씁니다. */
  geometry: BoundaryGeometry;
}

export interface CurrentPosition {
  latitude: number;
  longitude: number;
  /** 오차 반경(m). 데스크톱은 Wi-Fi나 IP로 잡혀 수 km가 나오기도 합니다. */
  accuracy: number;
}

/**
 * @description 현재 위치로 동을 찾은 결과.
 *
 * @remarks
 * 좌표는 담지 않습니다. 좌표가 상태나 캐시에 남지 않게 하려는 것으로, 위치정보법 판단의 전제입니다.
 * @see docs/location-verification-plan.md
 */
export interface LocateNeighborhoodResult {
  /** 행정동 경계 밖(바다, 국외)이면 `null` */
  neighborhood: Neighborhood | null;
  accuracy: number;
}

export const LOCATION_ERROR_REASON = {
  UNSUPPORTED: 'unsupported',
  DENIED: 'denied',
  UNAVAILABLE: 'unavailable',
  TIMEOUT: 'timeout',
} as const;

export type LocationErrorReason =
  (typeof LOCATION_ERROR_REASON)[keyof typeof LOCATION_ERROR_REASON];

/** 이 값(m)보다 오차가 크면 "모바일에서 다시 시도" 안내를 띄웁니다. 인증은 막지 않습니다. */
export const LOW_ACCURACY_METERS = 1000;

/** 인증 유효기간(일). DB 함수 `is_neighborhood_verified`의 `interval '30 days'`와 같아야 합니다. */
export const NEIGHBORHOOD_VERIFICATION_TTL_DAYS = 30;
