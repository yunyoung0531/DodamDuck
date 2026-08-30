import { beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * AI 자동 작성 Route Handler 테스트.
 *
 * 무료 모델은 스키마를 강제할 수 없어 응답 형태가 매번 흔들린다.
 * 여기서 쓰는 응답 문자열은 전부 OpenRouter 실호출에서 실제로 받은 것으로,
 * 네트워크 없이 파싱·보정·폴백·에러 분류가 맞게 도는지 검증한다.
 */

const generateTextMock = vi.hoisted(() => vi.fn());
const getUserMock = vi.hoisted(() =>
  vi.fn<() => Promise<{ data: { user: { id: string } | null } }>>(async () => ({
    data: { user: { id: 'user-1' } },
  }))
);

vi.mock('ai', () => ({
  generateText: generateTextMock,
}));

vi.mock('@openrouter/ai-sdk-provider', () => ({
  createOpenRouter: () => (model: string) => model,
}));

vi.mock('@/libs/supabase/server', () => ({
  createServerSupabase: async () => ({ auth: { getUser: getUserMock } }),
}));

const { POST } = await import('@/app/api/ai/generate-post/route');

/** 실제 모델이 마크다운 펜스로 감싸 보내오는 형태 */
const FENCED_RESPONSE = `\`\`\`json
{"title":"레고 듀플로 기차 세트","content":"아이가 정말 좋아하던 기차 세트예요. 큼직한 블록이라 3세 아이도 안전하게 가지고 놀 수 있어요.","tags":["레고","듀플로","기차"],"category":"블록·퍼즐"}
\`\`\``;

/** 업스트림 공유 풀 혼잡 (모델별, 다른 모델로 폴백하면 됨) */
const UPSTREAM_429 =
  '[Google AI Studio] google/gemma-4-31b-it:free is temporarily rate-limited upstream. Please retry shortly';

/** 계정 단위 일일 한도 (모델을 바꿔도 소용없음) */
const DAILY_QUOTA_429 =
  'Rate limit exceeded: free-models-per-day. Add 10 credits to unlock 1000 free model requests per day';

function buildRequest(body: unknown = {
  imageBase64: 'aGVsbG8=',
  mimeType: 'image/png',
}) {
  return new Request('http://localhost/api/ai/generate-post', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  process.env.OPENROUTER_API_KEY = 'test-key';
  getUserMock.mockResolvedValue({ data: { user: { id: 'user-1' } } });
});

describe('POST /api/ai/generate-post', () => {
  it('마크다운 코드펜스로 감싼 응답을 파싱한다', async () => {
    generateTextMock.mockResolvedValue({ text: FENCED_RESPONSE });

    const response = await POST(buildRequest());
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data.title).toBe('레고 듀플로 기차 세트');
    expect(body.data.category).toBe('블록·퍼즐');
    expect(body.data.tags).toEqual(['레고', '듀플로', '기차']);
  });

  it('펜스 앞 설명에 중괄호가 섞여 있어도 코드펜스 안의 JSON을 쓴다', async () => {
    // 중괄호 스캔만으로는 앞쪽 {제목}에 걸려 파싱이 깨진다. 펜스 제거가 필요한 경우.
    generateTextMock.mockResolvedValue({
      text: `{제목}과 {내용}을 아래에 담았습니다.\n${FENCED_RESPONSE}`,
    });

    const response = await POST(buildRequest());
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data.title).toBe('레고 듀플로 기차 세트');
  });

  it('설명 문장이 앞뒤로 붙어 있어도 JSON 객체만 뽑아낸다', async () => {
    generateTextMock.mockResolvedValue({
      text: `물론이죠! 아래와 같이 작성했습니다.
{"title":"타요 버스","content":"아이가 아끼던 타요 버스입니다. 상태 좋아요. 2세 이상 추천합니다.","tags":["타요"],"category":"역할놀이·인형"}
도움이 되었길 바랍니다.`,
    });

    const response = await POST(buildRequest());
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data.title).toBe('타요 버스');
  });

  it('목록에 없는 카테고리는 기타로 보정한다', async () => {
    generateTextMock.mockResolvedValue({
      text: '{"title":"공룡 인형","content":"공룡을 좋아하는 아이에게 딱 맞는 인형이에요. 3세 이상 추천합니다.","tags":["공룡"],"category":"장난감"}',
    });

    const response = await POST(buildRequest());
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data.category).toBe('기타');
  });

  it('태그가 5개를 넘으면 5개로 자른다', async () => {
    generateTextMock.mockResolvedValue({
      text: '{"title":"퍼즐","content":"조각이 큼직해서 아이 혼자서도 맞출 수 있는 퍼즐입니다. 4세 이상.","tags":["a","b","c","d","e","f","g"],"category":"블록·퍼즐"}',
    });

    const response = await POST(buildRequest());
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data.tags).toHaveLength(5);
  });

  it('첫 모델이 업스트림 429면 다음 모델로 폴백한다', async () => {
    generateTextMock
      .mockRejectedValueOnce(new Error(UPSTREAM_429))
      .mockResolvedValueOnce({ text: FENCED_RESPONSE });

    const response = await POST(buildRequest());
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data.title).toBe('레고 듀플로 기차 세트');
    expect(generateTextMock).toHaveBeenCalledTimes(2);
  });

  it('스키마에 어긋난 응답이 오면 같은 모델로 재시도한다', async () => {
    generateTextMock
      .mockResolvedValueOnce({ text: '{"post":{"description":"엉뚱한 모양"}}' })
      .mockResolvedValueOnce({ text: FENCED_RESPONSE });

    const response = await POST(buildRequest());

    expect(response.status).toBe(200);
    expect(generateTextMock).toHaveBeenCalledTimes(2);
  });

  it('일일 한도에 걸리면 폴백 없이 즉시 중단하고 전용 안내를 준다', async () => {
    generateTextMock.mockRejectedValue(new Error(DAILY_QUOTA_429));

    const response = await POST(buildRequest());
    const body = await response.json();

    expect(response.status).toBe(429);
    expect(body.error).toContain('무료 사용량');
    // 계정 단위 한도라 다른 모델을 더 두드리지 않아야 한다
    expect(generateTextMock).toHaveBeenCalledTimes(1);
  });

  it('모든 모델이 혼잡하면 429로 안내하고 모델당 1회만 쓴다', async () => {
    generateTextMock.mockRejectedValue(new Error(UPSTREAM_429));

    const response = await POST(buildRequest());
    const body = await response.json();

    expect(response.status).toBe(429);
    expect(body.error).toContain('혼잡');
    // 혼잡은 같은 모델 재시도가 무의미하므로 모델 3개 = 3회로 끝나야 한다
    expect(generateTextMock).toHaveBeenCalledTimes(3);
  });

  it('계속 형식이 어긋나도 총 호출이 예산(4회)을 넘지 않는다', async () => {
    // 형식 오류는 같은 모델을 재시도하므로 상한이 없으면 3모델 × 2회 = 6회가 된다.
    // 무료 티어는 하루 50회뿐이라 이 상한이 실제로 예산을 지켜야 한다.
    generateTextMock.mockResolvedValue({ text: 'JSON이 아닌 응답입니다.' });

    const response = await POST(buildRequest());

    expect(response.status).toBe(500);
    expect(generateTextMock).toHaveBeenCalledTimes(4);
  });

  it('형식 실패로 끝나면 혼잡이 아니라 일반 실패로 안내한다', async () => {
    generateTextMock.mockResolvedValue({ text: '도와드릴 수 없습니다.' });

    const response = await POST(buildRequest());
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.error).toContain('실패');
  });

  it('로그인하지 않았으면 401을 반환한다', async () => {
    getUserMock.mockResolvedValue({ data: { user: null } });

    const response = await POST(buildRequest());

    expect(response.status).toBe(401);
    expect(generateTextMock).not.toHaveBeenCalled();
  });

  it('이미지가 없으면 400을 반환한다', async () => {
    const response = await POST(buildRequest({ mimeType: 'image/png' }));

    expect(response.status).toBe(400);
    expect(generateTextMock).not.toHaveBeenCalled();
  });

  it('지원하지 않는 형식이면 400을 반환한다', async () => {
    const response = await POST(
      buildRequest({ imageBase64: 'aGVsbG8=', mimeType: 'image/svg+xml' })
    );

    expect(response.status).toBe(400);
    expect(generateTextMock).not.toHaveBeenCalled();
  });
});
