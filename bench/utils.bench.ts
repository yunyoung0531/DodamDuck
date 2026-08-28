/**
 * lodash vs es-toolkit 런타임 속도 비교.
 *
 * debounce는 타이핑당 1회 실행이라 차이가 측정 노이즈에 묻힌다(대조군으로만 포함).
 * "2~3배 빠르다"는 주장의 실제 대상은 대량 데이터를 반복 처리하는 배열/객체 유틸이다.
 *
 * 실행: pnpm bench:runtime
 * 계획: debounce-benchmark-plan.md (Phase 3-A)
 */
import { bench, describe } from 'vitest';
import chunk from 'lodash/chunk';
import cloneDeep from 'lodash/cloneDeep';
import groupBy from 'lodash/groupBy';
import intersection from 'lodash/intersection';
import sortBy from 'lodash/sortBy';
import uniqBy from 'lodash/uniqBy';
import debounce from 'lodash/debounce';
import * as es from 'es-toolkit';

const SIZE = 10_000;
const CATEGORY_COUNT = 8;

interface BenchPost {
  id: number;
  category: string;
  price: number;
  authorId: number;
}

/** 실행할 때마다 같은 데이터가 나오도록 인덱스 기반으로 생성한다. */
const POSTS: BenchPost[] = Array.from({ length: SIZE }, (_unused, i) => ({
  id: i,
  category: `category-${i % CATEGORY_COUNT}`,
  price: (i * 7919) % 100_000,
  authorId: i % 500,
}));

const NUMBERS_A: number[] = Array.from({ length: 5_000 }, (_unused, i) => i * 2);
const NUMBERS_B: number[] = Array.from({ length: 5_000 }, (_unused, i) => i * 3);

/** 5단계 중첩 객체 — cloneDeep 비교용. */
const NESTED = {
  level1: {
    level2: {
      level3: {
        level4: {
          level5: POSTS.slice(0, 200),
          flags: [true, false, true],
        },
        label: 'deep',
      },
      counts: [1, 2, 3, 4, 5],
    },
    name: 'nested',
  },
  createdAt: '2026-08-15T00:00:00Z',
};

const byCategory = (post: BenchPost) => post.category;
const byAuthor = (post: BenchPost) => post.authorId;
const byPrice = (post: BenchPost) => post.price;

describe(`groupBy — ${SIZE}건`, () => {
  bench('lodash', () => {
    groupBy(POSTS, byCategory);
  });
  bench('es-toolkit', () => {
    es.groupBy(POSTS, byCategory);
  });
});

describe(`uniqBy — ${SIZE}건`, () => {
  bench('lodash', () => {
    uniqBy(POSTS, byAuthor);
  });
  bench('es-toolkit', () => {
    es.uniqBy(POSTS, byAuthor);
  });
});

describe(`chunk — ${SIZE}건, 크기 100`, () => {
  bench('lodash', () => {
    chunk(POSTS, 100);
  });
  bench('es-toolkit', () => {
    es.chunk(POSTS, 100);
  });
});

describe('cloneDeep — 5단계 중첩 객체', () => {
  bench('lodash', () => {
    cloneDeep(NESTED);
  });
  bench('es-toolkit', () => {
    es.cloneDeep(NESTED);
  });
});

describe('intersection — 5,000 x 5,000', () => {
  bench('lodash', () => {
    intersection(NUMBERS_A, NUMBERS_B);
  });
  bench('es-toolkit', () => {
    es.intersection(NUMBERS_A, NUMBERS_B);
  });
});

describe(`sortBy — ${SIZE}건`, () => {
  bench('lodash', () => {
    sortBy(POSTS, byPrice);
  });
  // es-toolkit의 sortBy는 기준을 배열로 받는다. 함수를 그대로 넘기면 정렬되지 않는다.
  bench('es-toolkit', () => {
    es.sortBy(POSTS, [byPrice]);
  });
});

describe('debounce — 대조군 (생성 + 호출 1회)', () => {
  bench('lodash', () => {
    const fn = debounce(() => undefined, 300);
    fn();
    fn.cancel();
  });
  bench('es-toolkit', () => {
    const fn = es.debounce(() => undefined, 300);
    fn();
    fn.cancel();
  });
});
