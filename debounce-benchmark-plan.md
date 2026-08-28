# lodash vs es-toolkit 비교 실험 계획

실시간 검색(debounce) 도입을 겸해서 두 유틸리티 라이브러리를 비교한다.

---

## 0. 전제 — 이 실험의 함정

### debounce로는 "2~3배 빠름"을 검증할 수 없다

es-toolkit의 성능 우위 주장은 `chunk`, `groupBy`, `cloneDeep`, `intersection`,
`uniqBy` 같은 **배열/객체 유틸을 대량 데이터로 반복 실행**한 벤치마크에서 나온다.

debounce는 다르다:

- 호출 빈도: 타이핑 1글자당 1회 (초당 최대 ~10회)
- 내부 동작: `clearTimeout` + `setTimeout` + 클로저 변수 갱신
- 총 실행 시간: 전체 세션에서 마이크로초 단위

두 라이브러리의 차이는 측정 노이즈보다 작다. **debounce에서 런타임 성능을 재면
결론은 "차이 없음"으로 나오는 게 정상이고, 그것 자체가 유효한 발견이다.**
("체감 성능을 결정하는 건 라이브러리가 아니라 debounce 지연시간과 네트워크다")

따라서 실험을 두 트랙으로 분리한다.

| 트랙 | 대상 | 비교 축 | 왜 |
|------|------|--------|-----|
| **A. 실사용** | 교환/나눔 검색에 debounce 적용 | 번들 크기 · API/DX · 타입 · 정리(cleanup) | debounce는 성능이 아니라 개발 경험과 크기의 문제 |
| **B. 벤치** | 별도 `/lab` 페이지 + `vitest bench` | 런타임 속도 (ops/sec) | "2~3배" 주장의 실제 검증 대상 |

### 번들 크기 비교의 공정성

`import _ from 'lodash'` vs `es-toolkit`을 비교하면 당연히 97%가 나온다.
그건 라이브러리 비교가 아니라 임포트 방식 비교다. 최소 4가지를 측정한다:

1. `import _ from 'lodash'` — 전체 임포트 (안티패턴, 기준선용)
2. `import debounce from 'lodash/debounce'` — CJS 딥 임포트
3. `import { debounce } from 'lodash-es'` — ESM 트리셰이킹
4. `import { debounce } from 'es-toolkit'`

추가 변수: Next.js `optimizePackageImports` 설정 유무.
현재 `next.config.ts`에 해당 설정이 없으므로, Next 16 기본 최적화 목록에
lodash 계열이 포함되는지 **먼저 확인**하고 켠/끈 두 경우를 모두 잰다.

---

## 1. 사전 해결 과제 (실시간 검색 자체의 리스크)

라이브러리 비교와 무관하게, "타이핑할 때마다 검색"으로 바꾸면 생기는 문제들.
**이걸 먼저 처리하지 않으면 실험이 아니라 사고다.**

### 1-1. `search_logs` 오염 — ✅ 해소됨 (확인 완료 2026-08-14)

당초 최우선 리스크로 잡았던 항목. **확인 결과 문제 없음.**

Supabase SQL Editor에서 확인한 사실:

```sql
select p.proname, p.provolatile,
       pg_get_functiondef(p.oid) ilike '%insert%' as has_insert
from pg_proc p join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.proname in ('search_sharing_posts', 'get_popular_searches');
```

| proname | provolatile | has_insert |
|---------|-------------|------------|
| `get_popular_searches` | v | **false** |
| `search_sharing_posts` | v | **false** |

- `search_sharing_posts`는 `LANGUAGE sql` + `RETURNS SETOF sharing_posts`,
  본문은 `title ILIKE '%'||search_query||'%' OR content ILIKE ...` 단일 SELECT.
  **검색어를 기록하지 않는다.**
- `get_popular_searches`도 `search_logs`를 `GROUP BY query`로 세는 순수 읽기 함수.

→ 실시간 검색으로 바꿔도 조각 검색어가 쌓이지 않는다. 인기 검색어 배지는 안전하다.

**반대쪽 사실 (별개 이슈 → 7절 BACKLOG)**

검색어를 기록하는 코드가 클라이언트에도, RPC에도 **없다**.
`search_logs`의 35개 행은 id 1~35가 연속인데 `created_at`은 2026-07-07~07-12에
흩어져 있고 그 이후 신규 행이 0개 — 시딩 스크립트가 넣은 더미 데이터다.
즉 화면의 인기 검색어 배지는 **7월 시드 데이터가 영구 고정된 상태**다.

나중에 검색 로깅을 실제로 구현할 때는, 그때 비로소 이 절의 원래 문제가 발생한다.
**그 시점에 아래를 반드시 적용할 것:**
- 로그 기록은 검색 실행과 분리된 별도 RPC로 (검색 = 읽기, 로깅 = 쓰기)
- 호출 시점은 debounce 확정 후 + 최소 2자 이상 + 폼 제출/배지 클릭
- 실시간 타이핑 중간 상태는 절대 기록하지 않음

### 1-2. 한글 IME 조합 (HIGH)

한글은 조합 중에도 `onChange`가 자모 단위로 발생한다.

```
ㄹ → 레 → 렉 → 레고
```

debounce가 300ms여도 조합이 느리면 중간 상태로 요청이 나간다.

**할 일 — ⚠️ 이 접근 자체가 폐기됐다 (9-1 참조). 아래 항목은 무효.**
- [~] ~~`onCompositionStart` / `onCompositionEnd`로 조합 상태 추적~~
- [~] ~~조합 중에는 debounce 트리거를 걸지 않고, `compositionend`에서 한 번 트리거~~
- [~] ~~이 처리는 lodash/es-toolkit 양쪽에 동일하게 적용~~

> 한글은 마지막 음절의 `compositionend`가 스페이스/엔터 전까지 발생하지 않아,
> 이 방식으로는 마지막 글자가 영영 검색되지 않는다. 실제 버그였고 제거했다.
> **대체 해법**: 입력값을 그대로 디바운스 + 2글자 게이트 (1-3). composition 처리 불필요.

### 1-3. 최소 글자수 & 빈 문자열 (MEDIUM)

- [x] 2자 미만이면 검색하지 않고 전체 목록 표시
      → `queries.ts:33` `enabled: query.trim().length >= MIN_SEARCH_QUERY_LENGTH`
- [x] 검색어를 지우면 즉시 전체 목록으로 복귀
      → `SharingContents.tsx:46` `inputValue` 게이트로 debounce를 기다리지 않는다

### 1-4. 카테고리 필터 불일치 (MEDIUM)

`SharingContents.tsx:41-46` 주석대로 검색 RPC에 카테고리 인자가 없어
클라이언트에서 `filter`로 좁힌다. 실시간 검색이 되면 "DB는 20건 줬는데 화면엔 3건"인
상황이 훨씬 자주 노출된다.

- [x] 이번 실험 범위 밖으로 두되, `BACKLOG.md`에 기록 → "검색 RPC에 카테고리 인자 추가"
- [x] 실험 중에는 카테고리 = 전체로 고정해서 변수 제거

### 1-5. `ILIKE` 풀스캔 + 라운드트립 2회

> **⚠️ 당초 HIGH로 잡았으나 실측 후 정정됐다 (2026-08-26).**
> 풀스캔은 **문제가 아니었고**(0.39 ms), 실질 비용은 **왕복 2회**였다.
> 아래 "실측 결과" 참조. 당초 서술은 정정 대비를 위해 남긴다.

`search_sharing_posts` 본문이 앞뒤 와일드카드 `ILIKE`다:

```sql
WHERE title   ILIKE '%' || search_query || '%'
   OR content ILIKE '%' || search_query || '%'
```

앞쪽 `%` 때문에 B-tree 인덱스를 탈 수 없다 → 호출마다 `sharing_posts` 풀스캔.

> 실측 중 확인된 것: 함수 본문에 위 두 조건 외에 **태그 검색 조건이 더 있다.**
> ```sql
> OR EXISTS (SELECT 1 FROM unnest(tags) AS t WHERE t ILIKE '%' || search_query || '%')
> ```
> 이 절의 원래 기록은 태그 조건을 빠뜨렸다.

게다가 `sharing-services.ts:159-185`는 **DB 왕복을 2회** 한다:
1. RPC로 매칭 id 목록 조회
2. 그 id들로 `sharing_posts` 재조회 (프로필 조인 때문)

즉 실시간 검색은 **타이핑 1글자당 (풀스캔 1회 + 추가 SELECT 1회)**가 된다.
게시글이 수십 건인 현재는 체감이 없지만, 이 실험의 "성능" 논의에서
**라이브러리 차이(나노초)보다 3~4자리 큰 비용**이라는 점이 핵심이다.

**할 일**
- [x] `explain analyze select * from search_sharing_posts('레고')`로 현재 실행 시간 기록 (기준선)
- [x] 계측만 하고 최적화는 실험 범위 밖으로 둔다 (변수 통제) — 코드 변경 0
- [x] 개선안은 7절 BACKLOG에 기록 → **실측 결과에 따라 우선순위를 뒤집었다**
- [x] **이 수치를 5-2 결과표 옆에 병기할 것** → 5-2절 하단

---

#### 실측 결과 (2026-08-26)

**측정 경로**: Supabase Management API `/database/query`
(`explain analyze`는 PostgREST로 못 돌린다 — `db_plan_enabled`가 기본 off라 406 `PGRST107`.
Supabase MCP 서버를 `--read-only`로 붙여 같은 API를 썼다.)

**대상 테이블**: `sharing_posts` 19행 / 88 kB
**기존 인덱스**: `sharing_posts_pkey` (id), `idx_sharing_posts_category_created_at` (category, created_at DESC)
— 즉 `title`/`content`/`tags`에 텍스트 인덱스는 **없다**(예상대로).

##### ① 검색 쿼리 — `explain (analyze, buffers)`

```
Sort  (actual time=0.294..0.295 rows=1 loops=1)
  Sort Key: created_at DESC
  ->  Seq Scan on sharing_posts  (actual time=0.020..0.262 rows=1 loops=1)
        Filter: (title ~~* '%레고%' OR content ~~* '%레고%' OR EXISTS(SubPlan 1))
        Rows Removed by Filter: 18
        Buffers: shared hit=3
Planning Time: 0.705 ms
Execution Time: 0.390 ms
```

**계획 시간(0.705 ms)이 실행 시간(0.390 ms)보다 길다.** 그만큼 할 일이 없다는 뜻이다.
읽은 버퍼는 3페이지. 88 kB 테이블이라 풀스캔의 비용이 사실상 0이다.

##### ② 구간별 DB 실행 시간 (3회, 일관)

| 구간 | Execution Time |
|------|---------------|
| RPC 경유 (`select * from search_sharing_posts('레고')`) | **1.5 ms** (1.488 / 1.514 / 1.524) |
| 같은 SQL을 직접 실행 | **0.39 ms** (0.384 / 0.405 / 0.383) |
| 2번째 왕복 (`where id in (...)`) | **0.2 ms** — `Index Scan using sharing_posts_pkey` |

`SETOF` 함수가 인라인되지 않아 **껍데기가 1.1 ms를 먹는다**(0.39 → 1.5). 3회 일관.
첫 호출만 3.283 ms였고(파싱 비용) 이후 1.5 ms로 안정됐다.

##### ③ DB 시간 vs 사용자가 기다리는 시간

종단 지연은 별도로 측정했다 (워밍업 3회 후 15회, 중앙값. `servSearchSharingPosts`와 동일 순서로 두 요청 분리 계측).
**재현**: `pnpm bench:search` → `scripts/measure-search-cost.ts`. 아래 표는 1세션 값이다.

| 검색어 | 건수 | RPC(ms) | 재조회(ms) | 합계(ms) |
|--------|-----|--------|-----------|---------|
| 레 | 5 | 22.2 | 23.4 | 46.3 |
| 레고 | 1 | 22.0 | 23.2 | **45.1** |
| 블록 | 3 | 22.9 | 23.1 | 46.4 |
| 자전거 | 1 | 22.3 | 23.6 | 46.3 |
| zzzz없는검색어 | 0 | 30.7 | — | 30.7 |
| *전체 목록 (기준선)* | 19 | — | — | *28.3* |

**세션 간 변동** (`pnpm bench:search` 3세션, 각 15회 중앙값):

| 세션 | '레고' 검색 1회 |
|------|---------------|
| 1 | 45.1 ms |
| 2 | 35.7 ms |
| 3 | 37.6 ms |

네트워크 구간은 세션마다 ±10 ms 흔들린다. **DB 실행시간(1.7 ms)은 변하지 않는다.**
아래 비중은 세션 중앙값(37.6 ms) 기준이며, 어느 세션을 쓰든 결론은 같다.

| 구성 | 시간 | 비중 |
|------|-----|------|
| DB 실제 계산 (1.5 + 0.2) | **1.7 ms** | **4~5%** |
| 네트워크 왕복 | **34~43 ms** | **95~96%** |
| 합계 (사용자 대기) | 35.7~45.1 ms | 100% |

##### 해석 — 세 가지 정정

**1. 풀스캔은 병목이 아니다. 당초 HIGH 판정은 틀렸다.**

검색 RPC(22.0 ms)가 **전체 목록 조회(28.3 ms)보다 빠르다.** 19행에서 `ILIKE` 풀스캔은
측정되지 않는 비용이다. `pg_trgm` + GIN 인덱스를 지금 넣으면 **0.39 ms를 줄이려고
43 ms를 방치하는 셈**이다. 게시글이 수천 건이 될 때까지 미룬다.

**2. 실질 비용은 왕복 2회다. 이쪽이 유일하게 고칠 값어치가 있다.**

2번째 조회는 DB 안에서 0.2 ms고 이미 pkey 인덱스를 탄다. 그런데 종단으로는 23 ms가 붙는다.
**계산이 느린 게 아니라 한 번 더 다녀오는 것 자체가 비싸다.**
RPC가 프로필까지 조인해 반환하면 45 ms → 22 ms로 절반이 된다.

**3. "라이브러리 차이보다 3~4자리 크다"는 당초 서술은 맞았다. 자릿수는 더 컸다.**

| 항목 | 시간 |
|------|-----|
| 검색 1회 (종단) | 45.1 ms |
| es-toolkit debounce의 런타임 이득 | 0.0000011 ms |

**약 4천만 배.** debounce가 요청을 10회 → 1회로 줄여 절약한 시간은 **405 ms**다.
라이브러리 선택이 아니라 요청 횟수가 전부였다는 결론이 절대 수치로 확인됐다.

> 측정 한계: ③의 45 ms는 네트워크 RTT를 포함한 종단 지연이라 DB 시간의 **상한값**이다.
> 순수 DB 시간은 ①②의 `explain analyze` 값(1.7 ms)이 정확하다.
> 측정 위치는 개발 머신(darwin) → Supabase 리전이며, 사용자 위치에 따라 RTT는 달라진다.

### 1-6. 요청 폭주 / 경쟁 상태 (LOW)

TanStack Query는 `queryKey`가 검색어별로 갈리므로 stale 응답이 최신 결과를
덮어쓰는 일은 없다. 다만 취소되지 않은 요청은 계속 나간다.

- [x] `placeholderData: keepPreviousData` 추가 (검색어 바뀔 때 깜빡임 방지) → `queries.ts:35`
- [x] 언마운트 시 debounce 정리 → `useDebouncedValue.ts:29`
      DX 차이는 **드러나지 않았다.** 양쪽 모두 `cancel()` 한 줄로 동일 (3-2 참조)

---

## 2. 실행 단계

### Phase 0 — 준비

- [x] `search_sharing_posts` RPC 본문 확인 (1-1) → 로깅 없음, 리스크 해소
- [x] `explain analyze`로 검색 RPC 기준선 실행 시간 기록 (1-5) → **2026-08-26 완료. 결과는 1-5절**
- [x] 기준선 측정: 변경 전 `pnpm build` 후 클라이언트 청크 크기 기록
- [x] 의존성 설치 — `lodash@4.18.1`, `es-toolkit@1.50.0`, `@types/lodash@4.17.25`
- [ ] 브랜치 생성: `feat/realtime-search-debounce` (아직 안 함 — 커밋 정책 참조)

> `lodash-es`는 Phase 2의 3번 케이스 측정 시에만 추가. 비교가 끝나면 **한쪽은 반드시 제거**한다.

### ⚠️ 커밋 정책

**이 실험 중에는 자동으로 커밋하지 않는다.** 사용자가 직접 확인한 뒤 커밋 시점을
지정한다. 따라서 원래 계획의 "lodash 버전 커밋 → es-toolkit 버전 커밋"으로
diff를 남기는 방식은 쓸 수 없다.

대체 수단: **두 버전의 차이를 이 문서에 직접 기록**한다 (아래 Phase 1 결과).
차이가 import 한 줄뿐이므로 문서 기록으로 충분하다.

### Phase 1 — 트랙 A: 실사용 적용 ✅ 완료 (2026-08-15)

#### 구현 결과

**신규 파일**

| 파일 | 역할 |
|------|------|
| `src/hooks/useDebouncedValue.ts` | 비교 대상. 두 라이브러리 차이는 import 한 줄뿐 |
| `src/__tests__/hooks/useDebouncedValue.test.ts` | 훅 동작 6케이스 (동등성 검증용) |
| `src/__tests__/components/SharingSearch.test.tsx` | 검색 UX 12케이스 (지연·IME·최소 글자수·즉시검색·빈 상태) |
| `src/components/sharing/SharingEmptyState.tsx` | 0건 상황 4분기 (9-5 참조) |

> Phase 1 시점에는 검색 UX 6케이스였다. 9절의 IME 버그 수정과 빈 상태 개선을 거쳐 12케이스가 됐다.

**수정 파일**

| 파일 | 변경 |
|------|------|
| `src/app/sharing/components/SharingContents.tsx` | 버튼 제출 검색 → 실시간 검색 |
| `src/services/sharing/queries.ts` | `enabled` 조건 2자 이상, `placeholderData: keepPreviousData` |
| `src/services/sharing/sharing.types.ts` | `MIN_SEARCH_QUERY_LENGTH = 2` 상수 추가 |

**⚠️ 폐기된 접근 — 입력 상태를 두 개로 나눈 IME 처리 (2026-08-17 제거)**

Phase 1에서는 상태를 둘로 나누고 조합 완료를 기다렸다.

```
inputValue      = 화면에 보이는 값 (모든 onChange 반영)
committedQuery  = 검색에 넘길 확정 값 (compositionend에서만 갱신)
```

**이 접근은 버그였다.** 한글 IME는 마지막 음절의 `compositionend`가 스페이스/엔터
전까지 발생하지 않으므로, 마지막 글자가 영영 검색되지 않는다. 상세는 9-1 참조.

`committedQuery`, `isComposingRef`, composition 핸들러 2개는 모두 **제거됐다.**

**현재 구현 — 입력값을 그대로 디바운스**

```typescript
const { debouncedValue: debouncedQuery, commitNow } =
  useDebouncedValue(inputValue);

const searchTerm =
  inputValue.trim().length >= MIN_SEARCH_QUERY_LENGTH &&
  debouncedQuery.trim().length >= MIN_SEARCH_QUERY_LENGTH
    ? debouncedQuery.trim()
    : '';
```

`inputValue`(디바운스 전)와 `debouncedQuery`(디바운스 후) 양쪽에 게이트를 걸었다.

- 검색어를 지우면 `inputValue`가 즉시 비어서 debounce 300ms를 기다리지 않고 전체 목록으로 복귀
- 입력이 아직 안정되지 않은 구간에서는 전체 목록을 유지해 빈 화면이 깜빡이지 않음
- 조합 중 자모(`ㄹ`, `레ㄱ`)는 다음 입력이 이어지면 디바운스가 취소하고,
  멈춰서 남더라도 2글자 미만 게이트에 막힌다 → **composition 처리 없이도 해결된다**

**⚠️ 정정 (2026-08-17) — "cleanup 버그"는 버그가 아니었다**

초안 예시의 아래 코드를 "버그"로 기록했었다:

```typescript
useEffect(() => {
  update(value);
  return () => update.cancel();
}, [value, update]);
```

주장은 "`value`가 바뀔 때마다 cleanup이 예약을 취소하므로 영구히 발동하지 않는다"였다.
**실측 결과 틀렸다.**

React는 의존성이 바뀌면 **이전 효과의 cleanup을 먼저 실행하고 그 다음에 새 효과를 실행**한다.
즉 순서가 `cancel(이전 예약)` → `schedule(새 예약)`이므로, 마지막 예약은 항상 살아남는다.
게다가 debounce 함수 자체가 호출될 때 내부적으로 이전 타이머를 지우므로 이 `cancel`은 **중복**이다.

검증: 이 패턴으로 훅을 만들어 "한 번 입력 후 대기", "연속 입력 후 대기" 두 케이스를 돌렸고
**둘 다 정상 동작**했다.

현재 코드는 효과를 둘로 나눈 형태를 유지한다. 동작 차이가 있어서가 아니라
"값 변경 시 예약" / "언마운트 시 정리"라는 의도가 코드에 드러나기 때문이다.

```typescript
useEffect(() => {
  scheduleUpdate(value);
}, [value, scheduleUpdate]);

useEffect(() => () => scheduleUpdate.cancel(), [scheduleUpdate]);
```

> 이 항목은 **검증 없이 추론만으로 "버그"라고 단정한 사례**다.
> 4절(측정 방법론)의 "불리한 결과도 기록한다" 원칙에 따라 정정 내용을 남긴다.

#### 두 버전의 유일한 차이

```diff
- import debounce from 'lodash/debounce';
+ import { debounce } from 'es-toolkit';
```

**그 외 변경 0줄.** `es-toolkit/compat` 불필요, 타입 에러 0, 테스트 수정 0.

#### 검증 결과 (양쪽 동일)

| 검증 | lodash | es-toolkit |
|------|--------|-----------|
| `pnpm type-check` | 통과 | 통과 |
| `pnpm test:run` | 201 passed (29 files) | 201 passed (29 files) |
| `pnpm lint` | 0 error / 4 warning (기존) | 0 error / 4 warning (기존) |
| `pnpm build` | 성공 | 성공 |

> 훅 테스트 6개 + 검색 UX 테스트 6개가 **양쪽에서 수정 없이 통과** →
> 이 사용 사례에서 두 라이브러리는 동작상 완전히 교체 가능하다.

#### 번들 크기 (Next 클라이언트 청크 전체, `.next/static/chunks/**/*.js`)

Next 16 Turbopack 빌드는 라우트별 First Load JS를 출력하지 않아
클라이언트 청크 전체를 합산해서 측정했다.

| 상태 | raw | gzip -9 | 기준선 대비 gzip |
|------|-----|---------|-----------------|
| 기준선 (실시간 검색 전) | 3,252,252 | 873,178 | — |
| lodash 버전 | 3,258,981 | 877,127 | **+3,949 B** |
| es-toolkit 버전 | 3,256,751 | 876,123 | **+2,945 B** |

**해석 주의**: 기준선 대비 증가분에는 내가 새로 쓴 코드(훅, IME 핸들러,
파생 상태)가 포함된다. **라이브러리에만 귀속되는 차이는 두 버전의 차이**다:

> **es-toolkit이 gzip 1,004 B (raw 2,230 B) 작다.**
> lodash가 추가한 순증(3,949 B) 대비 **약 25% 절감**.

97%가 아니다. `lodash/debounce` 딥 임포트를 썼기 때문이다.
전체 임포트(`import _ from 'lodash'`)와 비교하면 훨씬 큰 격차가 나올 것이고,
그 비교는 Phase 2에서 격리 측정으로 확인한다.

#### API 차이 (설치된 타입 정의에서 확인)

| 항목 | lodash 4.18.1 | es-toolkit 1.50.0 |
|------|--------------|-------------------|
| 옵션 | `{ leading, trailing, maxWait }` | `{ edges: ('leading'\|'trailing')[], signal }` |
| `maxWait` | ✅ | ❌ **없음** (순정 API) |
| `AbortSignal` | ❌ | ✅ |
| `cancel` / `flush` | ✅ / ✅ | ✅ / ✅ (+ `schedule`) |
| 콜백 반환값 | `ReturnType<T> \| undefined` | `void` 강제 (`F extends (...) => void`) |
| 타입 정의 | `@types/lodash` 별도 설치 | 패키지 내장 |
| `sideEffects: false` | ❌ (lodash 본체) | ✅ |

**실무 판단**
- 이번 사용 사례는 `leading`/`maxWait`가 필요 없어 차이가 드러나지 않았다.
- `maxWait`가 필요하면 es-toolkit 순정 API로는 안 되고 `es-toolkit/compat`가 필요하다 — 그러면 번들 이점이 줄어든다. **이건 Phase 2에서 함께 측정할 것.**
- `AbortSignal`은 여러 debounce를 한 컨트롤러로 정리할 때 유리하다. 다만 이번엔 debounce가 하나뿐이라 `cancel()`로 충분했고, 실이득은 없었다.

#### Phase 1에서 얻은 결론

1. **교체 비용은 사실상 0** — import 한 줄, 타입·테스트 수정 없음
2. **번들 이점은 실재하지만 1 KB 수준** — "97% 감소"는 임포트 방식을 바꿨을 때의 숫자
3. **런타임 성능은 이 단계에서 측정 대상이 아니다** (0절) → Phase 3
4. 실시간 검색의 실제 비용은 라이브러리가 아니라 **DB 호출 횟수**다 → Phase 3-C에서 정량화

#### 현재 코드 상태

`src/hooks/useDebouncedValue.ts`는 **es-toolkit 버전으로 두었다** (측정값이 더 작아서).
최종 선택은 Phase 3 런타임 벤치까지 본 뒤 Phase 4에서 확정한다.
lodash도 아직 설치되어 있다 (Phase 2·3 측정에 필요).

### Phase 2 — 번들 크기 정밀 측정 ✅ 완료 (2026-08-15)

Next 빌드 청크는 다른 코드가 섞여 노이즈가 크다. esbuild로 격리 측정했다.

**측정 도구**: `scripts/measure-bundle.ts` (신규) — `pnpm bench:bundle`

해당 유틸만 쓰는 최소 엔트리를 문자열로 만들어 esbuild `stdin`으로 넘기고,
`bundle: true`, `treeShaking: true`, `format: 'esm'`, `target: 'es2020'`으로
번들한 뒤 raw / minified / min+gzip(level 9)을 잰다.

트리셰이킹에 지워지지 않도록 각 유틸을 `export const x_ = (...a) => x(...a)`로
감싸서, "실제로 그 함수를 쓰는" 최소 조건을 만들었다.

추가 설치: `esbuild@0.28.2`, `lodash-es@4.18.1`, `@types/lodash-es` (devDependency)

#### 결과 1 — debounce 단독

| 임포트 방식 | raw | minified | **min+gzip** | es-toolkit 대비 |
|------------|-----|----------|--------------|----------------|
| `import _ from 'lodash'` | 226,523 | 73,836 | **26,820** | 79.12x |
| `import debounce from 'lodash/debounce'` | 11,720 | 3,510 | **1,648** | 4.86x |
| `import { debounce } from 'lodash-es'` | 7,888 | 2,922 | **1,450** | 4.28x |
| `import { debounce } from 'es-toolkit'` | 1,527 | 550 | **339** | 1.00x |
| `import { debounce } from 'es-toolkit/compat'` | 2,642 | 980 | **522** | 1.54x |

#### 결과 2 — 유틸 5개 (`debounce`, `throttle`, `groupBy`, `uniqBy`, `chunk`)

| 임포트 방식 | raw | minified | **min+gzip** | es-toolkit 대비 |
|------------|-----|----------|--------------|----------------|
| `import _ from 'lodash'` | 226,813 | 74,036 | **26,889** | 36.39x |
| `import x from 'lodash/x'` (딥 임포트 5개) | 96,832 | 26,805 | **10,647** | 14.41x |
| `import { ... } from 'lodash-es'` | 64,348 | 20,867 | **8,090** | 10.95x |
| `import { ... } from 'es-toolkit'` | 3,700 | 1,469 | **739** | 1.00x |
| `import { ... } from 'es-toolkit/compat'` | 27,044 | 10,367 | **3,704** | 5.01x |

#### 가설 검증

| 케이스 | 가설(min+gz) | 실측 | 판정 |
|--------|-------------|------|------|
| `lodash` 전체 | ~25 KB | 26,820 B | 적중 |
| `lodash/debounce` | ~2 KB | 1,648 B | 적중 |
| `lodash-es` | ~1.5 KB | 1,450 B | 적중 |
| `es-toolkit` | ~0.4 KB | 339 B | 적중 |

#### 해석

**1. "97% 감소"는 사실이다 — 단, 비교 대상이 `lodash` 전체 임포트일 때만.**

`339 / 26,820 = 1.26%` → **98.7% 감소**. 마케팅 문구가 과장은 아니다.
다만 이건 **"lodash를 배럴로 통째로 임포트한 코드"**와의 비교다.
`lodash/debounce` 딥 임포트와 비교하면 `339 / 1,648` → **79% 감소(4.86배)**로 줄어든다.

**2. 유틸을 여러 개 쓸수록 격차가 벌어진다.**

es-toolkit은 1개 → 5개로 늘려도 339 B → 739 B (2.2배)에 그친다.
lodash-es는 1,450 B → 8,090 B (5.6배)로 함수 개수에 거의 비례해 늘어난다.
lodash 함수들은 각자 내부 헬퍼 그래프를 크게 끌고 오는데, 그게 완전히 공유되지 않기 때문이다.

> 실무 함의: 유틸을 1~2개만 쓴다면 차이가 1 KB대라 무시할 만하다.
> 5개 이상 쓰기 시작하면 **10 KB 가까이 차이**가 나므로 그때는 의미 있는 선택이 된다.

**3. `es-toolkit/compat`은 이점의 상당 부분을 반납한다.**

Phase 1에서 확인했듯 es-toolkit 순정 `debounce`에는 `maxWait`가 없다.
`maxWait`가 필요해 `compat`으로 가면:
- debounce 단독: 339 → 522 B (1.54배). 그래도 lodash보다 3배 작다
- 유틸 5개: 739 → 3,704 B (5.01배). lodash-es(8,090)의 절반 수준까지 좁혀진다

`compat`은 lodash API 호환을 위해 인자 검증·타입 분기 코드가 추가돼서 커진다.
**순정 API로 쓸 수 있는지가 es-toolkit 도입 이득의 핵심 변수다.**

#### Next.js `optimizePackageImports` 검증

배럴 임포트(`import { debounce } from 'lodash'`)로 바꿔서 앱을 빌드해봤다.

| 구성 | 클라이언트 청크 gzip | 기준선 대비 |
|------|--------------------|-----------|
| 기준선 (실시간 검색 전) | 873,178 | — |
| `lodash/debounce` (딥 임포트) | 877,127 | +3,949 B |
| `lodash` (배럴 임포트) | 878,270 | +5,092 B |
| `lodash` 배럴 + `optimizePackageImports: ['lodash']` | 878,270 | +5,092 B |

**결론 두 가지:**

1. **배럴 임포트를 써도 25 KB가 통째로 들어오지 않는다.** 딥 임포트 대비 +1,143 B에 그쳤다.
   Next 16 / Turbopack이 이미 lodash 배럴을 잘 털어낸다.
2. **`optimizePackageImports: ['lodash']`를 명시해도 크기가 1바이트도 안 바뀐다.**
   이 설정을 추가할 이유가 없다. (측정 후 `next.config.ts`는 원상복구함)

> 즉 esbuild 격리 측정에서 나온 26 KB짜리 "lodash 전체 임포트" 수치는
> **번들러가 최적화를 못 할 때의 최악값**이다. 실제 Next 앱에서는 재현되지 않는다.
> 이건 es-toolkit에 불리한 정정이지만, 사실이므로 그대로 기록한다.

#### Phase 2 결론

| 질문 | 답 |
|------|-----|
| es-toolkit이 작은가? | 그렇다. 격리 기준 debounce 4.9배, 유틸 5개 14.4배 |
| "97% 감소"가 맞나? | 맞다. 단 `lodash` 전체 임포트 대비. 딥 임포트 대비는 79% |
| 실제 앱에서 체감되나? | debounce 하나면 **약 1 KB**. 사용자 체감은 사실상 없음 |
| 언제 의미 있나? | 유틸을 여러 개 쓸 때, 그리고 `compat` 없이 순정 API로 쓸 수 있을 때 |

### Phase 3 — 트랙 B: 런타임 벤치마크 ✅ 완료 (2026-08-15)

#### 3-A. `vitest bench` — 정량 측정

**파일**: `bench/utils.bench.ts`, 설정 `vitest.bench.config.mts`, 실행 `pnpm bench:runtime`

기본 vitest 설정은 jsdom + Supabase 모킹 setup을 쓴다. 순수 연산 속도를 재는 데는
불필요하고 노이즈만 늘리므로 **node 환경 + setup 없음**의 별도 설정을 만들었다.
(원래 계획의 `src/__bench__/`가 아니라 `bench/`에 둔 이유: `src/**`는 커버리지
집계 대상이라 벤치 파일이 "0% 미커버 파일"로 잡힌다.)

**측정 환경**: Node v22.15.1 / darwin / 2026-08-15 / 3회 실행 후 중앙값

| 함수 | 데이터 | 승자 | 배율 (3회: 1회차 / 2회차 / 3회차) |
|------|-------|------|--------------------------------|
| `chunk` | 10,000건, 크기 100 | **es-toolkit** | **3.96x** (3.96 / 4.22 / 3.84) |
| `uniqBy` | 10,000건 | **es-toolkit** | **2.01x** (2.13 / 1.41 / 2.01) |
| `cloneDeep` | 5단계 중첩 | **es-toolkit** | **1.96x** (2.03 / 1.96 / 1.93) |
| `sortBy` | 10,000건 | **es-toolkit** | **1.34x** (1.34 / 2.48 / 1.30) |
| `debounce` (대조군) | 생성+호출 1회 | **es-toolkit** | **1.48x** (1.46 / 1.58 / 1.48) |
| `groupBy` | 10,000건 | **lodash** | **1.26x** (1.08 / 1.26 / 1.30) |
| `intersection` | 5,000 x 5,000 | **lodash** | **1.45x** (1.45 / 1.55 / 1.45) |

절대 처리량(1회차 기준, hz = 초당 실행 횟수):

| 함수 | lodash | es-toolkit |
|------|--------|-----------|
| `chunk` | 63,321 | 250,819 |
| `uniqBy` | 9,107 | 19,369 |
| `cloneDeep` | 9,138 | 18,540 |
| `groupBy` | 6,859 | 6,328 |
| `intersection` | 5,491 | 3,779 |
| `sortBy` | 487 | 651 |
| `debounce` | 3,000,429 | 4,386,768 |

**해석**

1. **"2~3배 빠르다"는 함수를 골라야 성립한다.**
   `chunk`(4배), `uniqBy`(2배), `cloneDeep`(2배)에서는 주장대로 나온다.
   그런데 **7개 중 2개는 lodash가 더 빠르다** — `groupBy` 1.26배, `intersection` 1.45배.
   전 영역에서 빠른 게 아니라 함수마다 다르다.

2. **방향은 3회 내내 일관됐다.** 배율 크기는 흔들려도(`sortBy` 1.30~2.48) 승자가
   뒤집힌 함수는 하나도 없다. 즉 승패는 측정 노이즈가 아니다.

3. **`intersection`에서 lodash가 이기는 이유(추정)**: lodash는 배열이 커지면
   내부적으로 `Set` 기반 경로로 전환한다. 5,000 x 5,000은 그 임계값을 넘는 크기다.
   작은 배열에서는 결과가 달라질 수 있다.

4. **대조군 `debounce`: 가설은 "차이 없음"이었는데 1.48배 차이가 나왔다.**
   가설은 엄밀히는 반증이다. 다만 **초당 300만 회 vs 439만 회**다.
   실시간 검색에서 debounce는 타이핑 10회당 10번 호출되므로,
   이 차이가 만드는 실제 시간 차는 **약 0.0000011초**다. 측정은 되지만 의미는 없다.

#### 3-B. `/lab/utils-bench` 브라우저 페이지

**파일**: `src/app/lab/utils-bench/page.tsx`, `components/UtilsBenchContents.tsx`,
`components/bench-cases.ts`

- 데이터 크기 선택: 1,000 / 10,000 / 100,000
- 함수별로 **예열 60ms 후 200ms 동안 반복 실행**해 초당 처리 횟수를 측정
- 결과를 좌우 비율 막대 + 배율 배지로 표시
- 케이스마다 `setTimeout(0)`으로 양보해 진행 상황이 화면에 그려지도록 함
- `robots: { index: false }` — 검색엔진 색인 제외

주의:
- [x] 예열 구간 포함 (없으면 JIT 미최적화 상태라 결과 무의미)
- [ ] **프로덕션 빌드에서 측정할 것.** dev 모드 숫자는 기록하지 않는다
      → **미완. 유일하게 남은 측정 항목이다.** 다만 3-A의 `vitest bench`가 같은 함수를
      Node에서 3회 측정했으므로 보강 성격이며, 없어도 Phase 4 결론은 바뀌지 않는다
- [x] `/lab` 경로는 `PROTECTED_PATHS`에 넣지 않음 (인증 불필요)
      → 확인: `middleware.ts:4` = `['/my-shop', '/chat', '/sharing/new', '/board/new']`
- [x] 실험 종료 후 **삭제 또는 프로덕션 제외** 결정 → Phase 4에서 "유지"로 결정

> ⚠️ 이 페이지는 lodash와 es-toolkit을 **둘 다** 클라이언트 번들에 넣는다.
> 별도 라우트라 코드 분할되지만, 남겨둘 거라면 이 점을 인지할 것.

#### 3-C. debounce 지연시간별 실제 요청 횟수

**파일**: `scripts/measure-debounce-calls.ts`, 실행 `pnpm bench:calls`

원래 계획은 브라우저 Network 탭 수동 카운트였으나, 타이머로 타이핑을 시뮬레이션해
자동 측정하도록 바꿨다. 더 정확하고 반복 가능하다.

**10글자 입력 시 검색 실행 횟수** (lodash / es-toolkit 결과 완전 동일)

| 타이핑 속도 | debounce 없음 | 150ms | 300ms | 500ms |
|------------|--------------|-------|-------|-------|
| 한 글자당 100ms (빠름) | 10회 | **1회** | **1회** | **1회** |
| 한 글자당 250ms (보통) | 10회 | 10회 | **1회** | **1회** |
| 한 글자당 400ms (느림) | 10회 | 10회 | 10회 | **1회** |

**여기가 이 실험에서 가장 실용적인 발견이다.**

1. **지연시간이 타이핑 간격보다 짧으면 debounce 효과가 0이다.**
   한 글자당 400ms로 치는 사용자에게 300ms 설정은 **아무것도 줄여주지 않는다**(10회 그대로).
   "debounce를 걸었으니 안전하다"는 가정이 항상 성립하지 않는다.

2. **현재 설정(300ms)의 적용 범위**: 한 글자당 250ms보다 빠르게 치면 1회로 줄어든다.
   일반적인 검색어 입력 속도는 이 범위에 들어가지만, 경계에 있는 사용자는 이득이 없다.

3. **500ms로 올리면 모든 속도 구간에서 1회**가 되지만, 입력 후 결과까지 0.5초를
   기다려야 해 체감이 느려진다. → Phase 4에서 결정 (7절 BACKLOG에도 기록)

4. **두 라이브러리 결과가 12개 조합 전부 동일** → 동작 동등성 재확인.
   즉 **실시간 검색의 서버 부하는 라이브러리 선택과 무관하고 지연시간 설정이 전부 결정한다.**

**한글 보정**: 위 수치는 글자마다 요청이 나가는 최악 조건이다. 실제로는 IME 처리
(`SharingContents`의 `compositionend` 확정)로 음절 단위로만 확정되므로
자모 입력분은 애초에 요청이 되지 않는다.

### Phase 4 — 정리 및 결정 ✅ 완료 (2026-08-15)

#### 결정 1 — 앱 코드는 **es-toolkit**

`src/hooks/useDebouncedValue.ts`:

```typescript
import { debounce } from 'es-toolkit';
```

| 근거 | 수치 |
|------|------|
| 용량 | 339 B vs lodash 1,648 B (4.86배) |
| 타입 | 패키지 내장 (`@types/lodash` 불필요) |
| 교체 비용 | import 한 줄. 되돌리기도 한 줄 |
| 속도 | debounce 1.48배 우세 (실사용 영향은 없음) |
| 리스크 | `maxWait` 없음. **현재 코드는 안 씀** |

되돌리려면 `useDebouncedValue.ts`의 import 한 줄만 바꾸면 된다.
테스트 12개가 양쪽에서 동일하게 통과하므로 안전망도 있다.

#### 결정 2 — 벤치마크 자산 **전부 유지**

| 파일 | 용도 |
|------|------|
| `scripts/measure-bundle.ts` | `pnpm bench:bundle` — 용량 비교 |
| `scripts/measure-debounce-calls.ts` | `pnpm bench:calls` — 검색 실행 횟수 |
| `scripts/measure-search-cost.ts` | `pnpm bench:search` — 검색 1회의 종단 비용 (2026-08-26 추가) |
| `bench/utils.bench.ts` | `pnpm bench:runtime` — 함수 속도 |
| `vitest.bench.config.mts` | 벤치 전용 설정 (node 환경) |
| `src/app/lab/utils-bench/**` | 브라우저 측정 페이지 |

라이브러리 버전이 올라갔을 때 재측정하거나 글을 쓸 때 다시 쓴다.

#### ⚠️ 계획과 달라진 점 — lodash는 `dependencies`에 남긴다

원래 계획은 "한쪽 선택 후 나머지 **의존성 제거**"였다. 실제로는 그렇게 할 수 없다.

**이유**: `/lab/utils-bench` 페이지를 유지하기로 했는데, 이 페이지가
`src/app/lab/utils-bench/components/bench-cases.ts`에서 lodash를 임포트한다.
`src/app/**`는 프로덕션 빌드에 포함되는 앱 코드다.
lodash를 `devDependencies`로 내리면 `pnpm install --prod` 환경에서 빌드가 깨진다.

**즉 "앱에서 쓰는 라이브러리를 하나로 줄인다"는 목표는 `/lab` 페이지를 유지하는 한 달성되지 않는다.**

| 패키지 | 위치 | 이유 |
|--------|------|------|
| `es-toolkit` | dependencies | 앱 코드가 사용 |
| `lodash` | **dependencies** | `/lab` 페이지가 사용 (앱 코드) |
| `@types/lodash` | devDependencies | 타입은 빌드 시점에만 필요 |
| `lodash-es` / `@types/lodash-es` | devDependencies | `scripts/measure-bundle.ts`에서 문자열로만 참조 |
| `esbuild` | devDependencies | 측정 스크립트 전용 |

나중에 lodash를 완전히 걷어내고 싶다면 선택지는 두 가지다 (→ 7절 BACKLOG):
- `/lab` 페이지 삭제 (터미널 스크립트만 유지 — 그러면 lodash는 devDependency로 내려감)
- `/lab`을 별도 저장소/앱으로 분리

#### 최종 검증

```bash
pnpm type-check   # 통과
pnpm lint         # 0 error (기존 warning 4건은 이 작업과 무관)
pnpm test:run     # 201 passed (29 files)
pnpm build        # 성공
```

#### 커밋 (사용자 확인 후 진행)

**아직 커밋하지 않았다.** 제안 분리안:

| # | 메시지 | 포함 파일 |
|---|--------|----------|
| 1 | `feat(sharing): 검색어 입력 시 실시간 검색 적용` | `SharingContents.tsx`, `queries.ts`, `sharing.types.ts`, `src/hooks/useDebouncedValue.ts`, `package.json`(es-toolkit) |
| 2 | `test(sharing): 실시간 검색 디바운스/IME 테스트 추가` | `src/__tests__/hooks/useDebouncedValue.test.ts`, `src/__tests__/components/SharingSearch.test.tsx` |
| 3 | `chore: lodash/es-toolkit 벤치마크 도구 추가` | `scripts/measure-*.ts`, `bench/**`, `vitest.bench.config.mts`, `src/app/lab/**`, `package.json`(스크립트·devDeps) |
| 4 | `docs: lodash vs es-toolkit 비교 실험 기록` | `debounce-benchmark-plan.md` |

> `middleware.ts → src/proxy.ts` 이름 변경이 스테이징에 남아 있다. 이 실험과 무관한
> 별도 변경이므로 함께 커밋하지 말 것.
  - `chore: lodash/es-toolkit 벤치마크 스크립트 추가` (남길 경우)

---

## 3. 비교 항목 상세

### 3-1. 코드 작성 측면 체크리스트

✅ 작성 완료 (Phase 1~4 실측 기준)

| 항목 | lodash 4.18.1 | es-toolkit 1.50.0 |
|------|--------------|-------------------|
| 임포트 방식 | 배럴/딥 임포트 모두 가능. 딥 임포트가 작음 | 배럴만. 이미 함수 단위로 쪼개져 있음 |
| 타입 정의 | `@types/lodash` 별도 설치 필요 | 패키지 내장 (TS로 작성) |
| `debounce` 옵션 | `{ leading, trailing, maxWait }` | `{ edges: ('leading'\|'trailing')[], signal }` |
| `maxWait` | ✅ | ❌ — `es-toolkit/compat` 필요 |
| `.cancel()` / `.flush()` | ✅ / ✅ | ✅ / ✅ (+ `schedule()`) |
| `AbortSignal` 지원 | ❌ | ✅ |
| 콜백 반환값 | `ReturnType<T> \| undefined` | `void` 강제 |
| ESM/CJS 호환 | CJS 기본. Node ESM에서 `lodash/debounce`는 확장자 없이 해석 안 됨 | ESM/CJS 양쪽 export 맵 제공 |
| `sideEffects: false` | ❌ | ✅ |
| `sortBy` 시그니처 | `sortBy(arr, fn)` | `sortBy(arr, [fn])` — 기준을 **배열로** 받음 |

**실측에서 드러난 것**
- 이번 사용 사례는 `leading`/`maxWait`가 필요 없어 API 차이가 드러나지 않았다
- `AbortSignal`은 debounce가 하나뿐이라 `cancel()`로 충분했고 실이득이 없었다
- `sortBy` 시그니처 차이: 순수 JS에서는 **에러 없이 정렬되지 않은 배열이 반환된다**(실측 확인).
  다만 **TypeScript에서는 타입 에러로 잡힌다** — 아래 코드는 `tsc`에서 TS2345로 실패한다.
  ```
  error TS2345: Argument of type '(o: { n: number; }) => number' is not assignable to
  parameter of type '(((item: { n: number; }) => unknown) | "n")[]'.
  ```
  즉 이 프로젝트(TS strict)에서는 조용한 버그가 되지 않는다.
  **JS 파일이나 `any`가 섞인 경로에서만 위험하다.**

> `@types/lodash`가 별도 패키지라는 점 = devDependency 1개 추가.
> es-toolkit은 TS로 작성되어 타입 내장. 이건 크기가 아니라 **설치 단계**의 차이다.

### 3-2. React 정리(cleanup) 패턴 비교 — 실질적 차이

es-toolkit `debounce`는 `AbortSignal`을 옵션으로 받는다:

```typescript
// es-toolkit
const controller = new AbortController();
const fn = debounce(handler, 300, { signal: controller.signal });
// cleanup: controller.abort()

// lodash
const fn = debounce(handler, 300);
// cleanup: fn.cancel()
```

- [x] 실측 결과: **차이 없었다.** debounce가 하나뿐이라 `cancel()`로 충분했고,
      `useDebouncedValue.ts`는 양쪽 모두 동일한 코드로 동작했다
- [–] 여러 debounce를 한꺼번에 정리해야 하는 상황이 생기면 그때 `AbortSignal` 이점이 나타난다
      → **해당 없음.** 이 프로젝트의 debounce는 하나뿐이다. 조건이 생기면 재검토

### 3-3. 마이그레이션 난이도

✅ Phase 1·4에서 실측으로 답이 나왔다.

- [x] `es-toolkit/compat` 없이 순정 API로 전환 가능한지
      → **가능.** `maxWait`를 안 쓰므로 순정 `debounce`로 충분했다
- [x] 전환 시 코드 diff 라인 수
      → **1줄.** `import debounce from 'lodash/debounce'` → `import { debounce } from 'es-toolkit'`.
      타입 수정 0, 테스트 수정 0
- [–] 기존 lodash 코드가 많은 프로젝트라면?
      → **이 리포로는 답할 수 없다.** 앱 코드의 lodash 사용처가 0이었기 때문이다.
      참고 정보: `compat`으로 가면 번들 이점이 줄어든다 (유틸 5개 기준 739 B → 3,704 B, Phase 2)

---

## 4. 측정 방법론 규칙 (공정성)

실험이 무의미해지지 않기 위한 규칙.

1. **프로덕션 빌드에서만 측정.** dev 모드 숫자는 기록하지 않는다.
2. **워밍업 필수.** 벤치는 측정 전 최소 100회 워밍업.
3. **3회 이상 실행 후 중앙값.** 단일 측정 금지.
4. **환경 고정.** 같은 세션, 같은 브라우저, 다른 앱 최소화. 환경 정보를 결과에 기록.
5. **변수 하나만 바꾼다.** IME 처리·최소 글자수·debounce 지연은 두 라이브러리에 동일 적용.
6. **불리한 결과도 기록.** "차이 없음"이 나오면 그대로 쓴다. 유리한 시나리오만 골라 보고하지 않는다.
7. **번들 크기는 min+gzip 기준.** raw 크기는 참고용.

---

## 5. 결과 기록 템플릿

### 5-1. 번들 크기

✅ 측정 완료 (`pnpm bench:bundle`) — debounce 단독 기준

| 케이스 | raw | minified | min+gzip | `lodash` 전체 대비 |
|--------|-----|----------|----------|-------------------|
| `lodash` 전체 | 226,523 | 73,836 | 26,820 | 100% |
| `lodash/debounce` | 11,720 | 3,510 | 1,648 | 6.1% |
| `lodash-es` (tree-shaken) | 7,888 | 2,922 | 1,450 | 5.4% |
| `es-toolkit` | 1,527 | 550 | 339 | **1.3%** |
| `es-toolkit/compat` | 2,642 | 980 | 522 | 1.9% |

유틸 5개 시나리오는 Phase 2 절 참조 (es-toolkit 739 B vs lodash-es 8,090 B).

Next.js 클라이언트 청크 실측 ✅ (Phase 1에서 측정 완료):

| 구성 | raw | gzip -9 | 기준선 대비 |
|------|-----|---------|-----------|
| 기준선 (실시간 검색 전) | 3,252,252 | 873,178 | — |
| + lodash (`lodash/debounce`) | 3,258,981 | 877,127 | +3,949 B |
| + es-toolkit | 3,256,751 | 876,123 | +2,945 B |

라이브러리 귀속 차이: **gzip 1,004 B / raw 2,230 B, es-toolkit 우세**

> Next 16 Turbopack 빌드는 라우트별 First Load JS를 출력하지 않고
> `app-build-manifest.json`도 생성하지 않는다. 그래서 `.next/static/chunks/**/*.js`
> 전체 합산으로 측정했다. 두 측정 사이에 바뀐 것은 import 한 줄뿐이므로 차이는 귀속 가능하다.

### 5-2. 런타임 (vitest bench, ops/sec)

✅ 측정 완료 (`pnpm bench:runtime`, 3회 중앙값)

| 함수 | 데이터 | lodash (hz) | es-toolkit (hz) | 배율 | 승자 |
|------|-------|-------------|-----------------|------|------|
| `groupBy` | 10,000 | 6,859 | 6,328 | 1.26x | lodash |
| `uniqBy` | 10,000 | 9,107 | 19,369 | 2.01x | es-toolkit |
| `chunk` | 10,000 | 63,321 | 250,819 | 3.96x | es-toolkit |
| `cloneDeep` | 중첩 5단계 | 9,138 | 18,540 | 1.96x | es-toolkit |
| `intersection` | 5,000×5,000 | 5,491 | 3,779 | 1.45x | lodash |
| `sortBy` | 10,000 | 487 | 651 | 1.34x | es-toolkit |
| `debounce` (대조군) | 생성+호출 | 3,000,429 | 4,386,768 | 1.48x | es-toolkit |

**7개 중 5개 es-toolkit 승, 2개 lodash 승.**

측정 환경: Node v22.15.1 / darwin 25.6.0 / 측정일 2026-08-15

#### 병기 — 같은 축에 올린 DB 비용 (1-5절 요구사항)

위 표의 배율은 **초당 수천~수백만 회** 단위 연산의 비교다.
검색 1회의 실제 비용을 같은 단위로 옆에 두면 이렇게 된다.

| 항목 | 1회 소요 시간 |
|------|-------------|
| `groupBy` 1회 — lodash 우세분 (6,859 vs 6,328 hz) | 0.0000122 ms |
| `debounce` 1회 — es-toolkit 우세분 (300만 vs 439만 hz) | 0.0000011 ms |
| **검색 1회 — DB 실행 시간** | **1.7 ms** |
| **검색 1회 — 사용자 대기 (네트워크 포함)** | **45.1 ms** |

당초 예상은 "라이브러리 차이보다 3~4자리 크다"였는데, 실측은 **7자리(약 4천만 배)**다.

> **이 실험의 가장 유용한 결론**: `chunk`에서 3.96배가 나오든 `groupBy`에서 1.26배로
> 지든, 검색 화면의 체감에는 아무 영향이 없다. 45 ms 중 라이브러리가 관여하는 몫은
> 0.0000011 ms다. 실제 개선은 **요청 10회 → 1회(405 ms 절약)** 하나였다.

### 5-3. 최종 판단

| 축 | 승자 | 근거 |
|----|------|------|
| 번들 크기 | **es-toolkit** | debounce 단독 4.86배, 유틸 5개 14.4배 작음 (격리 측정) |
| 런타임 속도 | **혼재** | 7개 중 5개 es-toolkit 우세(`chunk` 3.96배 등), 2개 lodash 우세(`groupBy` 1.26배, `intersection` 1.45배) |
| 타입/DX | **es-toolkit** | 타입 내장, `AbortSignal` 지원. 단 `maxWait` 없음 |
| 생태계·안정성 | **lodash** | 훨씬 오래됐고 자료·사례가 많음. es-toolkit은 `compat`으로 마이그레이션 경로 제공 |
| **이 프로젝트 선택** | **es-toolkit** | 쓰는 함수가 `debounce` 하나뿐이라 `maxWait` 부재가 문제되지 않고, 교체·복구가 import 한 줄 |

**한 줄 요약**: 이 프로젝트에서 두 라이브러리의 실질적 차이는 **약 1 KB**다.
선택의 근거는 성능이 아니라 "타입 내장 + 교체 비용 0"이었다.
그리고 실시간 검색의 실제 개선은 라이브러리가 아니라 **요청을 10회에서 1회로 줄인 것**이다.

---

## 6. 예상 결과와 반증 조건

가설을 미리 적어두고, 틀리면 틀렸다고 기록한다.

| 가설 | 반증 조건 | 현재 상태 |
|------|----------|----------|
| debounce 런타임 성능 차이는 측정 노이즈 수준 | 통계적으로 유의한 차이(>10%)가 3회 연속 재현 | **반증** — 1.46/1.58/1.48배가 3회 재현됨. 단 초당 300만 vs 439만 회라 실사용 영향은 0.0000011초 수준 |
| 번들 크기는 es-toolkit이 유의하게 작다 (debounce 단독 기준 3~5배) | `lodash/debounce` 딥 임포트가 1KB 이하로 나옴 | **확인됨** — 격리 측정에서 4.86배 (1,648 → 339 B). 단 앱 전체 청크에서는 gzip 1 KB 차이라 체감 없음 |
| `groupBy`/`cloneDeep` 등에서 es-toolkit이 2배 이상 빠르다 | 배율 1.3배 미만 | **부분 반증** — `cloneDeep` 1.96배·`chunk` 3.96배로 성립하지만, 하필 `groupBy`는 **lodash가 1.26배 빠름**. 함수마다 다르다 |
| 실시간 검색 체감은 라이브러리와 무관, debounce 지연이 결정 | 같은 지연에서 라이브러리별 RPC 호출 수가 다름 | **확인됨** — 타이핑 속도 x 지연 12개 조합에서 두 라이브러리 호출 수 완전 동일 |
| es-toolkit 순정 API로 전환 시 코드 변경은 임포트 1줄 | `compat` 필요하거나 동작 차이 발생 | **확인됨** — import 1줄, 타입·테스트 수정 0 |

**"차이 없다"는 결론도 결과다.** 벤치마크 마케팅 문구와 실제 사용 시나리오의
간극을 확인하는 게 이 실험의 핵심 가치다.

---

## 7. 범위 밖 (BACKLOG로)

Phase 0 확인 과정에서 드러난 것들. 이번 실험에서는 **변수 통제를 위해 건드리지 않는다.**

| 항목 | 내용 | 심각도 |
|------|------|--------|
| 검색 로깅 미구현 | `search_logs`에 쓰는 코드가 없음. 인기 검색어 배지가 2026-07 시드 데이터로 영구 고정. 구현할 때 1-1의 주의사항 적용 | MEDIUM |
| 검색 왕복 2회 | RPC가 프로필까지 조인해 반환하면 1회로 축소. **실측 45 ms → 22 ms (절반)** (1-5) | ~~LOW~~ → **MEDIUM** |
| `ILIKE` 풀스캔 | `pg_trgm` + GIN 인덱스. **실측상 지금은 이득 0** — 풀스캔이 0.39 ms다. 게시글 수천 건 이후로 보류 (1-5) | ~~MEDIUM~~ → **LOW** |
| 검색 RPC 카테고리 인자 | 클라이언트 `filter` 제거 (1-4) | MEDIUM |
| 검색 결과 페이지네이션 | 현재 전체 반환 | LOW |
| 검색어 하이라이팅 | UX | LOW |
| debounce 지연시간 재검토 | 한 글자당 400ms로 치는 사용자에게 300ms 설정은 요청을 하나도 못 줄인다 (Phase 3-C). 500ms로 올릴지 결정 필요 | MEDIUM |
| lodash를 `dependencies`에서 걷어내기 | `/lab` 페이지가 lodash를 쓰는 한 불가능. 페이지를 지우거나 별도 앱으로 분리해야 devDependency로 내려감 (Phase 4) | LOW |
| 전체 프로젝트 lodash 도입 여부 | ✅ 결정됨 — 앱 코드는 es-toolkit 사용 | 완료 |

---

## 8. 공식 문서 대조 검증 (2026-08-15)

기록된 주장을 공식 문서·패키지 메타데이터·실행 결과와 하나씩 대조했다.

### 확인된 주장

| 주장 | 근거 | 결과 |
|------|------|------|
| es-toolkit `debounce`에 `maxWait` 없음 | [es-toolkit.dev/reference/function/debounce](https://es-toolkit.dev/reference/function/debounce.html) — 옵션은 `signal`, `edges`뿐 | ✅ |
| es-toolkit `debounce`가 `AbortSignal` 지원 | 위 문서 — "An optional `AbortSignal` to cancel the debounced function" | ✅ |
| es-toolkit `debounce`에 `cancel`/`flush`/`schedule` | 위 문서 — 세 메서드 명시 | ✅ |
| `edges` 기본값이 `['trailing']` | 위 문서 | ✅ |
| lodash `debounce` 옵션은 `leading`/`maxWait`/`trailing` | [lodash.com/docs/4.17.15](https://lodash.com/docs/4.17.15) | ✅ |
| lodash `debounce`에 `cancel`/`flush` | 위 문서 | ✅ |
| es-toolkit `sortBy`는 기준을 배열로 받음 | [es-toolkit.dev/reference/array/sortBy](https://es-toolkit.dev/reference/array/sortBy.html) — `criteria: Array<((item: T) => unknown) \| keyof T>` | ✅ |
| `es-toolkit/compat`은 lodash 호환용이며 더 크고 느림 | [es-toolkit.dev/compatibility](https://es-toolkit.dev/compatibility.html) — "slightly larger and slightly slower than es-toolkit, because it carries extra logic to match Lodash's behavior" | ✅ |
| `es-toolkit/compat`의 `debounce`는 `maxWait` 지원 | 타입 정의(`dist/compat/function/debounce.d.ts`)에 `maxWait?: number` + 실행 확인 (maxWait 200ms, 1초간 50ms 간격 호출 → 4회 실행) | ✅ |
| lodash에 `sideEffects: false` 없음, 타입 미포함 | `node_modules/lodash/package.json` — `sideEffects`/`types`/`module` 모두 없음 | ✅ |
| es-toolkit에 `sideEffects: false` 있음 | `node_modules/es-toolkit/package.json` | ✅ |
| Node ESM에서 `lodash/debounce`가 확장자 없이 해석 안 됨 | 실행 시 `ERR_MODULE_NOT_FOUND` 발생 | ✅ |

### 정정한 주장

**1. `sortBy`에 함수를 그대로 넘기면 "조용히" 틀린 결과가 나온다 → 부분적으로만 맞음**

- 순수 JS: 에러 없이 정렬되지 않은 배열이 반환된다 (실측 확인)
- **TypeScript: 타입 에러로 잡힌다**

```
error TS2345: Argument of type '(o: { n: number; }) => number' is not assignable to
parameter of type '(((item: { n: number; }) => unknown) | "n")[]'.
```

이 프로젝트는 TS strict라 조용한 버그가 되지 않는다.
"마이그레이션 시 가장 위험한 지점"이라고 쓴 것은 **과장**이었다.
JS 파일이나 `any`가 섞인 경로에서만 위험하다.

**2. 마케팅 문구는 "97% 감소"가 아니라 "up to 97% less"**

[es-toolkit.dev/intro](https://es-toolkit.dev/intro.html) 원문은
"up to 97% less" bundle size, "2-3 times faster runtime performance"다.
**"up to"는 상한값**이라는 뜻이므로, 모든 함수에서 97%가 나온다는 주장이 아니다.

이 실험의 실측(`debounce` 단독, lodash 전체 임포트 대비 98.7% 감소)은
상한값에 근접했지만, 이는 **가장 유리한 비교 조건**에서 나온 숫자다.
딥 임포트 대비로는 79%다.

마찬가지로 "2-3 times faster"도 상한 표현으로 읽어야 한다.
실측에서는 `chunk` 3.96배로 상한을 넘긴 반면, `groupBy`·`intersection`은
오히려 lodash가 빨랐다.

### 검증하지 않은 것

| 항목 | 이유 |
|------|------|
| `intersection`에서 lodash가 빠른 원인 (Set 전환 추정) | 소스를 직접 확인하지 않았다. 문서에도 명시가 없다. **추정으로만 기록** |
| es-toolkit이 "TypeScript로 작성됐다" | 패키지에 타입이 내장된 것은 확인했으나 소스 언어 자체는 확인하지 않았다 |
| Next.js가 lodash 배럴 임포트를 최적화하는 내부 메커니즘 | 결과(크기 변화 없음)만 실측했고 원인은 확인하지 않았다 |

---

## 9. 사후 검증 — 테스트가 실제로 버그를 잡는가 (2026-08-17)

사용자가 브라우저에서 "반응이 너무 느리다"고 보고했다.
원인을 찾는 과정에서 **테스트 자체에 심각한 문제**가 드러났다.

### 9-1. 발견된 실제 버그 — 한글 마지막 음절이 검색되지 않음

**증상**: `/sharing`에서 "레고"를 치고 멈추면 검색이 아예 실행되지 않는다.

**원인**: 한글 IME는 **마지막 음절의 `compositionend`가 스페이스/엔터 전까지 발생하지 않는다.**
`compositionend`에서만 검색어를 확정하던 구현은 마지막 글자를 영영 반영하지 못했다.

재현 결과:

```
입력창 값:  "레고"     ← 화면에는 정상 표시
검색 호출:  []         ← 한 번도 실행되지 않음
```

**수정**: 조합 완료를 기다리지 않고 `inputValue`를 그대로 디바운스한다.
조합 중 자모(`ㄹ`, `레ㄱ`)는 다음 입력이 이어지면 디바운스가 취소하므로 요청되지 않고,
멈춰서 남더라도 2글자 미만이라 게이트에 막힌다.
`committedQuery` state, `isComposingRef`, composition 핸들러 2개를 제거해 **코드가 더 짧아졌다.**

### 9-2. 더 큰 문제 — 테스트가 아무것도 잡지 못했다

버그를 일부러 넣고 전체 테스트를 돌려봤다 (뮤테이션 테스트).

| 넣은 버그 | 수정 전 테스트 | 수정 후 테스트 |
|----------|--------------|--------------|
| debounce 지연 0 (글자마다 검색) | **202개 전부 통과** | 2개 실패 ✅ |
| 최소 글자 수 게이트 제거 | **202개 전부 통과** | 2개 실패 ✅ |
| `commitNow` 제거 (엔터 즉시검색 불가) | **202개 전부 통과** | 2개 실패 ✅ |
| 한글 IME 버그 재현 | — | 4개 실패 ✅ |

**원인**: 컴포넌트 테스트가 진짜 타이머 + `waitFor` 조합이었다.
`waitFor`는 기본 1초까지 기다려주므로 지연이 0ms든 300ms든 결국 통과한다.
**"통과하는 테스트"였지 "검증하는 테스트"가 아니었다.**

### 9-3. 테스트를 어떻게 고쳤나

`src/__tests__/components/SharingSearch.test.tsx`를 가짜 타이머 기반으로 다시 작성했다.

핵심은 **시간을 정확히 제어하고 그 시점에 단언**하는 것이다.

```typescript
fireEvent.change(input, { target: { value: '레고' } });
await advance(DEBOUNCE_MS - 1);
expect(searchCalls).toEqual([]);        // 1ms 모자라면 실행 안 됨

await advance(1);
expect(searchCalls).toEqual(['레고']);  // 채우면 실행됨
```

즉시 실행 경로(엔터, 인기 검색어 클릭)는 **타이머를 전혀 밀지 않고** 단언한다.
그래야 `commitNow`가 빠졌을 때 실패한다.

TanStack Query가 상태 반영을 지연 0 타이머로 예약하므로,
`vi.advanceTimersByTime(0)`으로 시계를 앞당기지 않으면서 그 예약만 실행시키는 헬퍼가 필요했다.

테스트 개수: 검색 화면 6개 → **8개**, 전체 202개 → **203개**

### 9-4. 이번 일에서 얻은 교훈

| 교훈 | 내용 |
|------|------|
| 테스트가 통과한다고 검증되는 게 아니다 | 뮤테이션 테스트로 **테스트를 테스트**해야 안다 |
| `waitFor`는 타이밍 검증을 무력화한다 | "언젠가 되면 통과"라 지연시간 차이를 못 잡는다 |
| 이벤트를 직접 발생시키는 테스트의 한계 | `fireEvent.compositionEnd`를 내가 호출하면 실제로 발생하지 않는 상황을 재현하지 못한다 |
| 브라우저 실측을 대체할 수 없다 | 한글 IME 동작은 테스트로 완전히 흉내내기 어렵다 |

### 9-5. 빈 상태 개선 (2026-08-17)

외부 피드백에서 "빈 상태가 무성의하다"는 지적을 받았다.

**문제**: 0건일 때 `"게시글이 없습니다."` 한 줄만 나온다.
네 가지 다른 상황이 전부 같은 화면이었다.

| 실제 상황 | 사용자가 해야 할 행동 | 기존 화면 |
|----------|-------------------|----------|
| 검색어가 좁음 | 검색어 바꾸기/지우기 | "게시글이 없습니다." |
| 카테고리가 좁음 | 카테고리 전체로 | "게시글이 없습니다." |
| 둘 다 좁음 | 둘 중 하나 풀기 | "게시글이 없습니다." |
| 실제로 등록된 게 없음 | 글쓰기 | "게시글이 없습니다." |

재고가 18개뿐이라 **0건은 예외가 아니라 일상**이다. 그런데 사용자는 이걸
"이 서비스에 물건이 없다"로 해석하고 이탈한다. 실제로는 조건만 풀면 18개가 있다.

**신규 파일**: `src/components/sharing/SharingEmptyState.tsx`

| 상황 | 메시지 | 버튼 |
|------|--------|------|
| 검색어 + 카테고리 | `"곰돌" 검색 결과가 블록·퍼즐 카테고리에 없습니다` | 전체 카테고리에서 찾기 / 검색어 지우기 / 조건 모두 해제 |
| 검색어만 | `"곰돌"에 대한 결과가 없습니다` | 인기 검색어 칩 + 검색어 지우기 |
| 카테고리만 | `블록·퍼즐 카테고리에 아직 등록된 물건이 없습니다` | 전체 보기 / 첫 글 올리기 |
| 조건 없음 | `아직 등록된 물건이 없습니다` | 글쓰기 |

`SharingContents.tsx`에 리셋 핸들러 3개(`handleResetSearch`, `handleResetCategory`,
`handleResetAll`)를 추가했다.

**⚠️ 알려진 한계**: 검색어만 걸린 경우의 "이런 검색어는 어떠세요?" 제안은
상단 인기 검색어와 같은 데이터를 쓴다. 그런데 그 데이터가 2026-07 시드에 고정돼 있어
**제안을 눌러도 0건이 나올 수 있다.** 검색어 로깅을 구현하면 자동으로 해결된다
(→ `BACKLOG.md`).

**테스트**: 4케이스 추가 (검색 UX 8개 → 12개, 전체 203개 → 207개)

뮤테이션 테스트로 검증했다:

| 일부러 넣은 버그 | 결과 |
|----------------|------|
| 예전처럼 단일 메시지로 되돌림 | 3개 실패 ✅ |
| 리셋 버튼이 아무 일도 안 함 | 1개 실패 ✅ |
| 카테고리 케이스와 전체 비었음 케이스를 합침 | 1개 실패 ✅ |

### 9-6. 현재 검색 동작 요약

| 사용자 행동 | 검색 실행 시점 |
|------------|--------------|
| 글자 입력 후 정지 | **300ms 후 자동** |
| 엔터 / 돋보기 버튼 | 즉시 (`commitNow`) |
| 인기 검색어 배지 클릭 | 즉시 |
| 검색어 전체 삭제 | 즉시 전체 목록 복귀 |
| 1글자 입력 | 검색하지 않음 |

**완전한 라이브 서치**다. 엔터는 필수가 아니라 300ms를 건너뛰는 단축 경로다.

미해결로 남은 것 (→ `BACKLOG.md`): 결과 건수 표시, 검색어 지우기 X 버튼,
돋보기 버튼 시각성, 태그 매칭 하이라이트, URL 동기화.
