/** 매핑되지 않은 에러에 보여 줄 문구. 원문을 사용자에게 노출하지 않으려고 씁니다. */
export const DEFAULT_ERROR_MESSAGE = '요청을 처리하는 중 문제가 발생했습니다.';

const PERMISSION_DENIED_MESSAGE = '권한이 없어 처리할 수 없습니다.';
const STORAGE_ERROR_MESSAGE = '이미지 업로드에 실패했습니다.';
const NOT_FOUND_CODE = 'PGRST116';

const POSTGRES_ERROR_MESSAGES: Record<string, string> = {
  '23505': '이미 등록된 내용입니다.',
  '23503': '연결된 데이터가 없어 처리할 수 없습니다.',
  '23514': '입력값이 허용된 범위를 벗어났습니다.',
  '42501': PERMISSION_DENIED_MESSAGE,
  [NOT_FOUND_CODE]: '요청한 데이터를 찾을 수 없습니다.',
  PGRST301: '로그인이 필요하거나 세션이 만료되었습니다.',
};

interface PostgrestErrorLike {
  code: string;
  message: string;
}

/**
 * postgrest-js는 `.throwOnError()`를 쓰지 않으면 응답 JSON을 클래스로 감싸지 않으므로 `instanceof PostgrestError`로는 잡히지 않습니다.
 * 모양(`code`, `message` 문자열)으로 판별합니다.
 */
function isPostgrestErrorLike(error: unknown): error is PostgrestErrorLike {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof error.code === 'string' &&
    'message' in error &&
    typeof error.message === 'string'
  );
}

/** storage-js의 `isStorageError`와 같은 판별입니다. supabase-js가 이 함수를 export하지 않습니다. */
function isStorageError(error: unknown): boolean {
  return (
    typeof error === 'object' && error !== null && '__isStorageError' in error
  );
}

/**
 * @description 에러를 사용자에게 보여 줄 한국어 문구로 바꿉니다.
 *
 * @remarks
 * 매핑되지 않은 Postgres 코드는 원문 대신 `DEFAULT_ERROR_MESSAGE`를 돌려줍니다.
 * Storage 에러는 `Error`를 상속하므로 `Error` 검사보다 먼저 봅니다. 우리 코드가 던진 `Error`의 한국어 `message`는 그대로 통과합니다.
 * @see docs/error-handling.md
 * @public
 */
export function getErrorMessage(error: unknown): string {
  if (isPostgrestErrorLike(error)) {
    const mapped = POSTGRES_ERROR_MESSAGES[error.code];
    if (mapped) return mapped;
    if (error.message.includes('row-level security')) {
      return PERMISSION_DENIED_MESSAGE;
    }
    return DEFAULT_ERROR_MESSAGE;
  }
  if (isStorageError(error)) return STORAGE_ERROR_MESSAGE;
  if (error instanceof Error) return error.message;
  return DEFAULT_ERROR_MESSAGE;
}

/**
 * `.single()` 조회에서 행이 없어 실패했는지 판별합니다. 다시 시도해도 결과가 같으므로 재시도 버튼을 숨길 때 씁니다.
 * @public
 */
export function isNotFoundError(error: unknown): boolean {
  return isPostgrestErrorLike(error) && error.code === NOT_FOUND_CODE;
}
