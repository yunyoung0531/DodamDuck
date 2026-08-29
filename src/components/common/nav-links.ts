export const NAV_LINKS = [
  { href: '/sharing', label: '장난감 교환' },
  { href: '/library', label: '장난감 도서관' },
  { href: '/board', label: '게시판' },
  { href: '/my-shop', label: '내 상점' },
  { href: '/chat', label: '채팅' },
] as const;

/** 하위 경로(`/sharing/3`)에서도 상위 링크(`/sharing`)를 활성으로 본다. */
export function isActivePath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}