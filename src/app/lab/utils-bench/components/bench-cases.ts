import chunk from 'lodash/chunk';
import cloneDeep from 'lodash/cloneDeep';
import groupBy from 'lodash/groupBy';
import intersection from 'lodash/intersection';
import sortBy from 'lodash/sortBy';
import uniqBy from 'lodash/uniqBy';
import * as es from 'es-toolkit';

export const DATA_SIZES = [1_000, 10_000, 100_000] as const;
export type DataSize = (typeof DATA_SIZES)[number];

const CATEGORY_COUNT = 8;
/** JIT 예열에 쓰는 시간(ms). 이 구간의 실행 횟수는 결과에 넣지 않는다. */
const WARMUP_MS = 60;
/** 실제 측정 시간(ms). 길수록 안정적이지만 화면이 그만큼 멈춘다. */
const MEASURE_MS = 200;

export interface BenchPost {
  id: number;
  category: string;
  price: number;
  authorId: number;
}

export interface BenchDataset {
  posts: BenchPost[];
  numbersA: number[];
  numbersB: number[];
  nested: Record<string, unknown>;
}

/** 실행할 때마다 같은 데이터가 나오도록 인덱스 기반으로 만든다. */
export function createDataset(size: number): BenchDataset {
  const posts: BenchPost[] = Array.from({ length: size }, (_unused, i) => ({
    id: i,
    category: `category-${i % CATEGORY_COUNT}`,
    price: (i * 7919) % 100_000,
    authorId: i % Math.max(1, Math.floor(size / 20)),
  }));

  const half = Math.floor(size / 2);

  return {
    posts,
    numbersA: Array.from({ length: half }, (_unused, i) => i * 2),
    numbersB: Array.from({ length: half }, (_unused, i) => i * 3),
    nested: {
      level1: {
        level2: {
          level3: {
            level4: {
              level5: posts.slice(0, Math.min(200, size)),
              flags: [true, false, true],
            },
            label: 'deep',
          },
          counts: [1, 2, 3, 4, 5],
        },
        name: 'nested',
      },
    },
  };
}

export interface BenchCase {
  id: string;
  label: string;
  runLodash: (data: BenchDataset) => void;
  runEsToolkit: (data: BenchDataset) => void;
}

const byCategory = (post: BenchPost) => post.category;
const byAuthor = (post: BenchPost) => post.authorId;
const byPrice = (post: BenchPost) => post.price;

export const BENCH_CASES: BenchCase[] = [
  {
    id: 'groupBy',
    label: 'groupBy — 카테고리별 묶기',
    runLodash: (d) => void groupBy(d.posts, byCategory),
    runEsToolkit: (d) => void es.groupBy(d.posts, byCategory),
  },
  {
    id: 'uniqBy',
    label: 'uniqBy — 작성자 기준 중복 제거',
    runLodash: (d) => void uniqBy(d.posts, byAuthor),
    runEsToolkit: (d) => void es.uniqBy(d.posts, byAuthor),
  },
  {
    id: 'chunk',
    label: 'chunk — 100개씩 자르기',
    runLodash: (d) => void chunk(d.posts, 100),
    runEsToolkit: (d) => void es.chunk(d.posts, 100),
  },
  {
    id: 'cloneDeep',
    label: 'cloneDeep — 5단계 중첩 객체 복사',
    runLodash: (d) => void cloneDeep(d.nested),
    runEsToolkit: (d) => void es.cloneDeep(d.nested),
  },
  {
    id: 'intersection',
    label: 'intersection — 두 배열의 교집합',
    runLodash: (d) => void intersection(d.numbersA, d.numbersB),
    runEsToolkit: (d) => void es.intersection(d.numbersA, d.numbersB),
  },
  {
    id: 'sortBy',
    label: 'sortBy — 가격순 정렬',
    runLodash: (d) => void sortBy(d.posts, byPrice),
    // es-toolkit의 sortBy는 기준을 배열로 받는다. 함수를 그대로 넘기면 정렬되지 않는다.
    runEsToolkit: (d) => void es.sortBy(d.posts, [byPrice]),
  },
];

function runFor(fn: () => void, budgetMs: number) {
  const end = performance.now() + budgetMs;
  let count = 0;
  while (performance.now() < end) {
    fn();
    count += 1;
  }
  return count;
}

/** 초당 실행 횟수를 잰다. 측정 전 예열 구간을 반드시 거친다. */
export function measureOpsPerSec(fn: () => void) {
  runFor(fn, WARMUP_MS);

  const start = performance.now();
  const count = runFor(fn, MEASURE_MS);
  const elapsed = performance.now() - start;

  return elapsed > 0 ? (count / elapsed) * 1000 : 0;
}

export interface BenchResult {
  id: string;
  label: string;
  lodashOps: number;
  esToolkitOps: number;
  /** 1보다 크면 es-toolkit이 빠르다. */
  ratio: number;
}

export function measureCase(
  benchCase: BenchCase,
  data: BenchDataset
): BenchResult {
  const lodashOps = measureOpsPerSec(() => benchCase.runLodash(data));
  const esToolkitOps = measureOpsPerSec(() => benchCase.runEsToolkit(data));

  return {
    id: benchCase.id,
    label: benchCase.label,
    lodashOps,
    esToolkitOps,
    ratio: lodashOps > 0 ? esToolkitOps / lodashOps : 0,
  };
}
