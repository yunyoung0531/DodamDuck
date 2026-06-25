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
