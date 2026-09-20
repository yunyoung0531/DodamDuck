import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/libs/supabase/server';
import {
  FAILURE_KIND,
  NO_OUTPUT_KINDS,
  generateWithFallback,
} from '@/services/ai/generate-post-core';
import type { Failure } from '@/services/ai/generate-post-core';

/**
 * 사진 → 게시글 자동 생성.
 *
 * 여기서는 HTTP만 다룬다 — 인증, 페이로드 검증, 실패 종류에 맞는 상태 코드.
 * 모델을 어떻게 두드리는지는 `@/services/ai/generate-post-core`에 있다.
 *
 * 문서: docs/ai-generate-post.md
 */

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
];

const MAX_BASE64_SIZE = 7 * 1024 * 1024; // ~5MB 원본 이미지 → ~6.7MB base64
const MAX_REQUEST_SIZE = 8 * 1024 * 1024; // base64 + mimeType 등 여유 포함

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
 *
 * 가르는 기준은 "모델에 닿았는데 결과가 나빴는가(500)" vs
 * "모델에 닿지도 못했는가(429/503)"다. 전자는 다시 눌러도 비슷하고
 * 후자는 다시 누르면 될 수도 있어서, 사용자가 할 일이 다르다.
 */
function toFailureResponse(failures: Failure[]) {
  // 체인의 모든 실패를 종류와 함께 남긴다. 한 줄만 남기면 진짜 원인이 가려진다.
  console.error(
    `[AI Generate Post Error] ${failures.length}건\n${failures
      .map((failure) => `(${failure.kind}) ${failure.detail}`)
      .join('\n')}`
  );

  const kinds = failures.map((failure) => failure.kind);

  if (kinds.includes(FAILURE_KIND.INVALID_KEY)) {
    return NextResponse.json(
      {
        error:
          'API 키가 유효하지 않습니다. .env.local의 OPENROUTER_API_KEY를 확인해주세요.',
      },
      { status: 503 }
    );
  }

  // 일일 한도는 재시도로 풀리지 않으므로 가장 먼저 구분해서 안내한다.
  if (kinds.includes(FAILURE_KIND.DAILY_QUOTA)) {
    return NextResponse.json(
      {
        error:
          'AI 무료 사용량을 모두 소진했습니다. 내일 다시 시도하거나 관리자에게 문의해주세요.',
      },
      { status: 429 }
    );
  }

  const reachedNoModel =
    kinds.length > 0 && kinds.every((kind) => NO_OUTPUT_KINDS.includes(kind));

  if (reachedNoModel) {
    // 전부 내려간 모델이면 기다려도 풀리지 않는다. 체인 교체가 필요하다는 뜻이라
    // 재시도 안내 대신 점검 안내를 준다 (`pnpm check:ai-models` 참고).
    const allUnavailable = kinds.every(
      (kind) => kind === FAILURE_KIND.UNAVAILABLE
    );

    return allUnavailable
      ? NextResponse.json(
          {
            error:
              '현재 사용할 수 있는 AI 모델이 없습니다. 관리자에게 문의해주세요.',
          },
          { status: 503 }
        )
      : NextResponse.json(
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
    return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 });
  }

  const image = await readImagePayload(request);

  if ('error' in image) {
    return NextResponse.json({ error: image.error }, { status: image.status });
  }

  const outcome = await generateWithFallback(apiKey, {
    imageBase64: image.imageBase64,
    mimeType: image.mimeType,
  });

  if (outcome.ok) {
    return NextResponse.json({ data: outcome.data });
  }

  return toFailureResponse(outcome.failures);
}
