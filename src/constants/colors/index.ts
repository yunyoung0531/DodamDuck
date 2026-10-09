/**
 * 시맨틱 색상 토큰.
 *
 * Tailwind → className="bg-dodam-light", "text-gray-300" 등 Tailwind 클래스 사용.
 *
 * 이 파일은 Tailwind가 적용되지 않는 경우에만 사용한다.
 * 예: <SomeIcon color={ICON_COLORS.PLACEHOLDER} />
 */

/** Lucide 아이콘의 color prop에 사용하는 색상 */
export const ICON_COLORS = {
  /** 빈 상태 아이콘 (EmptyState 등) */
  PLACEHOLDER: '#d6d6d6',
  /** 비활성/보조 아이콘 */
  MUTED: '#adb5bd',
} as const;

/** 카카오 지도 도형의 색상. SDK가 CSS 변수를 읽지 못해 globals.css의 `--color-dodam-*` 값을 옮겨 둡니다. */
export const MAP_COLORS = {
  /** 인증할 동의 경계 채우기 (`--color-dodam-500`) */
  NEIGHBORHOOD_FILL: '#FFD600',
  /** 인증할 동의 경계선 (`--color-dodam-700`) */
  NEIGHBORHOOD_STROKE: '#ccab00',
} as const;
