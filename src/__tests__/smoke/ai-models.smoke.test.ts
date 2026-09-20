import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { beforeAll, describe, expect, it } from 'vitest';
import { AI_MODEL_CHAIN } from '@/services/ai/model-chain';
import { FAILURE_KIND, probeModel } from '@/services/ai/generate-post-core';
import type { FailureKind } from '@/services/ai/generate-post-core';

/**
 * AI 모델 체인 스모크 — 실제 OpenRouter를 호출한다.
 *
 * `pnpm check:ai-models`는 카탈로그만 본다. 그런데 카탈로그에 살아있어도
 * 호출하면 403(`only available on agentic harnesses`)이나 400을 주는 모델이 있다.
 * 목록으로는 절대 안 보이는 이 유형을 잡는 게 이 테스트의 존재 이유다.
 *
 * ⚠️ 알림이 무뎌지지 않게 하는 것이 설계의 핵심이다.
 * 무료 모델의 429는 **정상**이다(공유 풀). 그걸 실패로 보면 매주 거짓 경보가 오고,
 * 그러면 진짜 장애가 왔을 때도 메일을 안 열게 된다.
 * 그래서 "기다리면 풀리는 것"과 "사람이 고쳐야 하는 것"만 가른다.
 *
 * 실행: pnpm smoke:ai-models   (OPENROUTER_API_KEY 필요)
 * 문서: docs/ai-generate-post.md
 */

const IMAGE_PATH = resolve(process.cwd(), 'public/images/도담덕캐릭터.png');
const apiKey = process.env.OPENROUTER_API_KEY;

/** 기다리면 풀린다. 실패로 치지 않는다. */
const TRANSIENT_KINDS: readonly FailureKind[] = [
  FAILURE_KIND.RATE_LIMITED,
  FAILURE_KIND.DAILY_QUOTA,
];

type Verdict = 'ok' | 'transient' | 'broken';

interface Probe {
  model: string;
  verdict: Verdict;
  detail: string;
  ms: number;
}

/**
 * 모델 하나를 실제로 두드린다.
 *
 * 형식 오류(FORMAT)는 한 번 더 시도한다. 무료 모델은 스키마를 강제할 수 없어
 * 가끔 형태가 어긋나는데, 운영 코드도 같은 모델을 한 번 더 부르기 때문이다.
 * 두 번 연속 어긋나면 프롬프트나 스키마가 깨진 것으로 본다.
 */
async function probe(model: string): Promise<Probe> {
  const image = {
    imageBase64: readFileSync(IMAGE_PATH).toString('base64'),
    mimeType: 'image/png',
  };
  const startedAt = Date.now();

  for (let attempt = 1; attempt <= 2; attempt += 1) {
    const result = await probeModel(apiKey ?? '', model, image);
    const ms = Date.now() - startedAt;

    if ('data' in result) {
      return { model, verdict: 'ok', detail: result.data.title, ms };
    }

    const { kind, detail } = result.failure;

    if (TRANSIENT_KINDS.includes(kind)) {
      return { model, verdict: 'transient', detail: `${kind}: ${detail}`, ms };
    }
    if (kind !== FAILURE_KIND.FORMAT || attempt === 2) {
      return { model, verdict: 'broken', detail: `${kind}: ${detail}`, ms };
    }
  }

  /* c8 ignore next — 루프가 반드시 반환한다 */
  throw new Error('unreachable');
}

describe.skipIf(!apiKey)('AI 모델 체인 스모크', () => {
  const probes: Probe[] = [];

  beforeAll(async () => {
    // 체인 전체를 병렬로 두드린다. 순차로 돌면 느린 모델 때문에 2분을 넘긴다.
    probes.push(...(await Promise.all(AI_MODEL_CHAIN.map(probe))));

    for (const { model, verdict, detail, ms } of probes) {
      const mark = { ok: '✅', transient: '⏳', broken: '❌' }[verdict];
      console.log(`${mark} ${model} (${ms}ms) — ${detail}`);
    }
  });

  it.each(AI_MODEL_CHAIN)(
    '%s — 사람이 고쳐야 하는 장애가 없다',
    (model) => {
      const probe = probes.find((item) => item.model === model);

      expect(
        probe?.verdict,
        `${model}이(가) 영구 장애 상태입니다.\n` +
          `  ${probe?.detail}\n` +
          `  → pnpm check:ai-models 로 대체 후보를 확인하고 ` +
          `src/services/ai/model-chain.ts를 교체하세요.`
      ).not.toBe('broken');
    }
  );

  it('체인이 게시글을 만들어낼 수 있다', () => {
    const succeeded = probes.some((item) => item.verdict === 'ok');
    // 전부 429면 그 순간 혼잡했던 것뿐이라 실패로 보지 않는다.
    // 운영 코드도 이 경우 500이 아니라 "잠시 후 재시도"(429)를 안내한다.
    const allTransient = probes.every((item) => item.verdict === 'transient');

    if (!succeeded && allTransient) {
      console.warn(
        '⚠️ 모든 모델이 혼잡했습니다. 장애는 아니지만 다음 주에도 같으면 체인 보강을 검토하세요.'
      );
    }

    expect(
      succeeded || allTransient,
      `체인의 어떤 모델도 게시글을 만들지 못했습니다.\n` +
        probes.map((item) => `  ${item.model}: ${item.detail}`).join('\n')
    ).toBe(true);
  });
});
