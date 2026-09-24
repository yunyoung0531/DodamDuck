# git 훅

이 레포의 git 훅 두 가지를 설명한다. 훅 경로는 clone마다 직접 지정해야 한다.

```bash
git config core.hooksPath .githooks
```

| 훅 | 시점 | 하는 일 |
| --- | --- | --- |
| `commit-msg` | 커밋할 때 | 커밋 메시지가 규약에 맞는지 검사하고, 어긋나면 커밋을 막는다 |
| `pre-push` | push할 때 | 열린 PR이 없으면 draft PR을 만든다. push는 막지 않는다 |

---

## commit-msg — 커밋 메시지 검사

Conventional Commits 형식과 한국어 표기 규약을 검사한다. `python3`만 있으면 되고 설치할 의존성은 없다.

막는 것은 다음 여섯 가지다.

| 검사 | 예 |
| --- | --- |
| `<type>: <설명>` 형식 | `wip: 작업중`은 거부 |
| scope 괄호 금지 | `feat(chat): 추가`는 거부. `feat: 추가`는 통과 |
| 정해진 type | 목록은 `commit-msg`의 `TYPES`에 있다 |
| 제목 50자 이내 | 52자면 거부 |
| 제목은 명사형 종결 | `추가한다`, `했어요`는 거부. `추가`, `방지`는 통과 |
| 영문과 코드 뒤 조사 붙여 쓰기 | `` `pnpm lint` 를 ``는 거부. `` `pnpm lint`를 ``는 통과 |

본문이 72자를 넘으면 경고만 하고 커밋은 진행한다. URL이 든 줄은 세지 않는다.

`Merge`, `Revert "`, `fixup!`, `squash!`로 시작하는 자동 생성 메시지는 검사하지 않는다.

급할 때는 `git commit --no-verify`로 건너뛴다. 이 훅은 최종 게이트가 아니라 오타를 막는 장치다.

규약 본문과 예시는 `.claude/rules/git-workflow.md`에 있다. 그 디렉토리는 gitignore이므로 다른 기기에서 clone하면 따라오지 않는다. 검사되는 값은 훅 소스가 단일 출처이고, 이 문서와 규약 문서는 그것을 설명한다.

---

## pre-push — 자동 PR 생성 (GitHub)

작업 브랜치를 push하면 열린 PR이 없을 때 **draft PR을 자동 생성**한다. 본문은 커밋 이력과 diff를 근거로 `claude` CLI가 작성하고, 실패하면 커밋 이력 기반 템플릿으로 폴백한다.

### 왜 GitHub Actions가 아니라 git 훅인가

원래 `.github/workflows/auto-pr.yml`로 같은 일을 했으나 두 가지 문제가 있었다.

1. **동작하지 않았다.** `anthropics/claude-code-action`은 `push` 이벤트를 지원하지 않는다(`Unsupported event type: push`). 프롬프트를 읽기도 전에 종료되어, 모든 PR이 폴백 템플릿으로 만들어지고 있었다.
2. **비용.** Actions에서 모델을 부르려면 `ANTHROPIC_API_KEY`가 필요하고 이는 **토큰당 과금**된다. 훅은 로컬에서 `claude` CLI를 쓰므로 구독으로 커버된다.

### 구성

- `pre-push`: push되는 브랜치마다 워커를 백그라운드로 실행한다. **push 자체는 막지 않는다.**
- `github_pr.py`: remote 브랜치 반영을 기다린 뒤, 열린 PR이 없으면 diff를 근거로 본문을 만들어 GitHub API(`/repos/{owner}/{repo}/pulls`)로 draft PR을 생성한다.

### 최초 1회 설정 (clone한 각자 필요)

GitHub 인증은 아래 중 하나면 된다. **`gh auth login`을 이미 했다면 추가 설정이 없다.**

```bash
# 방법 1: gh CLI (권장 — 별도 토큰 발급 불필요)
gh auth login

# 방법 2: 저장소 로컬 파일 (커밋되지 않는다)
echo "여기에_토큰" > .git/github-pr.token

# 방법 3: 환경변수
export GITHUB_TOKEN=여기에_토큰
```

방법 2와 3의 토큰은 `repo` 스코프(또는 fine-grained의 Pull requests: write)가 필요하다.

### 동작 조건

- 대상 브랜치가 **기본 브랜치(main)가 아닐 때만** 생성한다.
- 이미 **열린 PR이 있으면 아무것도 하지 않는다.** 브랜치당 최초 push에서만 동작한다.
- 생성되는 PR은 항상 **draft**다.

### 끄기

```bash
git config --unset core.hooksPath
```

### 문제 확인

워커는 백그라운드라 push 출력에 아무것도 남기지 않는다. 로그는 여기 쌓인다.

```bash
tail -f .git/github-pr.log
```

자주 나오는 메시지:

| 로그 | 뜻 |
|---|---|
| `토큰 없음` | 위 인증 3가지 중 아무것도 설정되지 않음 |
| `이미 열린 PR 존재` | 정상. 브랜치당 한 번만 만든다 |
| `기본 브랜치(main) push는 PR을 만들지 않음` | 정상 |
| `remote 브랜치 반영 확인 실패` | push가 실패했거나 40초 안에 반영되지 않음 |
| `폴백 템플릿으로 본문 생성` | `claude` CLI 호출 실패. PR은 만들어졌으니 본문만 보완하면 된다 |
