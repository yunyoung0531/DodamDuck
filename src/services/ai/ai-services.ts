import type { GeneratePostRequest, GeneratePostResponse } from './ai.types';

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
    let message = '게시글 생성에 실패했습니다';
    try {
      const body = JSON.parse(text) as { error?: string };
      if (typeof body.error === 'string') {
        message = body.error;
      }
    } catch {
      // JSON 파싱 실패 시 기본 메시지 사용
    }
    throw new Error(message);
  }

  return response.json();
}
