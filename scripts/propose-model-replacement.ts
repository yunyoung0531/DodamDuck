/**
 * 죽은 모델을 살아있는 모델로 교체하고, 교체안을 파일에 반영한다.
 *
 * 왜 자동화하나: 무료 모델은 공급자 사정으로 언제든 내려간다. 막을 수 없으니
 * "죽으면 다음날 교체 PR이 와 있고 머지만 하면 되는" 상태를 만든다.
 *
 * 왜 후보를 실제로 호출해보나: 카탈로그에 살아있고 endpoint도 있는데
 * 호출하면 403(agentic harness 전용)이나 400을 주는 모델이 있다.
 * 목록만 보고 교체하면 빨간불 PR이 올라오고, 그게 반복되면 알림을 안 보게 된다.
 * 그래서 **실제로 게시글이 생성되는 것까지 확인한 후보만** 제안한다.
 *
 * 실행: pnpm propose:ai-models            (검사만, 파일 수정 없음)
 *       pnpm propose:ai-models --write    (model-chain.ts 수정)
 * 문서: docs/ai-generate-post.md
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { AI_MODEL_CHAIN } from '@/services/ai/model-chain';
import { probeModel } from '@/services/ai/generate-post-core';
import {
  fetchCatalog,
  findCandidates,
  verifyModel,
} from './lib/openrouter-catalog';

const CHAIN_FILE = resolve(process.cwd(), 'src/services/ai/model-chain.ts');
const IMAGE_PATH = resolve(process.cwd(), 'public/images/도담덕캐릭터.png');

/** 후보를 몇 개까지 두드려볼지. 전부 돌면 무료 한도가 아깝다. */
const MAX_CANDIDATES_TO_TRY = 4;

/** 교체안을 적은 PR 본문이 저장되는 곳 (워크플로가 읽어 쓴다) */
const PR_BODY_FILE = resolve(process.cwd(), '.ai-model-pr-body.md');

interface Replacement {
  broken: string;
  reason: string;
  replacement: string | null;
  sample: string | null;
}

function loadImage() {
  return {
    imageBase64: readFileSync(IMAGE_PATH).toString('base64'),
    mimeType: 'image/png',
  };
}

/** 후보가 실제로 게시글을 만들어내는지 확인한다. 성공하면 생성된 제목을 돌려준다. */
async function tryCandidate(
  apiKey: string,
  model: string
): Promise<{ ok: true; title: string } | { ok: false; reason: string }> {
  const result = await probeModel(apiKey, model, loadImage());

  if ('data' in result) return { ok: true, title: result.data.title };

  // 429는 그 순간 붐빈 것뿐이라 후보 자격과 무관하다. 다만 검증은 못 했으므로
  // 이번 회차에서는 넘어가고 다음 후보를 본다 (내일 다시 시도된다).
  return { ok: false, reason: `${result.failure.kind}: ${result.failure.detail}` };
}

function writeChainFile(replacements: Replacement[]) {
  let source = readFileSync(CHAIN_FILE, 'utf-8');

  for (const { broken, replacement } of replacements) {
    if (!replacement) continue;
    const before = source;
    source = source.replace(`'${broken}'`, `'${replacement}'`);
    if (source === before) {
      throw new Error(
        `model-chain.ts에서 '${broken}' 문자열을 찾지 못했습니다. 배열 형태가 바뀌었는지 확인하세요.`
      );
    }
  }

  writeFileSync(CHAIN_FILE, source);
}

function buildPrBody(replacements: Replacement[]): string {
  const rows = replacements
    .map(({ broken, reason, replacement, sample }) =>
      replacement
        ? `| \`${broken}\` | ${reason} | \`${replacement}\` | "${sample}" |`
        : `| \`${broken}\` | ${reason} | **후보 없음** | — |`
    )
    .join('\n');

  return `## 죽은 AI 모델 자동 교체

무료 모델이 내려가 체인에서 빠졌습니다. 후보는 **실제 이미지로 호출해
게시글이 생성되는 것까지 확인**한 것만 넣었습니다.

| 빠진 모델 | 이유 | 새 모델 | 새 모델이 생성한 제목 |
|---|---|---|---|
${rows}

### 확인하실 것

- 새 모델이 만든 제목이 한국어로 자연스러운가
- 머지 후 \`pnpm smoke:ai-models\`가 통과하는가 (CI가 자동으로 돌립니다)

교체된 모델이 나중에 문제를 일으키면 \`AI_MODEL_DENYLIST\`에 추가하세요.
그러면 다음부터 후보로 제안되지 않습니다.

---
🤖 \`.github/workflows/ai-model-chain.yml\`이 자동 생성했습니다.
`;
}

async function main() {
  const shouldWrite = process.argv.includes('--write');
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    console.error('OPENROUTER_API_KEY가 필요합니다 (후보를 실제로 호출해 검증합니다).');
    process.exitCode = 1;
    return;
  }

  const models = await fetchCatalog();
  const catalog = new Map(models.map((model) => [model.id, model]));

  const verdicts = await Promise.all(
    AI_MODEL_CHAIN.map(async (id) => ({
      id,
      verdict: await verifyModel(id, catalog),
    }))
  );
  const broken = verdicts.filter((item) => !item.verdict.ok);

  if (broken.length === 0) {
    console.log('✅ 체인이 멀쩡합니다. 교체할 것이 없습니다.');
    return;
  }

  const candidates = await findCandidates(models, AI_MODEL_CHAIN);
  console.log(`❌ 죽은 모델 ${broken.length}개 / 후보 ${candidates.length}개\n`);

  const replacements: Replacement[] = [];
  const pool = candidates.slice(0, MAX_CANDIDATES_TO_TRY);

  for (const { id, verdict } of broken) {
    const reason = verdict.ok ? '' : verdict.reason;
    let picked: Replacement = {
      broken: id,
      reason,
      replacement: null,
      sample: null,
    };

    while (pool.length > 0) {
      const candidate = pool.shift();
      if (!candidate) break;

      process.stdout.write(`  ${candidate} 검증 중... `);
      const result = await tryCandidate(apiKey, candidate);

      if (result.ok) {
        console.log(`✅ "${result.title}"`);
        picked = { ...picked, replacement: candidate, sample: result.title };
        break;
      }
      console.log(`✗ ${result.reason.slice(0, 90)}`);
    }

    replacements.push(picked);
  }

  const usable = replacements.filter((item) => item.replacement);

  console.log('');
  for (const { broken: id, replacement } of replacements) {
    console.log(
      replacement
        ? `  ${id}\n    → ${replacement}`
        : `  ${id}\n    → 쓸 만한 후보를 찾지 못했습니다`
    );
  }

  if (usable.length === 0) {
    console.error(
      '\n검증을 통과한 후보가 없습니다. 수동 확인이 필요합니다 (pnpm check:ai-models).'
    );
    process.exitCode = 1;
    return;
  }

  if (!shouldWrite) {
    console.log('\n(검사만 했습니다. 실제로 바꾸려면 --write)');
    return;
  }

  writeChainFile(usable);
  writeFileSync(PR_BODY_FILE, buildPrBody(replacements));
  console.log(`\n✅ model-chain.ts를 수정했습니다. PR 본문: ${PR_BODY_FILE}`);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
