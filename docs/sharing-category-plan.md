# 교환·나눔 카테고리 대응 계획

> 앱(DodamDuck_APP) Phase 4의 `sharing_posts.category` 컬럼 신설에 대한 웹(DodamDuck_FE) 대응 계획.

## 배경

앱 Phase 4에서 교환·나눔 목록 카테고리 필터를 도입하면서 `public.sharing_posts`에 아래 변경이 **이미 적용**되었다 (기존 15건 백필 완료). DB 작업은 실행 대상이 아니다.

```sql
ALTER TABLE public.sharing_posts
  ADD COLUMN category TEXT NOT NULL DEFAULT '기타';

ALTER TABLE public.sharing_posts
  ADD CONSTRAINT sharing_posts_category_check
  CHECK (category IN ('역할놀이·인형', '블록·퍼즐', '승용·야외', '도서·교구',
'의류·잡화', '기타'));

CREATE INDEX idx_sharing_posts_category_created_at
  ON public.sharing_posts (category, created_at DESC);
```

웹은 이 컬럼을 모른다. `DEFAULT '기타'` 덕에 INSERT는 실패하지 않지만 **웹에서 작성되는 모든 글이 `기타`로 쌓인다** — 즉시 장애는 없고 데이터가 조용히 오염되는 상황.

목표: (1) 웹 작성 글이 올바른 카테고리로 저장되게 하고, (2) 앱과 동일한 카테고리 필터 경험을 웹에도 제공한다.

### 카테고리 6종

| 값 | 예시 |
|---|---|
| 역할놀이·인형 | 실바니안, 플레이모빌, 헬로키티 주방놀이, 곰돌이 인형, 공룡 피규어 |
| 블록·퍼즐 | 레고 듀플로, 마그네틱 블록 |
| 승용·야외 | 킥보드, 유아 자전거 |
| 도서·교구 | 동화책 세트 |
| 의류·잡화 | 아동 운동화 |
| 기타 | 위에 안 맞는 것 |

`전체`는 DB에 저장하지 않는다. 필터 해제를 뜻하는 UI 전용 값이라 CHECK 목록에 없다.

## 확정된 결정 사항

- 배지 + 목록 필터까지 전부 구현
- 폼 카테고리 선택 UI: **Badge 칩 그리드** (앱 `CategoryChips`와 시각적 일치)
- 목록 필터: **서버 필터** — `.eq('category', ...)`, `전체`면 미적용 (신설 인덱스 활용)
- AI 자동 작성도 카테고리 추론

## 사전 검증 결과

- 가운뎃점 코드포인트: 5개 값 전부 `b7` (U+00B7) 확인 ✓
- `zod@^4.4.3` → `z.enum(readonly tuple, { message })` 사용 가능
- `search_sharing_posts`는 `RETURNS SETOF public.sharing_posts` → 검색 경로는 신규 컬럼 자동 포함, RPC 수정 불필요
- 모든 읽기 경로가 `select('*, profiles(...)')` → `category`를 자동으로 받는다
- `scripts/`에는 `seed.sql`/`likes-migration.sql`이 **없다** (`upload-library-images.ts` 하나뿐). SQL 기록은 `.claude/docs/supabase-setup.md`만 갱신

---

## 1. 타입 · 상수 (단일 출처)

### `src/types/supabase.ts` — `sharing_posts`

`Row`에 `category: string;`, `Insert`/`Update`에 `category?: string;` 추가. 이 테이블은 `| null` 유니온을 쓰는 필드가 없고 `NOT NULL DEFAULT`이므로 `string`이 맞다. `SharingPost extends SharingPostRow`이므로 모든 읽기 타입에 자동 전파되고, `search_sharing_posts`의 `Returns`도 Row를 참조하므로 그대로 따라온다.

### `src/services/sharing/sharing.types.ts`

앱과 값이 동일해야 하므로 상수를 그대로 추가. 단 **DB에 저장 가능한 6종만 담은 별도 튜플을 하나 더 둔다** — `SHARING_CATEGORY.ALL`(`'전체'`)은 CHECK 목록에 없는 UI 전용 값이라, 그것까지 포함된 타입을 insert 경로에 쓰면 `전체`가 INSERT돼 CHECK 위반이 나는 길이 타입으로 열린다.

```ts
export const SHARING_CATEGORY = {
  ALL: '전체',
  ROLEPLAY: '역할놀이·인형',
  BLOCKS: '블록·퍼즐',
  RIDE: '승용·야외',
  BOOK: '도서·교구',
  CLOTHES: '의류·잡화',
  ETC: '기타',
} as const;

export type SharingCategory =
  (typeof SHARING_CATEGORY)[keyof typeof SHARING_CATEGORY];

/** DB CHECK 제약에 있는 값만 (ALL 제외) — insert/검증의 단일 출처 */
export const SHARING_CATEGORY_VALUES = [
  SHARING_CATEGORY.ROLEPLAY,
  SHARING_CATEGORY.BLOCKS,
  SHARING_CATEGORY.RIDE,
  SHARING_CATEGORY.BOOK,
  SHARING_CATEGORY.CLOTHES,
  SHARING_CATEGORY.ETC,
] as const;

export type SharingPostCategory = (typeof SHARING_CATEGORY_VALUES)[number];
```

`CreateSharingPostRequest`에 `category: SharingPostCategory;` 추가. 기존 `exchangeOption: '교환' | '나눔'`처럼 camelCase 요청 / snake_case DB 컨벤션 유지.

> zod 스키마·칩 목록·AI 스키마 모두 `SHARING_CATEGORY_VALUES`에서 파생시켜, 웹 안에서는 값이 한 곳에만 적히도록 한다. DB CHECK / 앱 상수 / 웹 상수 3자 동기화는 변경 시 세 곳 동시 수정 원칙 유지.

---

## 2. 서비스 · 쿼리

### `src/services/sharing/sharing-services.ts`

- `servCreateSharingPost` insert 객체에 `category: request.category,` 추가.
- `servFetchSharingPosts` 시그니처를 `(category?: SharingPostCategory, client?: SupabaseClient<Database>)`로 변경하고 조건부 필터:

```ts
let query = supabase
  .from('sharing_posts')
  .select('*, profiles(username, display_name, profile_url)');

if (category) {
  query = query.eq('category', category);
}

const { data, error } = await query.order('created_at', { ascending: false });
```

`category`가 `undefined`(= 전체)면 `.eq`를 걸지 않는다. 옵셔널 `client` 파라미터는 마지막에 유지.

### `src/services/sharing/queries.ts`

```ts
import { keepPreviousData } from '@tanstack/react-query';

all: (category?: SharingPostCategory) =>
  queryOptions({
    queryKey: ['sharing', 'list', category ?? null] as const,
    queryFn: () => servFetchSharingPosts(category),
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  }),
```

**`placeholderData: keepPreviousData` 필수**: 카테고리마다 queryKey가 달라지므로 칩을 누를 때마다 새 쿼리가 뜬다. 이게 없으면 `SharingContents`의 `isLoading`이 true → `displayPosts`가 `undefined` → 그리드 전체가 언마운트되고 `LoadingState`로 교체되어, 칩 하나 누를 때마다 화면이 깜빡인다.

**키 정합성 주의**: `src/app/sharing/page.tsx`의 프리페치는 인자 없는 `sharingQueries.all()` → `['sharing','list',null]`. 클라이언트도 초기 상태가 `전체`이므로 `undefined`를 넘겨 같은 키가 되어야 하이드레이션이 맞는다. 그래서 `category ?? null`로 정규화한다. `useSharing.ts`의 무효화는 넓은 `['sharing']` prefix라 세그먼트 추가에 영향 없음.

### `src/services/sharing/useSharing.ts`

`useSharingList(category?: SharingPostCategory)` → `useQuery(sharingQueries.all(category))`. 파라미터가 옵셔널이므로 `MyShopContents.tsx`의 인자 없는 호출은 그대로 동작.

### 프리페치 호출부 — `src/app/sharing/page.tsx`, `src/app/my-shop/page.tsx`

`servFetchSharingPosts(supabase)`를 호출하는 곳은 **두 군데**다. 둘 다 인자 순서를 맞춰야 한다.

| 파일 | 현재 | 변경 후 |
|---|---|---|
| `src/app/sharing/page.tsx:18` | `servFetchSharingPosts(supabase)` | `servFetchSharingPosts(undefined, supabase)` |
| `src/app/my-shop/page.tsx:27` | `servFetchSharingPosts(supabase)` | `servFetchSharingPosts(undefined, supabase)` |

양쪽 다 프리페치는 현재대로 전체 목록만 유지한다 (두 page 모두 `searchParams`를 읽지 않고, 카테고리는 클라이언트 상태).

> 놓쳐도 `pnpm type-check`에서 잡힌다 — `SupabaseClient`는 `SharingPostCategory | undefined`에 할당 불가라 컴파일 에러가 난다. 즉 인자 순서 변경 자체는 안전하다.

`MyShopContents.tsx:25`의 무인자 `useSharingList()` 호출은 파라미터가 옵셔널이라 그대로 두면 된다.

---

## 3. 검증 스키마

### `src/libs/validations/sharing.ts`

```ts
import { SHARING_CATEGORY_VALUES } from '@/services/sharing/sharing.types';

export const createSharingPostSchema = z.object({
  // ... 기존 4개 필드
  category: z.enum(SHARING_CATEGORY_VALUES, {
    message: '카테고리를 선택해주세요',
  }),
});
```

값을 다시 타이핑하지 않고 상수에서 파생 → 가운뎃점 불일치 위험 원천 제거.

---

## 4. 글쓰기 폼 UI

### 신규 `src/components/sharing/CategoryChips.tsx`

목록 필터와 글쓰기 폼 양쪽에서 쓰는 단일 컴포넌트 (앱과 파일명 일치).

```tsx
interface CategoryChipsProps {
  value: SharingCategory | undefined;
  onChange: (category: SharingCategory) => void;
  includeAll?: boolean;
}
```

- `includeAll`이면 앞에 `전체` 칩 추가 (목록 필터용), 없으면 6종만 (폼용 — 미선택 상태 표현 가능)
- 칩은 기존 `@/components/ui/badge` 사용: 선택됨 `variant="default"`, 미선택 `variant="outline"`, 공통 `className="cursor-pointer"`
- 컨테이너 `flex flex-wrap gap-2` (margin 금지 규칙 준수), 각 칩은 `<button type="button">` 기반

### `src/app/sharing/new/page.tsx`

- `defaultValues`에 `category`를 **넣지 않는다** — 기본값 `기타`면 사용자가 그냥 넘겨서 다시 `기타`가 쌓인다. 미선택 → zod 필수 검증에서 걸림.
- `exchangeOption` Controller 바로 아래에 동일 패턴으로 추가:

```tsx
<Controller
  name="category"
  control={control}
  render={({ field }) => (
    <div className="flex flex-col gap-2">
      <Label className="block">카테고리</Label>
      <CategoryChips value={field.value} onChange={field.onChange} />
      <FormFieldError message={errors.category?.message} />
    </div>
  )}
/>
```

- `onSubmit` mutate 페이로드에 `category: values.category,` 추가.

---

## 5. 목록 · 상세 노출

### `src/app/sharing/components/SharingContents.tsx`

- `const [category, setCategory] = useState<SharingCategory>(SHARING_CATEGORY.ALL);`
- `const filter = category === SHARING_CATEGORY.ALL ? undefined : category;`
- `useSharingList(filter)`
- 검색 폼 아래(인기검색어 블록 다음)에 `<CategoryChips value={category} onChange={setCategory} includeAll />`
- **검색 + 카테고리 조합**: `search_sharing_posts` RPC에는 카테고리 인자가 없으므로 검색 활성 시에만 결과를 클라이언트에서 좁힌다:
  ```ts
  const displayPosts = activeSearch
    ? searchResults?.filter((p) => !filter || p.category === filter)
    : posts;
  ```
  (RPC 시그니처 변경은 앱과 DB 함수까지 건드려야 하므로 이번 범위에서 제외)
- 카드 배지 블록에 카테고리 배지 추가:
  ```tsx
  <div className="flex flex-wrap gap-1">
    <Badge variant="secondary">{post.exchange_option}</Badge>
    <Badge variant="outline">{post.category}</Badge>
  </div>
  ```

### `src/app/sharing/[id]/components/SharingDetailContents.tsx`

제목 블록 아래 조회수/좋아요 영역에 배지 추가. 상세는 현재 `exchange_option`도 노출하지 않으므로 카테고리와 거래방식 배지를 함께 한 줄(`flex flex-wrap gap-2`)로 넣는다.

---

## 6. AI 자동 작성

### `src/libs/validations/ai.ts`

```ts
category: z
  .enum(SHARING_CATEGORY_VALUES)
  .describe('아래 6종 중 하나를 정확히 그대로'),
```

`GeneratedPost`는 `z.infer`이므로 `src/services/ai/ai.types.ts`는 수정 불필요.

### `src/app/api/ai/generate-post/route.ts`

`SYSTEM_PROMPT`에 4번 항목으로 카테고리 6종 열거 + 응답 JSON 예시에 `"category": "..."` 추가. 프롬프트의 값도 하드코딩 대신 `SHARING_CATEGORY_VALUES.join(' / ')`로 삽입해 상수에서 파생시킨다.

### `src/components/sharing/AIGenerateButton.tsx`

`handleClick`에 `setValue('category', response.data.category);` 추가.

> **리스크**: 무료 `google/gemma-4-26b-a4b-it:free` 모델이 enum을 어기면 `Output.object` 검증 실패로 생성 전체가 실패한다. 수동 테스트에서 실패가 반복되면 `.catch(SHARING_CATEGORY.ETC)`로 완화 — 단 그 경우 조용히 `기타`가 들어가므로 성공 토스트 문구에 "카테고리도 확인해주세요"를 넣는다.

---

## 7. 테스트 · 문서

`SharingPost` Row에 필수 `category`가 생기고 `CreateSharingPostRequest`에 필수 필드가 추가되므로 아래는 **고치지 않으면 type-check가 깨진다**:

| 파일 | 작업 |
|---|---|
| `src/__tests__/mocks/factories.ts` | `createMockSharingPost`에 `category: '블록·퍼즐'` 추가 (`기타`가 아닌 값) |
| `src/__tests__/services/sharing-services.test.ts` | 두 `servCreateSharingPost` 호출에 `category` 추가 |
| `src/__tests__/hooks/useSharing.test.ts` | 동일 요청 객체에 `category` 추가 |
| `src/__tests__/libs/validations/sharing.test.ts` | 7개 `safeParse` 객체 전부에 유효한 `category` 추가 + 실패 케이스 2개의 단언을 사유까지 좁힘 (아래 참조) |

### `sharing.test.ts` 보강 근거

zod 4는 스키마 **선언 순서대로** issue를 낸다. `category`를 스키마 맨 뒤에 추가하는 계획대로라면 실제 issue 순서는:

```
[["title","상품명을 입력해주세요"],["exchangeOption","Invalid option: ..."],["category","카테고리를 선택해주세요"]]
```

즉 `'빈 상품명을 거부한다'`의 `issues[0]!.message` 단언은 `category`를 안 채워도 여전히 통과한다. **이번 추가는 깨진 걸 고치는 게 아니라 순서 의존성을 없애는 예방 조치**다.

더 실질적인 문제는 아래 두 케이스가 `expect(result.success).toBe(false)`만 단정한다는 점이다 — 실패 사유를 검증하지 않아서 **`category` 누락으로 실패해도 초록불이 뜬다**:

- `'교환/나눔 외 옵션을 거부한다'` (70행)
- `'100자 초과 상품명을 거부한다'` (81행)

`category`를 채우는 김에 사유까지 좁힌다:

```ts
expect(result.success).toBe(false);
if (!result.success) {
  expect(result.error.issues.map((i) => i.path[0])).toEqual(['exchangeOption']);
}
```

(`'100자 초과 상품명'` 케이스는 `toEqual(['title'])`)

**신규 테스트 (회귀 방지 — 이번 버그의 핵심을 잠근다)**:

1. `servCreateSharingPost`가 insert에 `category`를 실제로 넘기는지 단정 (현재 테스트는 insert 페이로드를 전혀 검증하지 않는다)
2. `servFetchSharingPosts(category)`가 `.eq('category', ...)`를 호출하고, 인자 없이 호출하면 `.eq`가 호출되지 않는지
3. `category` 누락 시 `'카테고리를 선택해주세요'`, `category: '전체'` 및 임의 문자열 거부
4. `SHARING_CATEGORY_VALUES` 각 값의 코드포인트에 `0xb7`이 포함되는지 — 가운뎃점 문자 오염을 CI에서 잡는 가드

`.claude/docs/supabase-setup.md` — `sharing_posts` DDL에 `category` 컬럼 + CHECK 제약 + 인덱스 기재. (이 문서는 이미 `like_count`와 `sharing_likes` 테이블이 빠진 상태로 드리프트되어 있다 — 이번엔 category만 반영하고 나머지는 별도 작업으로 남긴다.)

---

## 반드시 지켜야 할 것

**가운뎃점 문자** — `·`는 U+00B7 (MIDDLE DOT). `・`(U+30FB), `•`(U+2022)와 눈으로 구분되지 않는데 다르면 INSERT 시 CHECK 위반이 난다. 이 문서의 코드 블록을 복사해서 쓰고 직접 타이핑하지 않는다.

```bash
node -e "console.log([...'역할놀이·인형'].map(c=>c.codePointAt(0).toString(16)))"
# 'b7'이 포함되어야 정상
```

**값의 단일 출처** — DB CHECK / 앱 상수 / 웹 상수 세 곳이 항상 같아야 한다. 변경 시 세 곳을 한 번에.

---

## 커밋 분할

1. `feat(sharing): 카테고리 타입·상수·서비스·검증 추가` — 1~3장 + 테스트 수정
2. `feat(sharing): 카테고리 선택/필터 UI 추가` — 4~5장 (`CategoryChips` 신설)
3. `feat(sharing): AI 자동 작성에 카테고리 추론 추가` — 6장
4. `docs: sharing_posts category 컬럼 스키마 문서 반영`

---

## 검증

```bash
pnpm type-check && pnpm lint && pnpm test:run
pnpm build
```

수동 E2E (`pnpm dev`):

1. `/sharing/new` — 카테고리 미선택으로 등록 시도 → `'카테고리를 선택해주세요'` 표시, 제출 차단
2. 이미지 업로드 → `AI 자동 작성` → 카테고리 칩이 자동 선택되는지 (그 값이 `기타`가 아닌지)
3. 6종 각각으로 글 작성 → 성공(= CHECK 위반 없음)
4. Supabase SQL Editor:
   ```sql
   SELECT category, count(*) FROM public.sharing_posts GROUP BY category;
   ```
   → `기타` 아닌 값이 저장되면 성공
5. `/sharing` — 칩으로 필터 → 해당 카테고리만 노출, `전체`로 복귀. 네트워크 탭에서 `category=eq.*` 쿼리 파라미터 확인. 검색어 + 카테고리 동시 적용도 확인
6. `/sharing/{id}` — 카테고리 배지 노출
7. 앱(DodamDuck_APP)에서 해당 카테고리 칩 → 웹에서 작성한 글이 보이면 연동 완료

---

## 참고

앱 구현은 DodamDuck_APP `feat/sharing-list` 브랜치의 `sharing.types.ts` / `sharing-services.ts` / `components/sharing/CategoryChips.tsx`, 스키마 문서는 `.claude/docs/supabase-setup.md`.
