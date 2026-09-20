import { defineConfig } from 'vitest/config';
import { readFileSync } from 'fs';
import { resolve } from 'path';

/**
 * 스모크 테스트 전용 설정 — 실제 OpenRouter를 호출한다.
 *
 * 기본 vitest.config.mts는 jsdom + MSW로 네트워크를 막기 때문에 여기 쓸 수 없다.
 * 이쪽은 node 환경에서 setup 없이 돌려 진짜 요청이 나가게 한다.
 * 기본 테스트 런에서는 제외된다 (vitest.config.mts의 exclude 참고).
 *
 * 실행: pnpm smoke:ai-models
 */
function loadDotEnv(): Record<string, string> {
  const envVars: Record<string, string> = {};
  try {
    const content = readFileSync(resolve(process.cwd(), '.env.local'), 'utf-8');
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIndex = trimmed.indexOf('=');
      if (eqIndex === -1) continue;
      envVars[trimmed.slice(0, eqIndex)] = trimmed.slice(eqIndex + 1);
    }
  } catch {
    // CI에서는 .env.local이 없고 실제 환경변수로 들어온다
  }
  return envVars;
}

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    environment: 'node',
    globals: true,
    include: ['src/__tests__/smoke/**/*.smoke.test.ts'],
    // 모델 응답이 10초를 넘기도 한다. 체인 전체를 병렬로 두드리므로 넉넉히.
    testTimeout: 120_000,
    hookTimeout: 120_000,
    env: loadDotEnv(),
    // 기본 리포터는 console 출력을 삼킨다. CI 실패 메일에서 어느 모델이 왜
    // 깨졌는지 바로 보여야 하므로 그대로 stdout에 흘린다.
    disableConsoleIntercept: true,
  },
});
