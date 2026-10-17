# 도담덕 DodamDuck

<img src="https://github.com/yunyoung0531/DodamDuck_FE/assets/68066598/0655a0e0-25c9-4087-84a9-8545c77e9d5d" alt="도담덕 로고" width="100" height="100"/>

유아용품 교환 & 나눔 플랫폼

**도담덕** = 도담도담(아이가 탈 없이 잘 자라는 모양) + Duck(오리)

짧게 쓰이고 버려지는 장난감을 다른 부모와 교환하고 나누어 플라스틱 폐기물을 줄이기 위한 서비스

## 주요 기능

- **교환/나눔 게시판**: 쓰지 않는 장난감 교환과 무료 나눔, 사진 한 장으로 AI 게시글 초안 작성
- **장난감 도서관**: 서울 성북구도시관리공단 장난감도서관 대여 목록 ([공공데이터포털](https://www.data.go.kr/data/15044146/fileData.do))
- **자유게시판**: 육아 정보를 나누는 커뮤니티
- **1:1 채팅**: 교환/나눔 상대와 실시간 대화
- **내 상점**: 내 게시글, 프로필, 레벨과 인증 횟수

## 기술 스택

| 영역       | 기술                                                                              |
| ---------- | --------------------------------------------------------------------------------- |
| 프레임워크 | Next.js (App Router), React 19, TypeScript                                        |
| 서버 상태  | TanStack Query v5                                                                 |
| 폼         | React Hook Form + Zod                                                             |
| UI         | shadcn/ui (Base UI), Tailwind CSS v4, lucide-react                                |
| 백엔드     | Supabase (Auth, Postgres, Storage, Realtime)                                      |
| 테스트     | Vitest, React Testing Library, MSW                                                |
| 외부 API   | OpenRouter (AI 게시글 초안), 공공데이터포털 (장난감 도서관), 카카오맵 (동네 인증) |

## 연혁

- **2023.09 ~ 2023.12**: 교내 캡스톤 디자인 과목에서 React(CRA), Context API, PHP 백엔드로 1차 개발 ([시연 영상](https://youtu.be/TNb7-WiAxxI?si=5_l3ZsKeJe_xxM6i))
- **2026.06 ~**: Next.js와 Supabase로 전면 리팩토링
