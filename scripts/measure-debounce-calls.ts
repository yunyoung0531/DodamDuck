/**
 * debounce 지연시간이 실제 요청 횟수를 얼마나 줄이는지 측정한다.
 *
 * 실시간 검색의 비용은 라이브러리가 아니라 "DB를 몇 번 부르느냐"로 결정된다.
 * 타이핑 속도 x 지연시간 조합별로 검색이 몇 번 실행되는지 센다.
 * lodash와 es-toolkit을 모두 돌려 동작이 같은지도 함께 확인한다.
 *
 * 실행: pnpm bench:calls
 * 계획: debounce-benchmark-plan.md (Phase 3-C)
 */
// Node ESM에서 'lodash/debounce'는 확장자 없이 해석되지 않아 배럴 임포트를 쓴다.
// (측정 대상은 동작 횟수라서 임포트 방식은 결과에 영향이 없다.)
import lodash from 'lodash';
import { debounce as esDebounce } from 'es-toolkit';

/** 검색어 한 글자를 칠 때마다 걸리는 시간(ms). */
const TYPING_INTERVALS_MS = [100, 250, 400] as const;
/** 비교할 debounce 지연시간(ms). 0은 debounce를 쓰지 않는 경우다. */
const DEBOUNCE_DELAYS_MS = [0, 150, 300, 500] as const;
/** 검색어 길이 (몇 글자를 치는지). */
const KEYSTROKE_COUNT = 10;

type DebounceFactory = (
  fn: () => void,
  delayMs: number
) => (() => void) & { cancel: () => void };

const LIBRARIES: { id: string; label: string; create: DebounceFactory }[] = [
  {
    id: 'lodash',
    label: 'lodash',
    create: (fn, delayMs) => lodash.debounce(fn, delayMs),
  },
  {
    id: 'es-toolkit',
    label: 'es-toolkit',
    create: (fn, delayMs) => esDebounce(fn, delayMs),
  },
];

function print(line: string) {
  process.stdout.write(`${line}\n`);
}

function wait(ms: number) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });
}

/** 한 조합을 실제 타이머로 시뮬레이션하고 검색 실행 횟수를 돌려준다. */
async function countCalls(
  create: DebounceFactory,
  typingIntervalMs: number,
  delayMs: number
): Promise<number> {
  let callCount = 0;
  const search = () => {
    callCount += 1;
  };

  if (delayMs === 0) {
    // debounce 없음: 글자마다 그대로 실행된다.
    for (let i = 0; i < KEYSTROKE_COUNT; i += 1) {
      search();
      await wait(typingIntervalMs);
    }
    return callCount;
  }

  const debounced = create(search, delayMs);

  for (let i = 0; i < KEYSTROKE_COUNT; i += 1) {
    debounced();
    await wait(typingIntervalMs);
  }

  // 마지막 입력 이후 대기 중인 실행이 끝나기를 기다린다.
  await wait(delayMs + 50);
  debounced.cancel();

  return callCount;
}

async function runLibrary(library: { label: string; create: DebounceFactory }) {
  print(`\n## ${library.label} — ${KEYSTROKE_COUNT}글자 입력 시 검색 실행 횟수\n`);

  const header = DEBOUNCE_DELAYS_MS.map((d) =>
    (d === 0 ? 'debounce 없음' : `${d}ms`).padStart(13)
  ).join(' |');
  print(`| 타이핑 속도        | ${header} |`);
  print(
    `|--------------------|${DEBOUNCE_DELAYS_MS.map(() => '--------------').join('|')}|`
  );

  for (const interval of TYPING_INTERVALS_MS) {
    const counts: number[] = [];
    for (const delay of DEBOUNCE_DELAYS_MS) {
      counts.push(await countCalls(library.create, interval, delay));
    }
    const label = `한 글자당 ${interval}ms`.padEnd(18);
    print(`| ${label} | ${counts.map((c) => `${c}회`.padStart(13)).join(' |')} |`);
  }
}

async function main() {
  for (const library of LIBRARIES) {
    await runLibrary(library);
  }
  print(
    '\n검색 1회 = DB 전체 스캔 1회 + 프로필 조회 1회. 횟수가 그대로 서버 부하다.'
  );
}

main().catch((error: unknown) => {
  process.stderr.write(`${String(error)}\n`);
  process.exit(1);
});
