'use client';

import { Map as KakaoMap, Polygon, useKakaoLoader } from 'react-kakao-maps-sdk';

import { Skeleton } from '@/components/ui/skeleton';
import { MAP_COLORS } from '@/constants/colors';
import type { BoundaryGeometry } from '@/services/neighborhood/neighborhood.types';

const KAKAO_MAP_JS_KEY = process.env.NEXT_PUBLIC_KAKAO_MAP_JS_KEY;

export interface NeighborhoodMapProps {
  /** 그릴 동의 경계. 지도 범위도 이 경계에 맞춥니다. */
  geometry: BoundaryGeometry;
}

/**
 * @description 판정된 동의 경계를 카카오 지도 위에 그립니다.
 *
 * @remarks
 * 사용자의 현재 좌표는 받지 않습니다. 지도 범위를 동 경계로 잡아 카카오에 가는 타일 요청도 동 단위로 남깁니다.
 * 키(`NEXT_PUBLIC_KAKAO_MAP_JS_KEY`)가 없거나 SDK 로드에 실패하면 아무것도 그리지 않습니다.
 * @internal
 * @name NeighborhoodMap
 */
export function NeighborhoodMap({ geometry }: NeighborhoodMapProps) {
  if (!KAKAO_MAP_JS_KEY) return null;

  return <KakaoBoundaryMap appkey={KAKAO_MAP_JS_KEY} geometry={geometry} />;
}

function KakaoBoundaryMap({
  appkey,
  geometry,
}: NeighborhoodMapProps & { appkey: string }) {
  const [isLoading, error] = useKakaoLoader({ appkey });
  const polygons = toLatLngPolygons(geometry);
  const [sw, ne] = boundingBox(polygons);

  if (isLoading) return <Skeleton className="h-56 w-full rounded-lg" />;
  if (error) return null;

  return (
    <KakaoMap
      center={{ lat: (sw.lat + ne.lat) / 2, lng: (sw.lng + ne.lng) / 2 }}
      draggable={false}
      zoomable={false}
      className="h-56 w-full rounded-lg"
      onCreate={(map) =>
        map.setBounds(
          new kakao.maps.LatLngBounds(
            new kakao.maps.LatLng(sw.lat, sw.lng),
            new kakao.maps.LatLng(ne.lat, ne.lng)
          )
        )
      }
    >
      {polygons.map((path, i) => (
        <Polygon
          key={i}
          path={path}
          fillColor={MAP_COLORS.NEIGHBORHOOD_FILL}
          fillOpacity={0.35}
          strokeColor={MAP_COLORS.NEIGHBORHOOD_STROKE}
          strokeWeight={2}
        />
      ))}
    </KakaoMap>
  );
}

interface LatLng {
  lat: number;
  lng: number;
}

function toLatLngPolygons(geometry: BoundaryGeometry): LatLng[][][] {
  const polygons =
    geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.coordinates;

  return polygons.map((rings) =>
    rings.map((ring) => ring.map(([lng, lat]) => ({ lat, lng })))
  );
}

function boundingBox(polygons: LatLng[][][]): [sw: LatLng, ne: LatLng] {
  const points = polygons.flat(2);
  const lats = points.map((p) => p.lat);
  const lngs = points.map((p) => p.lng);

  return [
    { lat: Math.min(...lats), lng: Math.min(...lngs) },
    { lat: Math.max(...lats), lng: Math.max(...lngs) },
  ];
}
