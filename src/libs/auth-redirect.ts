const AUTH_PAGES = ['/signin', '/signup'] as const;

type AuthPage = (typeof AUTH_PAGES)[number];

/**
 * 로그인/회원가입 화면인지 판별합니다. 쿼리를 뗀 경로를 넘겨야 합니다.
 * @public
 */
export function isAuthPage(pathname: string): boolean {
  return AUTH_PAGES.some((page) => pathname === page);
}

/**
 * @description 로그인/회원가입 뒤 돌아갈 경로를 검증합니다.
 *
 * @remarks
 * 같은 사이트 경로(`/`로 시작하고 `//`, `/\`로 시작하지 않음)만 통과시키고 나머지는 `/`로 바꿉니다.
 * 외부로 보내는 open redirect와 로그인 화면으로 되돌아가는 루프를 막습니다.
 * @public
 */
export function toSafeCallbackUrl(value: string | null | undefined): string {
  if (!value || !value.startsWith('/')) return '/';
  if (value.startsWith('//') || value.startsWith('/\\')) return '/';
  const [pathname = value] = value.split(/[?#]/);
  if (isAuthPage(pathname)) return '/';
  return value;
}

/**
 * `callbackUrl`을 붙인 로그인/회원가입 경로를 만듭니다. 돌아갈 곳이 `/`면 쿼리를 생략합니다.
 * @public
 */
export function buildAuthHref(page: AuthPage, callbackUrl: string): string {
  const safeUrl = toSafeCallbackUrl(callbackUrl);
  if (safeUrl === '/') return page;
  return `${page}?callbackUrl=${encodeURIComponent(safeUrl)}`;
}
