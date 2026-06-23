# Code Review Instructions

## 심각도 분류

| 심각도 | 기준 |
|--------|------|
| **CRITICAL** | 보안 취약점, 데이터 유실 가능, 프로덕션 장애 → 반드시 지적 |
| **HIGH** | 버그, 성능 심각 저하, 아키텍처 위반 → 반드시 지적 |
| **MEDIUM** | 코드 품질, 유지보수성 저하 → 지적 |
| **LOW** | 개선 제안, 스타일 → 선택적 |

## 리뷰 시 반드시 확인할 항목

### 보안

- 보호된 페이지/API에 NextAuth `auth()` 또는 `useSession()` 호출 여부
- `dangerouslySetInnerHTML` 사용 여부
- 환경변수 `NEXT_PUBLIC_` 접두사로 민감 정보 노출 여부
- API 키/시크릿 하드코딩 여부
- Zod 스키마로 사용자 입력 검증 여부

### 타입 안전성

- `any` 타입 사용 금지 (`unknown` + 타입 가드 사용)
- `@ts-ignore` 사용 금지 (`@ts-expect-error`도 최소화)

### 아키텍처 패턴

- 컴포넌트 내부에서 직접 API 호출 금지 → services 레이어를 통할 것
- 서버 데이터(API 응답)를 Zustand에 저장 금지 → TanStack Query 캐시 사용
- Services 4파일 패턴 준수: `types`, `services`, `queries`, `hook`
- Zustand selector 사용 (전체 스토어 구독 금지)

### 코드 품질

- 함수 50줄 이내
- 파일 600줄 이내
- Props 8개 이내
- `console.log` 커밋 금지
- 미사용 import/변수 없음
- 코드 중복 3회 미만

### UI

- Mantine 컴포넌트 우선 사용 (HTML 대신)
- Tailwind className 사용 (인라인 스타일 `style={{}}` 금지)
- `next/image` 사용

## 리뷰하지 않을 항목

- 생성된 파일 (`node_modules/`, `.next/`, `pnpm-lock.yaml`)
- CI/린터가 이미 잡는 포맷팅 이슈
- 변경되지 않은 기존 코드의 문제 (pre-existing issue)

## Nit 제한

리뷰당 LOW 심각도 코멘트는 최대 5개까지만 남길 것.
