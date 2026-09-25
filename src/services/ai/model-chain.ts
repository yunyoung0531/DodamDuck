/**
 * 순서대로 시도하는 모델 체인. Route Handler·점검 스크립트의 단일 출처.
 *
 * 순서는 실측 기준이다 (2026-09-20):
 *   - gemma-4-31b       한국어 품질·속도(약 4초) 모두 최고. 다만 공유 풀 429가 잦다.
 *   - gemma-4-26b-a4b   약 6초. 31b가 429일 때 살아있는 경우가 많다.
 *   - ling-3.0-flash-vl 약 12초로 느리지만 한국어가 자연스럽고 카테고리를 잘 지킨다.
 * 품질 좋은 모델일수록 공유 풀이 붐벼 429가 잦으므로
 * "빠르고 잘하는 모델 먼저, 살아있을 확률 높은 모델 나중" 순서다.
 * 유료 전환 시에는 'google/gemma-4-26b-a4b-it'를 맨 앞에 추가하면 된다.
 *
 * ⚠️ 이 목록은 썩는다. 무료 변종은 공급자가 예고 없이 내려서
 * 404(No endpoints found)나 403(agentic harnesses 전용)으로 바뀐다.
 * 실제로 `nvidia/nemotron-nano-12b-v2-vl:free`가 이렇게 죽어 500을 유발했다.
 * 매일 CI가 확인하고 깨지면 교체 PR을 올린다 (.github/workflows/ai-model-chain.yml).
 *
 * ⚠️ 배열 형태를 그대로 유지할 것. 교체 스크립트가 이 파일의 문자열을
 * 찾아 바꾸므로, 모델 id는 한 줄에 하나씩 따옴표로 적는다.
 */
export const AI_MODEL_CHAIN = [
  'google/gemma-4-31b-it:free',
  'google/gemma-4-26b-a4b-it:free',
  'dots-studio/dots-3-note-preview:free',
] as const;

/**
 * 자동 교체 후보에서 제외할 모델.
 *
 * 카탈로그에는 살아있고 endpoint도 있는데 **실제로 호출하면 막히는** 것들이다.
 * 목록 점검으로는 절대 안 걸러지므로 겪은 것을 여기 적어 다시 제안되지 않게 한다.
 * 교체 PR이 빨간불이면 그 모델을 여기 추가할 것.
 */
export const AI_MODEL_DENYLIST: Record<string, string> = {
  'thinkingmachines/inkling-small:free': '403 — agentic harness 전용 (2026-09-20)',
  'thinkingmachines/inkling:free': '403 — agentic harness 전용 (추정, small과 동일 계열)',
  'nex-agi/nex-n2.5-mini:free': '400 — 이미지 요청 형식을 받지 않음 (2026-09-20)',
  'nvidia/nemotron-3.5-content-safety:free': '안전성 분류 전용 모델 — 글쓰기 용도 아님',
};
