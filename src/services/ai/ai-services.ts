import type { GeneratePostRequest, GeneratePostResponse } from './ai.types';

/**
 * 에러 응답 본문에서 `error` 문자열을 꺼냅니다. JSON이 아니거나 문자열 `error`가 없으면 `null`입니다.
 * @public
 */
export function parseErrorField(text: string): string | null {
  try {
    const body: unknown = JSON.parse(text);
    if (typeof body !== 'object' || body === null || !('error' in body)) {
      return null;
    }
    return typeof body.error === 'string' ? body.error : null;
  } catch {
    return null;
  }
}

export async function servGeneratePostFromImage(
  request: GeneratePostRequest
): Promise<GeneratePostResponse> {
  const response = await fetch('/api/ai/generate-post', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(parseErrorField(text) ?? '게시글 생성에 실패했습니다');
  }

  return response.json();
}
