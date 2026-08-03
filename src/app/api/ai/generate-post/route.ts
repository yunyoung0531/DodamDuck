import { NextResponse } from 'next/server';
import { generateText, Output } from 'ai';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { createClient } from '@/libs/supabase/server';
import { generatedPostSchema } from '@/libs/validations/ai';
import { SHARING_CATEGORY_VALUES } from '@/services/sharing/sharing.types';

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
];

const MAX_BASE64_SIZE = 7 * 1024 * 1024; // ~5MB 원본 이미지 → ~6.7MB base64
const MAX_REQUEST_SIZE = 8 * 1024 * 1024; // base64 + mimeType 등 여유 포함

const SYSTEM_PROMPT = `당신은 유아용품 교환/나눔 플랫폼 "도담덕"의 게시글 작성 도우미입니다.
사용자가 업로드한 장난감/유아용품 사진을 분석하여 교환/나눔 게시글을 작성해주세요.

1. title (상품명): 브랜드 + 상품명, 30자 이내
2. content (상품 설명): 종류, 구성품, 적합 연령대, 50~200자, 따뜻한 말투
3. tags (해시태그): 관련 키워드 1~5개, '#' 없이
4. category (카테고리): 아래 6종 중 하나를 글자 그대로 (임의로 바꾸지 마세요)
${SHARING_CATEGORY_VALUES.map((value) => `   - ${value}`).join('\n')}

반드시 JSON 형식으로만 응답하세요:
{"title": "...", "content": "...", "tags": ["...", "..."], "category": "..."}`;

export async function POST(request: Request) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'AI 기능을 사용하려면 OpenRouter API 키를 설정해주세요' },
      { status: 503 }
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: '로그인이 필요합니다' },
      { status: 401 }
    );
  }

  const contentLength = Number(request.headers.get('content-length') ?? '0');
  if (contentLength > MAX_REQUEST_SIZE) {
    return NextResponse.json(
      { error: '요청 크기가 너무 큽니다. 이미지는 5MB 이하만 가능합니다.' },
      { status: 413 }
    );
  }

  const body = await request.json().catch(() => null);

  if (!body?.imageBase64 || !body?.mimeType) {
    return NextResponse.json(
      { error: '이미지 데이터가 필요합니다' },
      { status: 400 }
    );
  }

  const { imageBase64, mimeType } = body as {
    imageBase64: string;
    mimeType: string;
  };

  if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
    return NextResponse.json(
      { error: '지원하지 않는 이미지 형식입니다 (JPEG, PNG, GIF, WebP만 가능)' },
      { status: 400 }
    );
  }

  if (imageBase64.length > MAX_BASE64_SIZE) {
    return NextResponse.json(
      { error: '이미지 크기는 5MB 이하만 가능합니다' },
      { status: 400 }
    );
  }

  try {
    const openrouter = createOpenRouter({ apiKey });

    const result = await generateText({
      model: openrouter('google/gemma-4-26b-a4b-it:free'),
      output: Output.object({ schema: generatedPostSchema }),
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'file',
              data: imageBase64,
              mediaType: mimeType,
            },
            {
              type: 'text',
              text: SYSTEM_PROMPT,
            },
          ],
        },
      ],
    });

    if (!result.output) {
      return NextResponse.json(
        { error: 'AI가 결과를 생성하지 못했습니다. 다시 시도해주세요.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: result.output });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : String(error);

    console.error('[AI Generate Post Error]', message);

    if (message.includes('invalid_api_key') || message.includes('Invalid API') || message.includes('401')) {
      return NextResponse.json(
        { error: 'API 키가 유효하지 않습니다. .env.local의 OPENROUTER_API_KEY를 확인해주세요.' },
        { status: 503 }
      );
    }

    if (message.includes('rate_limit') || message.includes('429')) {
      return NextResponse.json(
        { error: 'API 호출 한도를 초과했습니다. 잠시 후 다시 시도해주세요.' },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: 'AI 게시글 생성에 실패했습니다. 잠시 후 다시 시도해주세요.' },
      { status: 500 }
    );
  }
}
