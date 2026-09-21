# 사진 → 게시글 자동 생성 (`/api/ai/generate-post`)

교환/나눔 글쓰기 화면에서 업로드한 사진을 OpenRouter의 무료 vision 모델에 보내
제목·설명·태그·카테고리를 만들어 폼에 채워 넣는 기능이다.

| 항목 | 위치 |
|------|------|
| Route Handler (HTTP만) | `src/app/api/ai/generate-post/route.ts` |
| 생성 로직 (프롬프트·분류·폴백) | `src/services/ai/generate-post-core.ts` |
| 모델 체인 (SSOT) | `src/services/ai/model-chain.ts` → `AI_MODEL_CHAIN` |
| 응답 스키마 | `src/libs/validations/ai.ts` |
| 호출 UI | `src/components/sharing/AIGenerateButton.tsx` |
| 단위 테스트 | `src/__tests__/api/generate-post.test.ts` |
| 목록 점검 (키 불필요) | `scripts/check-ai-models.ts` — `pnpm check:ai-models` |
| 자동 교체 | `scripts/propose-model-replacement.ts` — `pnpm propose:ai-models` |
| 카탈로그 조회 공용 | `scripts/lib/openrouter-catalog.ts` |
| 실호출 스모크 (키 필요) | `src/__tests__/smoke/ai-models.smoke.test.ts` — `pnpm smoke:ai-models` |
| 자동 점검 | `.github/workflows/ai-model-chain.yml` (매일 + PR) |
| 거부 목록 | `src/services/ai/model-chain.ts` → `AI_MODEL_DENYLIST` |

### 왜 route와 core를 나눴나

Route Handler는 HTTP만 다룬다 — 인증, 페이로드 검증, 실패 종류별 상태 코드.
모델을 어떻게 두드리는지는 전부 `generate-post-core.ts`에 있다.

스모크 테스트가 **운영과 같은 경로**를 타야 하기 때문이다. 테스트가 자기 구현을
들고 있으면 둘이 갈라지고, 정작 실제 경로가 깨졌을 때 초록불이 뜬다.
`model-chain.ts`를 또 따로 둔 건 스크립트가 체인을 **텍스트로 고쳐 쓰기** 때문이다.
교체 스크립트가 `'모델id'` 문자열을 찾아 바꾸므로, 배열은 한 줄에 하나씩 유지한다.

스크립트는 `tsx`로 돌린다 — `@/` 별칭이 그대로 해석돼서 운영 코드(`probeModel` 등)를
스크립트에서 바로 쓸 수 있다. 후보 검증이 운영과 같은 호출 경로를 타는 이유다.

---

## 왜 이렇게 복잡한가

무료 모델은 **유료 모델과 계약 조건이 다르다.** 세 가지가 한꺼번에 깨진다.

1. **스키마를 강제할 수 없다.** `structured_outputs`(response_format json_schema)는
   유료 변종에만 남아 있다. 그래서 `generateObject`를 못 쓰고, 응답 텍스트에서
   JSON을 직접 긁어낸 뒤 Zod로 검증한다. 모델은 코드펜스·인사말·설명 문장을
   수시로 덧붙이므로 `extractJsonObject`가 그걸 걷어낸다.
2. **공유 풀을 쓴다.** 같은 모델이 전 세계 무료 사용자와 한 풀을 나눠 쓰기 때문에
   상시 429가 난다. 내 계정 한도와 무관하게 실패한다.
3. **예고 없이 내려간다.** 공급자가 무료 제공을 멈추면 모델 페이지는 카탈로그에
   그대로 남은 채 **서빙 endpoint만 0개**가 된다. 눈으로 보면 멀쩡하고,
   호출하면 404가 난다.

그래서 한 모델을 믿지 않고 체인으로 돌리며, 실패를 종류별로 다르게 다룬다.

---

## 실패 분류 (`FAILURE_KIND`)

응답 문자열을 여러 군데서 정규식으로 다시 훑지 않도록, 실패는 한 번 분류해서
`{ kind, detail }`로 들고 다닌다.

| kind | 대표 문구 | 뜻 | 대응 |
|------|----------|-----|------|
| `format` | `스키마 불일치: ...` | 응답은 왔는데 JSON/스키마가 어긋남 | **같은 모델 재시도** |
| `rate-limited` | `is temporarily rate-limited upstream` | 공급자 공유 풀 혼잡 (모델 단위) | 다음 모델 |
| `unavailable` | `No endpoints found for ...` (404)<br>`only available on agentic harnesses` (403) | 그 모델이 더 이상 서비스되지 않음 | 다음 모델, **예산 미소모** |
| `api-error` | 그 외 | 알 수 없는 호출 실패 | 다음 모델 |
| `daily-quota` | `free-models-per-day` | 계정 단위 일일 한도 | **즉시 중단** |
| `invalid-key` | `No auth credentials found` (401) | 키 문제 | **즉시 중단** |

### 호출 예산

무료 티어는 **계정 단위로 하루 50회**(크레딧 $10 충전 시 1000회)다. 체인을 끝까지
도는 것만으로 하루 예산의 12%가 날아가므로 `MAX_TOTAL_ATTEMPTS = 4`로 묶는다.

단, **`unavailable`은 예산을 쓰지 않는다.** 생성이 일어나지 않은 호출이기 때문이고,
더 중요하게는 죽은 모델이 살아있는 폴백의 몫까지 잡아먹으면 안 되기 때문이다.
(→ [실제 장애](#실제-장애-2026-09-20) 참고)

### 사용자에게 나가는 응답

| 조건 | 상태 | 메시지 |
|------|------|--------|
| `invalid-key` 포함 | 503 | API 키가 유효하지 않습니다… |
| `daily-quota` 포함 | 429 | AI 무료 사용량을 모두 소진했습니다… |
| 전부 `unavailable` | 503 | 현재 사용할 수 있는 AI 모델이 없습니다… |
| 전부 모델에 닿지 못함 (`rate-limited`/`unavailable`/`api-error` 혼합) | 429 | AI 서버가 혼잡합니다… 잠시 후 다시 시도 |
| `format`이 섞임 | 500 | AI 게시글 생성에 실패했습니다… |

핵심은 **"모델에 닿았는데 결과가 나빴다"(500)와 "모델에 닿지도 못했다"(429/503)를
가르는 것**이다. 전자는 다시 눌러도 비슷하고, 후자는 다시 누르면 될 수도 있다.

---

## 실제 장애 (2026-09-20)

**증상** — `/api/ai/generate-post`가 계속 500.
`{"error":"AI 게시글 생성에 실패했습니다. 잠시 후 다시 시도해주세요."}`

**확인한 사실** (실호출 결과)

```
google/gemma-4-31b-it:free          429  temporarily rate-limited upstream (공유 풀)
nvidia/nemotron-nano-12b-v2-vl:free 404  No endpoints found  ← endpoints 0개
google/gemma-4-26b-a4b-it:free      200  정상 (약 6초)
```

API 키는 유효했고(`/api/v1/key` → `is_free_tier: true`), 일일 사용량도 0/50이었다.
**코드는 멀쩡했고 모델 목록이 썩었다.**

**왜 500까지 갔나** — 두 가지가 겹쳤다.

1. 404는 `isRateLimitError`에도 `isDailyQuotaError`에도 걸리지 않아
   "형식 오류"와 같은 취급을 받았다. → **같은 죽은 모델을 한 번 더 호출**하고,
   최종 안내는 `every(isRateLimitError)`를 통과하지 못해 일반 실패(500)가 되었다.
2. 그렇게 죽은 모델이 예산 4회 중 2회를 먹어, 마지막 살아있는 모델은
   **한 번밖에 못 돌았다.** 그 한 번이 429거나 형식 오류면 그대로 실패였다.

즉 "AI가 글을 못 썼다"가 아니라 "쓸 수 있는 모델에 도달하지 못했다"인데
메시지는 전자를 말하고 있었다.

**조치**

- 죽은 `nemotron-nano-12b-v2-vl:free`를 체인에서 제거하고
  `inclusionai/ling-3.0-flash-vl:free`로 교체 (실호출로 한국어 품질·카테고리 준수 확인)
- `unavailable`을 별도 분류로 만들어 즉시 다음 모델로 넘기고 예산에서 제외
- `invalid-key`도 즉시 중단 (이전에는 4회를 헛되이 썼다)
- 모델에 닿지 못한 실패는 500이 아니라 429/503으로 안내
- 매일 CI 점검 + 죽으면 검증된 후보로 교체 PR 자동 생성
- 위 경로를 전부 덮는 회귀 테스트 추가

---

## 모델 체인 관리

### 두 겹의 점검

| | `pnpm check:ai-models` | `pnpm smoke:ai-models` |
|---|---|---|
| 보는 것 | 카탈로그 존재 · vision 지원 · endpoint ≥ 1 | 실제 이미지로 호출해 게시글이 나오는가 |
| 잡는 것 | 404 (모델이 내려감) | **403 · 400 · 프롬프트/스키마 깨짐** |
| 키 | 불필요 (공개 API) | `OPENROUTER_API_KEY` 필요 |
| 무료 한도 | 0회 | 모델 수만큼 (형식 오류 시 +1) |
| 도는 때 | 매일 + AI 파일 PR | 매일 |

카탈로그에 살아있어도 호출하면 403(`only available on agentic harnesses`)이나
400을 주는 모델이 있다. **목록만으로는 이걸 못 본다.** 그래서 두 겹이다.

#### 스모크가 429를 실패로 보지 않는 이유

무료 모델의 429는 공유 풀 혼잡이라 **정상 동작**이다. 이걸 실패로 처리하면
매주 거짓 경보가 오고, 그러면 진짜 장애가 왔을 때도 메일을 안 열게 된다.
그래서 "기다리면 풀리는 것"과 "사람이 고쳐야 하는 것"만 가른다.

| 결과 | 판정 | 근거 |
|------|------|------|
| 게시글 생성 성공 | ✅ 통과 | — |
| 429 · 일일 한도 | ⏳ 통과(경고) | 기다리면 풀린다 |
| 403 · 400 · 404 · 키 오류 | ❌ **실패** | 사람이 체인을 고쳐야 한다 |
| 형식 오류 2회 연속 | ❌ **실패** | 프롬프트나 스키마가 깨졌다 (운영도 2회 시도) |
| 전 모델이 429 | ⏳ 통과(경고) | 그 순간 혼잡했을 뿐. 운영도 429로 안내한다 |

실패하면 어느 모델이 왜 깨졌는지와 다음에 할 일이 메시지에 함께 나온다:

```
AssertionError: nvidia/nemotron-nano-12b-v2-vl:free이(가) 영구 장애 상태입니다.
  unavailable: No endpoints found for nvidia/nemotron-nano-12b-v2-vl:free.
  → pnpm check:ai-models 로 대체 후보를 확인하고 src/services/ai/model-chain.ts를 교체하세요.
```

#### 죽으면 교체 PR이 자동으로 열린다

`.github/workflows/ai-model-chain.yml`이 **매일 10:17 KST**에 돈다.

| 상태 | 일어나는 일 |
|------|------------|
| 체인 멀쩡 | 스모크만 돌고 끝. 알림 없음 |
| 모델이 죽음 | 후보를 **실호출로 검증** → 되는 모델로 교체 PR 생성 → 리포 소유자에게 할당 |
| 쓸 후보 없음 | 잡 실패 → 메일. 이때만 직접 손이 필요하다 |

PR 본문에는 빠진 모델·이유·새 모델·**새 모델이 실제로 생성한 제목**이 표로 붙는다.
제목이 한국어로 자연스러운지만 보고 머지하면 된다.

후보 검증을 거치는 이유는 **빨간불 PR이 반복되면 알림이 무뎌지기** 때문이다.
카탈로그에 살아있어도 호출하면 403·400을 주는 모델이 있다. 그런 모델은
`AI_MODEL_DENYLIST`에 적어두면 다시는 후보로 오르지 않는다.

##### 리포 설정 (한 번만)

- **Secrets and variables → Actions**: `OPENROUTER_API_KEY`
- **Actions → General → Workflow permissions**:
  "Read and write" + "Allow GitHub Actions to create and approve pull requests"
- 리포가 **60일간 조용하면** GitHub가 schedule을 자동 비활성화한다
  (별도 메일이 오며 Actions 탭에서 다시 켤 수 있다)

### 교체 절차

보통은 CI가 만든 PR을 머지하면 끝이다. 직접 할 때는:

```bash
pnpm propose:ai-models           # 죽은 모델 + 검증된 대체 후보 확인
pnpm propose:ai-models --write   # model-chain.ts 수정까지
pnpm smoke:ai-models             # 바뀐 체인으로 실제 생성 확인
```

`--write`는 후보를 **실제로 호출해 게시글이 나온 것만** 반영한다.
주석의 실측값(지연·품질)은 손으로 갱신할 것.

> 체인 순서는 **"빠르고 잘하는 모델 먼저, 살아있을 확률 높은 모델 나중"**이다.
> 품질 좋은 모델일수록 공유 풀이 붐벼 429가 잦기 때문이다.

### 2026-09-20 실측

| 모델 | 지연 | 한국어 | 비고 |
|------|------|--------|------|
| `google/gemma-4-31b-it:free` | ~4초 | 최상 | 429가 가장 잦음 |
| `google/gemma-4-26b-a4b-it:free` | ~6초 | 좋음 | 31b가 막혔을 때 대체로 살아있음 |
| `inclusionai/ling-3.0-flash-vl:free` | ~12초 | 좋음 | 느리지만 카테고리를 잘 지킴 |

확인했으나 쓰지 않은 모델:

| 모델 | 이유 |
|------|------|
| `nvidia/nemotron-nano-12b-v2-vl:free` | 404 — endpoint 0개 (무료 제공 종료) |
| `thinkingmachines/inkling-small:free` | 403 — agentic harness 전용 |
| `nex-agi/nex-n2.5-mini:free` | 400 — 요청 형식을 받지 않음 |
| `qwen/qwen3.8-27b:free` | 429 — 관측 시점에 공유 풀 혼잡 (재평가 가치 있음) |

### 유료 전환

`:free` 접미사를 뗀 변종은 공유 풀을 쓰지 않아 429가 거의 없고
`structured_outputs`를 지원한다. 전환한다면 `google/gemma-4-26b-a4b-it`를
체인 맨 앞에 추가하는 것이 가장 비용 대비 효과가 크다.
스키마를 강제할 수 있게 되면 `extractJsonObject`·`coerceGeneratedPost`의
보정 로직 상당 부분이 필요 없어진다.

---

## 장애 시 진단 순서

```bash
# 1. 키와 일일 한도 — is_free_tier / free_model_daily_requests 확인
curl -s -H "Authorization: Bearer $OPENROUTER_API_KEY" \
  https://openrouter.ai/api/v1/key

# 2. 목록 점검 — 모델이 내려갔는가
pnpm check:ai-models

# 3. 실호출 — 목록은 멀쩡한데 호출이 막혔는가
pnpm smoke:ai-models

# 4. 죽은 게 있으면 검증된 대체 후보까지 한 번에
pnpm propose:ai-models
```

5. 서버 로그의 `[AI Generate Post Error]`를 본다. 체인의 **모든** 실패가
   `(kind) detail` 형태로 남으므로 어느 모델이 왜 떨어졌는지 한눈에 보인다.
   마지막 실패만 보면 앞선 모델의 진짜 원인이 가려진다.
