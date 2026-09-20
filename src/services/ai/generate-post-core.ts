import { generateText } from 'ai';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { generatedPostSchema } from '@/libs/validations/ai';
import { AI_MODEL_CHAIN } from '@/services/ai/model-chain';
import {
  MAX_TAG_COUNT,
  SHARING_CATEGORY,
  SHARING_CATEGORY_VALUES,
} from '@/services/sharing/sharing.types';
import type { LanguageModel } from 'ai';
import type { ZodError } from 'zod';
import type { GeneratedPost } from '@/libs/validations/ai';

/**
 * 사진 → 게시글 생성의 알맹이. HTTP(인증·페이로드 검증·응답 코드)는
 * Route Handler가 맡고, 여기서는 "모델을 어떻게 두드려 결과를 얻는가"만 다룬다.
 *
 * 분리한 이유는 스모크 테스트(`pnpm smoke:ai-models`)가 이 경로를 **그대로**
 * 타야 하기 때문이다. 테스트가 별도 구현을 들고 있으면 둘이 갈라지고,
 * 정작 실제 경로가 깨졌을 때 초록불이 뜬다.
 *
 * 문서: docs/ai-generate-post.md
 */

/** 모델 하나당 형식 오류 재시도 횟수 (첫 시도 포함) */
const ATTEMPTS_PER_MODEL = 2;

/**
 * 요청 1건이 쓸 수 있는 총 "생성" 호출 수 상한.
 *
 * OpenRouter 무료 티어는 계정 단위로 하루 50회(크레딧 $10 충전 시 1000회)라,
 * 체인을 끝까지 도는 것(3모델 × 2회 = 6회)만으로 하루 예산의 12%가 날아간다.
 * 가용성을 위해 모델은 3개를 두되, 실제 소비는 이 상한으로 묶는다.
 *
 * 모델이 아예 내려가 생성이 일어나지 않은 호출(UNAVAILABLE)은 예산에서 뺀다.
 * 죽은 모델이 살아있는 폴백의 몫까지 잡아먹으면 안 되기 때문이다.
 */
const MAX_TOTAL_ATTEMPTS = 4;

/**
 * 시도 1회가 실패한 이유. 대응이 전부 다르므로 문자열을 다시 정규식으로
 * 훑지 않고 분류 결과를 그대로 들고 다닌다.
 *
 * - FORMAT        응답은 왔는데 JSON/스키마가 어긋남 → 같은 모델 재시도
 * - RATE_LIMITED  공급자 공유 풀 혼잡(모델 단위) → 다음 모델
 * - UNAVAILABLE   그 모델이 더 이상 서비스되지 않음(404/403) → 다음 모델, 예산 미소모
 * - API_ERROR     그 밖의 호출 실패 → 다음 모델
 * - DAILY_QUOTA   계정 단위 일일 한도 → 즉시 중단
 * - INVALID_KEY   키 문제 → 즉시 중단
 */
export const FAILURE_KIND = {
  FORMAT: 'format',
  RATE_LIMITED: 'rate-limited',
  UNAVAILABLE: 'unavailable',
  API_ERROR: 'api-error',
  DAILY_QUOTA: 'daily-quota',
  INVALID_KEY: 'invalid-key',
} as const;

export type FailureKind = (typeof FAILURE_KIND)[keyof typeof FAILURE_KIND];

export interface Failure {
  kind: FailureKind;
  detail: string;
}

/** 다른 모델로 바꿔도 소용없는, 요청 전체를 접어야 하는 실패 */
export const FATAL_KINDS: readonly FailureKind[] = [
  FAILURE_KIND.DAILY_QUOTA,
  FAILURE_KIND.INVALID_KEY,
];

/** 모델이 응답 본문을 만들지 못한 실패 — "혼잡/점검 중" 안내가 맞는 경우 */
export const NO_OUTPUT_KINDS: readonly FailureKind[] = [
  FAILURE_KIND.RATE_LIMITED,
  FAILURE_KIND.UNAVAILABLE,
  FAILURE_KIND.API_ERROR,
];

/**
 * 호출 예외 메시지를 대응 가능한 종류로 나눈다.
 *
 * 일일 한도는 계정 단위라 레이트리밋 패턴에도 걸리므로 반드시 먼저 검사한다.
 * UNAVAILABLE 패턴은 실제로 관측된 문구다 —
 *   404 "No endpoints found for nvidia/nemotron-nano-12b-v2-vl:free."
 *   403 "... is only available on agentic harnesses"
 */
export function classifyApiError(message: string): FailureKind {
  if (/free-models-per-day|openrouter_free_tier_daily/i.test(message)) {
    return FAILURE_KIND.DAILY_QUOTA;
  }
  if (
    /invalid[_ ]api[_ ]key|invalid api|no auth credentials|\b401\b/i.test(
      message
    )
  ) {
    return FAILURE_KIND.INVALID_KEY;
  }
  if (
    /no endpoints found|only available on|not available|\b404\b|\b403\b/i.test(
      message
    )
  ) {
    return FAILURE_KIND.UNAVAILABLE;
  }
  if (/rate[-_ ]?limit|429|quota/i.test(message)) {
    return FAILURE_KIND.RATE_LIMITED;
  }
  return FAILURE_KIND.API_ERROR;
}

export const AI_POST_PROMPT = `당신은 유아용품 교환/나눔 플랫폼 "도담덕"의 게시글 작성 도우미입니다.
사용자가 업로드한 장난감/유아용품 사진을 분석하여 교환/나눔 게시글을 작성해주세요.

1. title (상품명): 브랜드 + 상품명, 30자 이내
2. content (상품 설명): 종류, 구성품, 적합 연령대, 50~200자, 따뜻한 말투
3. tags (해시태그): 관련 키워드 1~${MAX_TAG_COUNT}개, '#' 없이
4. category (카테고리): 아래 6종 중 하나를 글자 그대로 (임의로 바꾸지 마세요)
${SHARING_CATEGORY_VALUES.map((value) => `   - ${value}`).join('\n')}

설명·인사말·마크다운 코드펜스 없이 아래 형태의 JSON 객체 하나만 출력하세요:
{"title": "...", "content": "...", "tags": ["...", "..."], "category": "..."}`;

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

export interface ImageInput {
  imageBase64: string;
  mimeType: string;
}

export type AttemptResult = { data: GeneratedPost } | { failure: Failure };

export type GenerateOutcome =
  | { ok: true; data: GeneratedPost }
  | { ok: false; failures: Failure[] };

/** 모델 한 번 호출 → 파싱·검증까지. 성공하면 data, 아니면 분류된 실패. */
export async function runModelAttempt(
  model: LanguageModel,
  { imageBase64, mimeType }: ImageInput
): Promise<AttemptResult> {
  try {
    const { text } = await generateText({
      model,
      maxRetries: 0, // 체인이 재시도를 관리하므로 SDK 재시도는 끈다
      messages: [
        {
          role: 'user',
          content: [
            { type: 'file', data: imageBase64, mediaType: mimeType },
            { type: 'text', text: AI_POST_PROMPT },
          ],
        },
      ],
    });

    const parsed = generatedPostSchema.safeParse(
      coerceGeneratedPost(extractJsonObject(text))
    );

    return parsed.success
      ? { data: parsed.data }
      : {
          failure: {
            kind: FAILURE_KIND.FORMAT,
            detail: describeSchemaFailure(parsed.error, text),
          },
        };
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    return { failure: { kind: classifyApiError(detail), detail } };
  }
}

/** 모델 id 하나를 실제로 호출한다. 스모크 테스트가 모델별 생존을 볼 때 쓴다. */
export async function probeModel(
  apiKey: string,
  model: string,
  image: ImageInput
): Promise<AttemptResult> {
  const openrouter = createOpenRouter({ apiKey });
  return runModelAttempt(openrouter(model), image);
}

/**
 * 모델 체인을 순서대로 돌며 스키마에 맞는 결과가 나올 때까지 시도한다.
 * 무료 모델은 스키마를 강제할 수 없어 파싱·검증 실패가 정상 경로에 섞여 들어오므로,
 * 모델 교체(429·404)와 형식 오류(같은 모델 재시도)를 함께 흡수한다.
 */
export async function generateWithFallback(
  apiKey: string,
  image: ImageInput
): Promise<GenerateOutcome> {
  const openrouter = createOpenRouter({ apiKey });
  // 체인 전체의 실패를 모아둔다. 마지막 실패만 남기면 앞선 모델이 왜
  // 떨어졌는지가 가려져서(예: 스키마 실패 뒤 폴백이 429) 원인 파악이 막힌다.
  const failures: Failure[] = [];
  let spent = 0;

  for (const model of AI_MODEL_CHAIN) {
    for (let attempt = 1; attempt <= ATTEMPTS_PER_MODEL; attempt += 1) {
      if (spent >= MAX_TOTAL_ATTEMPTS) return { ok: false, failures };

      const result = await runModelAttempt(openrouter(model), image);

      if ('data' in result) {
        return { ok: true, data: result.data };
      }

      const { kind, detail } = result.failure;
      failures.push({ kind, detail: `[${model} #${attempt}] ${detail}` });

      // 모델이 내려가 생성 자체가 없었던 호출은 예산을 쓰지 않은 것으로 본다.
      if (kind !== FAILURE_KIND.UNAVAILABLE) spent += 1;

      // 일일 한도·키 문제는 다른 모델로 바꿔도 똑같이 막힌다. 즉시 중단.
      if (FATAL_KINDS.includes(kind)) return { ok: false, failures };

      // 형식 오류만 같은 모델 재시도가 의미 있다. 나머지는 다음 모델로.
      if (kind !== FAILURE_KIND.FORMAT) break;
    }
  }

  return { ok: false, failures };
}
