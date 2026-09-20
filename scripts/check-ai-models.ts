/**
 * AI 모델 체인 생존 점검 (목록만 확인 — 키 불필요, 무료 한도 미소모).
 *
 * 왜 필요한가: OpenRouter의 `:free` 변종은 공급자가 예고 없이 내린다.
 * 모델 페이지는 카탈로그에 그대로 남아 있어서 눈으로는 멀쩡해 보이지만
 * endpoints가 0개가 되고, 호출하면 404 "No endpoints found"가 돌아온다.
 * 실제로 `nvidia/nemotron-nano-12b-v2-vl:free`가 이렇게 죽어
 * /api/ai/generate-post가 500을 뱉었다. 코드는 멀쩡했고 목록만 썩었다.
 *
 * 실행: pnpm check:ai-models
 * 문서: docs/ai-generate-post.md
 */
import { AI_MODEL_CHAIN } from '@/services/ai/model-chain';
import {
  fetchCatalog,
  findCandidates,
  verifyModel,
} from './lib/openrouter-catalog';

async function main() {
  const models = await fetchCatalog();
  const catalog = new Map(models.map((model) => [model.id, model]));

  const results = await Promise.all(
    AI_MODEL_CHAIN.map(async (id) => ({
      id,
      verdict: await verifyModel(id, catalog),
    }))
  );

  console.log('AI 모델 체인 점검\n');
  for (const { id, verdict } of results) {
    console.log(
      verdict.ok
        ? `  ✅ ${id}  (endpoint ${verdict.endpoints}개)`
        : `  ❌ ${id}  — ${verdict.reason}`
    );
  }

  const broken = results.filter(({ verdict }) => !verdict.ok);
  if (broken.length === 0) {
    console.log(`\n${results.length}개 모델 모두 사용 가능합니다.`);
    return;
  }

  console.log(
    `\n${broken.length}개 모델이 깨졌습니다. src/services/ai/model-chain.ts의 AI_MODEL_CHAIN을 교체하세요.`
  );
  console.log('\n살아있는 무료 vision 모델 후보:');
  for (const id of await findCandidates(models, AI_MODEL_CHAIN)) {
    console.log(`  - ${id}`);
  }
  console.log(
    '\n⚠️ 후보 중에도 호출하면 403(agentic harnesses 전용)이나 400이 나는 모델이 있습니다.'
  );
  console.log('   pnpm propose:ai-models 로 실호출 검증까지 한 번에 하세요.');

  process.exitCode = 1;
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
