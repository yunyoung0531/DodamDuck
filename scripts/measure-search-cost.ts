/**
 * 검색 1회의 실제 비용을 측정한다 (왕복 2회를 분리 계측).
 *
 * 이 실험에서 라이브러리 성능 논의가 무의미하다는 근거가 되는 숫자다.
 * es-toolkit debounce의 런타임 이득은 0.0000011 ms인데, 검색 1회는 45 ms다.
 *
 * `servSearchSharingPosts`와 동일한 순서로 두 요청을 나눠 잰다:
 *   1) rpc/search_sharing_posts  — ILIKE 풀스캔
 *   2) sharing_posts?id=in.(...) — 프로필 조인 재조회
 *
 * ⚠️ 여기서 재는 값은 네트워크 RTT를 포함한 종단 지연이라 DB 시간의 상한값이다.
 * 순수 DB 실행시간은 `explain analyze`로 따로 재야 한다. 그건 PostgREST로는
 * 못 돌린다 (db_plan_enabled 기본 off → 406 PGRST107). Supabase MCP 서버의
 * execute_sql 또는 대시보드 SQL Editor를 쓸 것. 실측값은 계획서 1-5절에 있다.
 *
 * 실행: pnpm bench:search
 * 계획: debounce-benchmark-plan.md (1-5절)
 */
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const URL_BASE = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!URL_BASE || !ANON) {
  throw new Error(
    '.env.local의 NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY가 필요하다'
  );
}

const HEADERS = {
  apikey: ANON,
  Authorization: `Bearer ${ANON}`,
  'Content-Type': 'application/json',
};

const PROFILE_SELECT = encodeURIComponent(
  '*,profiles(username,display_name,profile_url)'
);

const WARMUP = 3;
const RUNS = 15;

/** 측정할 검색어. 1글자는 게이트에 막히지만 비용 비교용으로 일부러 넣었다. */
const QUERIES = ['레', '레고', '블록', '자전거', 'zzzz없는검색어'];

/** es-toolkit debounce가 lodash보다 빠른 만큼 (계획서 5-2절, 1회 기준). */
const LIBRARY_GAIN_MS = 0.0000011;

interface Timing {
  rpcMs: number;
  refetchMs: number;
  totalMs: number;
  hitCount: number;
}

function print(line: string) {
  process.stdout.write(`${line}\n`);
}

async function callSearchRpc(query: string) {
  const started = performance.now();
  const res = await fetch(`${URL_BASE}/rest/v1/rpc/search_sharing_posts`, {
    method: 'POST',
    headers: HEADERS,
    body: JSON.stringify({ search_query: query }),
  });
  const rows = (await res.json()) as { id: number }[];
  const elapsed = performance.now() - started;

  if (!res.ok) {
    throw new Error(`RPC 실패 ${res.status}: ${JSON.stringify(rows)}`);
  }
  return { elapsed, ids: rows.map((row) => row.id) };
}

async function refetchWithProfiles(ids: number[]) {
  if (ids.length === 0) return 0;

  const idFilter = encodeURIComponent(`in.(${ids.join(',')})`);
  const url =
    `${URL_BASE}/rest/v1/sharing_posts?select=${PROFILE_SELECT}` +
    `&id=${idFilter}&order=created_at.desc`;

  const started = performance.now();
  const res = await fetch(url, { headers: HEADERS });
  await res.json();
  const elapsed = performance.now() - started;

  if (!res.ok) throw new Error(`재조회 실패 ${res.status}`);
  return elapsed;
}

async function measureOnce(query: string): Promise<Timing> {
  const { elapsed: rpcMs, ids } = await callSearchRpc(query);
  const refetchMs = await refetchWithProfiles(ids);
  return {
    rpcMs,
    refetchMs,
    totalMs: rpcMs + refetchMs,
    hitCount: ids.length,
  };
}

async function fetchFullList() {
  const started = performance.now();
  const res = await fetch(
    `${URL_BASE}/rest/v1/sharing_posts?select=${PROFILE_SELECT}&order=created_at.desc`,
    { headers: HEADERS }
  );
  const rows = (await res.json()) as unknown[];
  return { elapsed: performance.now() - started, count: rows.length };
}

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  const upper = sorted[mid];

  if (upper === undefined) throw new Error('표본이 없어 중앙값을 낼 수 없다');
  if (sorted.length % 2 !== 0) return upper;

  const lower = sorted[mid - 1];
  return lower === undefined ? upper : (lower + upper) / 2;
}

function fmt(ms: number) {
  return ms.toFixed(1).padStart(7);
}

/** 검색 없이 /sharing을 열 때의 비용. 검색 비용을 견줄 기준선이다. */
async function measureBaseline() {
  const timings: number[] = [];
  let count = 0;

  for (let i = 0; i < WARMUP + RUNS; i++) {
    const { elapsed, count: rowCount } = await fetchFullList();
    if (i >= WARMUP) timings.push(elapsed);
    if (i === WARMUP) count = rowCount;
  }

  return { medianMs: median(timings), count };
}

async function measureQuery(query: string): Promise<Timing> {
  for (let i = 0; i < WARMUP; i++) await measureOnce(query);

  const samples: Timing[] = [];
  for (let i = 0; i < RUNS; i++) samples.push(await measureOnce(query));

  return {
    rpcMs: median(samples.map((s) => s.rpcMs)),
    refetchMs: median(samples.map((s) => s.refetchMs)),
    totalMs: median(samples.map((s) => s.totalMs)),
    // 매칭 건수는 회차마다 같다. max는 인덱스 접근을 피하려는 것.
    hitCount: Math.max(...samples.map((s) => s.hitCount)),
  };
}

function printSummary(typical: Timing) {
  const saved = typical.totalMs * 9;

  print(`\n검색 1회 비용(중앙값): ${typical.totalMs.toFixed(1)} ms`);
  print(`  ├─ 1번째 왕복 (ILIKE 검색): ${typical.rpcMs.toFixed(1)} ms`);
  print(`  └─ 2번째 왕복 (프로필 조인): ${typical.refetchMs.toFixed(1)} ms`);
  print(`     → 왕복 1회로 합치면 약 ${typical.rpcMs.toFixed(1)} ms로 줄어든다`);
  print(`\ndebounce로 요청 10회 → 1회, 절약한 시간: ${saved.toFixed(1)} ms`);
  print(
    `라이브러리 런타임 이득 ${LIBRARY_GAIN_MS} ms 대비 ` +
      `${(saved / LIBRARY_GAIN_MS).toExponential(2)}배`
  );
}

async function main() {
  print(`측정 대상: ${URL_BASE}`);
  print(`워밍업 ${WARMUP}회 후 ${RUNS}회 측정, 중앙값 기준`);

  const baseline = await measureBaseline();
  print(`전체 게시글 수: ${baseline.count}건\n`);

  print('검색어           건수 |  RPC(ms)  재조회(ms)  합계(ms)');
  print('-'.repeat(62));

  const results = new Map<string, Timing>();

  for (const query of QUERIES) {
    const timing = await measureQuery(query);
    results.set(query, timing);
    print(
      `${query.padEnd(16)}${String(timing.hitCount).padStart(4)} |` +
        `${fmt(timing.rpcMs)}   ${fmt(timing.refetchMs)}  ${fmt(timing.totalMs)}`
    );
  }

  print('-'.repeat(62));
  print(`${'전체 목록(기준선)'.padEnd(14)}     |${fmt(baseline.medianMs)}`);

  // '레고'를 대표값으로 쓴다 (1건 매칭 = 가장 흔한 검색 결과 규모).
  const typical = results.get('레고');
  if (typical) printSummary(typical);
}

await main();
