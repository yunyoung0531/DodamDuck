/**
 * OpenRouter 카탈로그 조회 — 점검 스크립트와 교체 스크립트가 함께 쓴다.
 *
 * 인증이 필요 없는 공개 API라 CI에서 시크릿 없이 돌고,
 * 추론을 하지 않으므로 무료 일일 한도도 쓰지 않는다.
 */
import { AI_MODEL_DENYLIST } from '@/services/ai/model-chain';

const MODELS_URL = 'https://openrouter.ai/api/v1/models';

export interface CatalogModel {
  id: string;
  architecture?: { input_modalities?: string[] };
}

export type Verdict =
  | { ok: true; endpoints: number }
  | { ok: false; reason: string };

async function fetchJson(url: string): Promise<unknown> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText} — ${url}`);
  }
  return response.json();
}

export async function fetchCatalog(): Promise<CatalogModel[]> {
  const payload = (await fetchJson(MODELS_URL)) as { data: CatalogModel[] };
  return payload.data;
}

export function acceptsImage(model: CatalogModel): boolean {
  return model.architecture?.input_modalities?.includes('image') ?? false;
}

export async function countEndpoints(id: string): Promise<number> {
  const payload = (await fetchJson(`${MODELS_URL}/${id}/endpoints`)) as {
    data?: { endpoints?: unknown[] };
  };
  return payload.data?.endpoints?.length ?? 0;
}

/** 체인에 든 모델 하나가 아직 쓸 수 있는 상태인지. */
export async function verifyModel(
  id: string,
  catalog: Map<string, CatalogModel>
): Promise<Verdict> {
  const model = catalog.get(id);

  if (!model) return { ok: false, reason: '카탈로그에 없음 (모델이 제거됨)' };
  if (!acceptsImage(model)) {
    return { ok: false, reason: '이미지 입력을 받지 않음 (vision 아님)' };
  }

  const endpoints = await countEndpoints(id);
  if (endpoints === 0) {
    return {
      ok: false,
      reason: '서빙 endpoint 0개 — 호출 시 404 No endpoints found',
    };
  }

  return { ok: true, endpoints };
}

/**
 * 교체 후보 — 무료 vision 모델 중 현재 체인에도, 거부 목록에도 없는 것.
 * endpoint까지 확인하므로 "카탈로그에만 있는" 모델은 걸러진다.
 */
export async function findCandidates(
  catalog: CatalogModel[],
  currentChain: readonly string[]
): Promise<string[]> {
  const pool = catalog
    .filter((model) => model.id.endsWith(':free') && acceptsImage(model))
    .filter((model) => !currentChain.includes(model.id))
    .filter((model) => !(model.id in AI_MODEL_DENYLIST))
    .map((model) => model.id)
    .sort();

  const alive = await Promise.all(
    pool.map(async (id) => ((await countEndpoints(id)) > 0 ? id : null))
  );

  return alive.filter((id): id is string => id !== null);
}
