import { defineConfig } from 'vitest/config';

/**
 * 벤치마크 전용 설정.
 *
 * 기본 vitest.config.mts는 jsdom + supabase 모킹 setup을 쓴다.
 * 벤치는 순수 연산 속도만 재야 하므로 node 환경에서 setup 없이 돌린다.
 */
export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    benchmark: {
      include: ['bench/**/*.bench.ts'],
    },
  },
});
