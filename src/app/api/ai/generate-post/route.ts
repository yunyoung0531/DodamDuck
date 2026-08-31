import { NextResponse } from 'next/server';
import { generateText } from 'ai';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { createServerSupabase } from '@/libs/supabase/server';
import { generatedPostSchema } from '@/libs/validations/ai';
import {
  MAX_TAG_COUNT,
  SHARING_CATEGORY,
  SHARING_CATEGORY_VALUES,
} from '@/services/sharing/sharing.types';
import type { LanguageModel } from 'ai';
import type { ZodError } from 'zod';
import type { GeneratedPost } from '@/libs/validations/ai';

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
];

const MAX_BASE64_SIZE = 7 * 1024 * 1024; // ~5MB 원본 이미지 → ~6.7MB base64
const MAX_REQUEST_SIZE = 8 * 1024 * 1024; // base64 + mimeType 등 여유 포함

/**
 * 순서대로 시도하는 모델 체인.
 *
 * 무료 변종은 OpenRouter 공유 풀을 쓰기 때문에 상시 429가 나고,
 * `structured_outputs`도 유료 변종에만 남아 있다. 그래서 여기서는
 * response_format(json_schema)에 기대지 않고 응답 텍스트를 직접 파싱한다.
 *
 * 순서는 실측 기준이다. gemma-31b가 한국어 품질·속도(약 4초) 모두 가장 낫고,
 * nemotron은 느리고(10~25초) 한국어가 자주 깨지지만 gemma 풀이 429일 때
 * 유일하게 살아있는 경우가 많아 2순위로 둔다. 26b는 최후 폴백.
 * 유료 전환 시에는 'google/gemma-4-26b-a4b-it'를 맨 앞에 추가하면 된다.
 */
const MODEL_CHAIN = [
  'google/gemma-4-31b-it:free',
  'nvidia/nemotron-nano-12b-v2-vl:free',
  'google/gemma-4-26b-a4b-it:free',
] as const;

/** 모델 하나당 파싱 실패 시 재시도 횟수 (첫 시도 포함) */
const ATTEMPTS_PER_MODEL = 2;

/**
 * 요청 1건이 쓸 수 있는 총 호출 수 상한.
 *
 * OpenRouter 무료 티어는 계정 단위로 하루 50회(크레딧 $10 충전 시 1000회)라,
 * 체인을 끝까지 도는 것(3모델 × 2회 = 6회)만으로 하루 예산의 12%가 날아간다.
 * 가용성을 위해 모델은 3개를 두되, 실제 소비는 이 상한으로 묶는다.
 */
const MAX_TOTAL_ATTEMPTS = 4;

/**
 * 모델이 흔히 덧붙이는 마크다운 펜스·설명 문장을 걷어내고
 * 본문에서 첫 JSON 객체만 추출한다. 파싱 불가 시 null.
 */
function extractJsonObject(text: string): unknown {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const body = fenced?.[1] ?? text;
  const start = body.indexOf('{');
  const end = body.lastIndexOf('}');

  if (start === -1 || end === -1 || end < start) return null;

  try {
    return JSON.parse(body.slice(start, end + 1));
  } catch {
    return null;
  }
}

function isRateLimitError(message: string): boolean {
  return /rate[-_ ]?limit|429|quota/i.test(message);
}

/**
 * 계정 단위 무료 모델 일일 한도(기본 50회)에 걸린 경우.
 * 공급자 풀 혼잡과 달리 잠시 후 재시도해도 소용없고 자정(UTC)에야 풀리므로,
 * 안내 문구와 대응이 전혀 달라 따로 구분한다.
 */
function isDailyQuotaError(message: string): boolean {
  return /free-models-per-day|openrouter_free_tier_daily/i.test(message);
}

/**
 * 무료 모델은 스키마를 강제할 수 없어 사소한 형태 위반이 잦다.
 * 태그 개수 초과나 목록 밖 카테고리 때문에 생성 전체를 버리는 대신,
 * 사용자가 어차피 폼에서 수정할 수 있는 항목은 안전한 값으로 보정한다.
 * title·content가 비어 있는 경우만 진짜 실패로 본다.
 */
function coerceGeneratedPost(raw: unknown): unknown {
  if (typeof raw !== 'object' || raw === null) return raw;

  const record = raw as Record<string, unknown>;
  const category = record.category;
  const tags = record.tags;

  return {
    ...record,
    tags: Array.isArray(tags)
      ? tags
          .filter((tag): tag is string => typeof tag === 'string')
          .slice(0, MAX_TAG_COUNT)
      : [],
    category: SHARING_CATEGORY_VALUES.some((value) => value === category)
      ? category
      : SHARING_CATEGORY.ETC,
  };
}

/** 어떤 필드가 왜 어긋났는지 + 실제 응답 앞부분을 함께 남긴다. */
function describeSchemaFailure(error: ZodError, text: string): string {
  const issues = error.issues
    .map((issue) => `${issue.path.join('.') || 'root'} ${issue.message}`)
    .join(', ');

  return `스키마 불일치: ${issues} | 응답 앞부분: ${text.slice(0, 120)}`;
}

interface GenerateParams {
  apiKey: string;
  imageBase64: string;
  mimeType: string;
}

type GenerateOutcome =
  | { ok: true; data: GeneratedPost }
  | { ok: false; failures: string[] };

/** 모델 한 번 호출 → 파싱·검증까지. 성공하면 data, 아니면 실패 사유 문자열. */
async function runAttempt(
  model: LanguageModel,
  { imageBase64, mimeType }: Omit<GenerateParams, 'apiKey'>
): Promise<{ data: GeneratedPost } | { failure: string }> {
  try {
    const { text } = await generateText({
      model,
      maxRetries: 0, // 체인이 재시도를 관리하므로 SDK 재시도는 끈다
      messages: [
        {
          role: 'user',
          content: [
            { type: 'file', data: imageBase64, mediaType: mimeType },
            { type: 'text', text: SYSTEM_PROMPT },
          ],
        },
      ],
    });

    const parsed = generatedPostSchema.safeParse(
      coerceGeneratedPost(extractJsonObject(text))
    );

    return parsed.success
      ? { data: parsed.data }
      : { failure: describeSchemaFailure(parsed.error, text) };
  } catch (error) {
    return {
      failure: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * 모델 체인을 순서대로 돌며 스키마에 맞는 결과가 나올 때까지 시도한다.
 * 무료 모델은 스키마를 강제할 수 없어 파싱·검증 실패가 정상 경로에 섞여 들어오므로,
 * 429(모델 교체)와 형식 오류(같은 모델 재시도)를 함께 흡수한다.
 */
async function generateWithFallback({
  apiKey,
  imageBase64,
  mimeType,
}: GenerateParams): Promise<GenerateOutcome> {
  const openrouter = createOpenRouter({ apiKey });
  // 체인 전체의 실패를 모아둔다. 마지막 실패만 남기면 앞선 모델이 왜
  // 떨어졌는지가 가려져서(예: 스키마 실패 뒤 폴백이 429) 원인 파악이 막힌다.
  const failures: string[] = [];
  let spent = 0;

  for (const model of MODEL_CHAIN) {
    for (let attempt = 1; attempt <= ATTEMPTS_PER_MODEL; attempt += 1) {
      if (spent >= MAX_TOTAL_ATTEMPTS) return { ok: false, failures };
      spent += 1;

      const result = await runAttempt(openrouter(model), {
        imageBase64,
        mimeType,
      });

      if ('data' in result) {
        return { ok: true, data: result.data };
      }

      failures.push(`[${model} #${attempt}] ${result.failure}`);

      // 일일 한도는 계정 단위라 다른 모델로 바꿔도 똑같이 막힌다. 즉시 중단.
      if (isDailyQuotaError(result.failure)) return { ok: false, failures };

      // 레이트리밋은 같은 모델을 더 두드려도 소용없다. 다음 모델로 넘어간다.
      if (isRateLimitError(result.failure)) break;
    }
  }

  return { ok: false, failures };
}

const SYSTEM_PROMPT = `당신은 유아용품 교환/나눔 플랫폼 "도담덕"의 게시글 작성 도우미입니다.
사용자가 업로드한 장난감/유아용품 사진을 분석하여 교환/나눔 게시글을 작성해주세요.

1. title (상품명): 브랜드 + 상품명, 30자 이내
2. content (상품 설명): 종류, 구성품, 적합 연령대, 50~200자, 따뜻한 말투
3. tags (해시태그): 관련 키워드 1~${MAX_TAG_COUNT}개, '#' 없이
4. category (카테고리): 아래 6종 중 하나를 글자 그대로 (임의로 바꾸지 마세요)
${SHARING_CATEGORY_VALUES.map((value) => `   - ${value}`).join('\n')}

설명·인사말·마크다운 코드펜스 없이 아래 형태의 JSON 객체 하나만 출력하세요:
{"title": "...", "content": "...", "tags": ["...", "..."], "category": "..."}`;

type ImagePayload =
  | { imageBase64: string; mimeType: string }
  | { error: string; status: number };

/** 요청 본문에서 이미지를 꺼내 크기·형식을 검증한다. */
async function readImagePayload(request: Request): Promise<ImagePayload> {
  const contentLength = Number(request.headers.get('content-length') ?? '0');
  if (contentLength > MAX_REQUEST_SIZE) {
    return {
      error: '요청 크기가 너무 큽니다. 이미지는 5MB 이하만 가능합니다.',
      status: 413,
    };
  }

  const body = await request.json().catch(() => null);

  if (!body?.imageBase64 || !body?.mimeType) {
    return { error: '이미지 데이터가 필요합니다', status: 400 };
  }

  const { imageBase64, mimeType } = body as {
    imageBase64: string;
    mimeType: string;
  };

  if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
    return {
      error: '지원하지 않는 이미지 형식입니다 (JPEG, PNG, GIF, WebP만 가능)',
      status: 400,
    };
  }

  if (imageBase64.length > MAX_BASE64_SIZE) {
    return { error: '이미지 크기는 5MB 이하만 가능합니다', status: 400 };
  }

  return { imageBase64, mimeType };
}

/**
 * 체인이 전부 실패했을 때의 응답. 실패 목록 전체를 보고 판단한다.
 */
function toFailureResponse(failures: string[]) {
  // 체인의 모든 실패를 남긴다. 한 줄만 남기면 진짜 원인이 가려진다.
  console.error(
    `[AI Generate Post Error] ${failures.length}건\n${failures.join('\n')}`
  );

  if (failures.some((f) => /invalid_api_key|Invalid API|\b401\b/.test(f))) {
    return NextResponse.json(
      {
        error:
          'API 키가 유효하지 않습니다. .env.local의 OPENROUTER_API_KEY를 확인해주세요.',
      },
      { status: 503 }
    );
  }

  // 일일 한도는 재시도로 풀리지 않으므로 가장 먼저 구분해서 안내한다.
  if (failures.some(isDailyQuotaError)) {
    return NextResponse.json(
      {
        error:
          'AI 무료 사용량을 모두 소진했습니다. 내일 다시 시도하거나 관리자에게 문의해주세요.',
      },
      { status: 429 }
    );
  }

  // 전부 레이트리밋일 때만 혼잡으로 안내한다. 하나라도 다른 이유로 실패했다면
  // 그건 모델 품질/형식 문제이므로 "잠시 후 재시도" 안내가 오히려 오해를 준다.
  if (failures.length > 0 && failures.every(isRateLimitError)) {
    return NextResponse.json(
      {
        error:
          'AI 서버가 혼잡합니다(무료 모델 호출 한도). 잠시 후 다시 시도해주세요.',
      },
      { status: 429 }
    );
  }

  return NextResponse.json(
    { error: 'AI 게시글 생성에 실패했습니다. 잠시 후 다시 시도해주세요.' },
    { status: 500 }
  );
}

export async function POST(request: Request) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'AI 기능을 사용하려면 OpenRouter API 키를 설정해주세요' },
      { status: 503 }
    );
  }

  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: '로그인이 필요합니다' },
      { status: 401 }
    );
  }

  const image = await readImagePayload(request);

  if ('error' in image) {
    return NextResponse.json({ error: image.error }, { status: image.status });
  }

  const { imageBase64, mimeType } = image;

  const outcome = await generateWithFallback({
    apiKey,
    imageBase64,
    mimeType,
  });

  if (outcome.ok) {
    return NextResponse.json({ data: outcome.data });
  }

  return toFailureResponse(outcome.failures);
}
