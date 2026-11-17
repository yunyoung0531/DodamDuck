import { PostgrestError, StorageApiError } from '@supabase/supabase-js';
import {
  DEFAULT_ERROR_MESSAGE,
  getErrorMessage,
  isNotFoundError,
} from '@/libs/error-message';

/** `if (error) throw error`가 던지는 모양. postgrest-js는 응답 JSON을 클래스로 감싸지 않는다. */
function postgrestErrorObject(code: string, message = 'original message') {
  return { code, message, details: '', hint: '' };
}

describe('getErrorMessage', () => {
  it.each([
    ['23505', '이미 등록된 내용입니다.'],
    ['42501', '권한이 없어 처리할 수 없습니다.'],
    ['PGRST116', '요청한 데이터를 찾을 수 없습니다.'],
    ['PGRST301', '로그인이 필요하거나 세션이 만료되었습니다.'],
  ])('Postgres 코드 %s를 한국어 문구로 바꾼다', (code, expected) => {
    expect(getErrorMessage(postgrestErrorObject(code))).toBe(expected);
  });

  it('PostgrestError 인스턴스도 같은 문구로 바꾼다', () => {
    const error = new PostgrestError({
      code: '23505',
      message: 'duplicate key value violates unique constraint',
      details: '',
      hint: '',
    });

    expect(getErrorMessage(error)).toBe('이미 등록된 내용입니다.');
  });

  it('매핑되지 않은 Postgres 코드는 원문 대신 기본 문구를 돌려준다', () => {
    const error = postgrestErrorObject(
      '22P02',
      'invalid input syntax for type uuid'
    );

    expect(getErrorMessage(error)).toBe(DEFAULT_ERROR_MESSAGE);
  });

  it('메시지에 row-level security가 있으면 권한 문구를 돌려준다', () => {
    const error = postgrestErrorObject(
      '',
      'new row violates row-level security policy for table "sharing_posts"'
    );

    expect(getErrorMessage(error)).toBe('권한이 없어 처리할 수 없습니다.');
  });

  it('네트워크 실패로 코드가 빈 Postgres 에러는 기본 문구를 돌려준다', () => {
    const error = postgrestErrorObject('', 'TypeError: Failed to fetch');

    expect(getErrorMessage(error)).toBe(DEFAULT_ERROR_MESSAGE);
  });

  it('Storage 에러는 Error 검사보다 먼저 걸려 업로드 문구를 돌려준다', () => {
    const error = new StorageApiError('Payload too large', 413, '413');

    expect(error).toBeInstanceOf(Error);
    expect(getErrorMessage(error)).toBe('이미지 업로드에 실패했습니다.');
  });

  it('우리 코드가 던진 Error의 message는 그대로 돌려준다', () => {
    expect(getErrorMessage(new Error('인증이 필요합니다'))).toBe(
      '인증이 필요합니다'
    );
  });

  it.each([undefined, null, 'string error', 42])(
    'Error가 아닌 값(%s)은 기본 문구를 돌려준다',
    (value) => {
      expect(getErrorMessage(value)).toBe(DEFAULT_ERROR_MESSAGE);
    }
  );
});

describe('isNotFoundError', () => {
  it('PGRST116이면 참이다', () => {
    expect(isNotFoundError(postgrestErrorObject('PGRST116'))).toBe(true);
  });

  it.each([postgrestErrorObject('42501'), new Error('PGRST116'), undefined])(
    'PGRST116이 아니면 거짓이다',
    (value) => {
      expect(isNotFoundError(value)).toBe(false);
    }
  );
});
