import {
  buildAuthHref,
  isAuthPage,
  toSafeCallbackUrl,
} from '@/libs/auth-redirect';

describe('toSafeCallbackUrl', () => {
  it('같은 사이트 경로는 그대로 돌려준다', () => {
    expect(toSafeCallbackUrl('/sharing/3?tab=info')).toBe(
      '/sharing/3?tab=info'
    );
  });

  it.each([null, undefined, ''])('값이 없으면(%s) /를 돌려준다', (value) => {
    expect(toSafeCallbackUrl(value)).toBe('/');
  });

  it.each(['https://evil.com', '//evil.com', '/\\evil.com', 'sharing'])(
    '외부로 나가는 값(%s)은 /로 바꾼다',
    (value) => {
      expect(toSafeCallbackUrl(value)).toBe('/');
    }
  );

  it.each(['/signin', '/signup?callbackUrl=/chat'])(
    '로그인/회원가입 화면(%s)은 /로 바꾼다',
    (value) => {
      expect(toSafeCallbackUrl(value)).toBe('/');
    }
  );
});

describe('buildAuthHref', () => {
  it('돌아갈 경로를 인코딩해 callbackUrl로 붙인다', () => {
    expect(buildAuthHref('/signin', '/sharing?q=레고')).toBe(
      `/signin?callbackUrl=${encodeURIComponent('/sharing?q=레고')}`
    );
  });

  it('돌아갈 곳이 /면 쿼리를 붙이지 않는다', () => {
    expect(buildAuthHref('/signup', '/')).toBe('/signup');
  });

  it('검증을 통과하지 못한 경로는 버린다', () => {
    expect(buildAuthHref('/signin', '//evil.com')).toBe('/signin');
  });
});

describe('isAuthPage', () => {
  it('/signin과 /signup만 인증 화면으로 본다', () => {
    expect(isAuthPage('/signin')).toBe(true);
    expect(isAuthPage('/signup')).toBe(true);
    expect(isAuthPage('/sharing')).toBe(false);
  });
});
