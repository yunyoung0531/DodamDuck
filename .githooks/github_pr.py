#!/usr/bin/env python3
"""GitHub 자동 draft PR 생성 워커.

pre-push 훅이 백그라운드로 호출한다. push된 브랜치가 remote에 반영되기를
기다린 뒤, 열린 PR이 없으면 diff를 근거로 본문을 만들어 GitHub에 PR을 만든다.
본문은 `claude` CLI로 생성하고, 실패하면 커밋 이력 기반 템플릿으로 폴백한다.

⚠️ 모델 호출을 `claude` CLI로 하는 것이 요점이다. GitHub Actions에서
`ANTHROPIC_API_KEY`로 부르면 토큰당 과금되지만, CLI는 구독으로 커버된다.

사용법: github_pr.py <branch> <local_sha> <remote_url>
"""

import json
import os
import re
import subprocess
import sys
import time
import urllib.error
import urllib.parse
import urllib.request

# push된 diff가 너무 크면 claude 프롬프트를 잘라낸다.
MAX_DIFF_CHARS = 30000
# remote 브랜치 반영 대기 (초): 0.5s 간격으로 폴링
BRANCH_WAIT_TIMEOUT = 40
# 일반 git 호출 타임아웃 (초)
GIT_TIMEOUT = 30
# 네트워크를 타는 git 호출(fetch) 타임아웃 (초)
GIT_NETWORK_TIMEOUT = 60
# claude CLI 타임아웃 (초)
CLAUDE_TIMEOUT = 300


def log(msg):
  print(f"[github-pr] {msg}", flush=True)


def run_git(args, cwd, timeout=GIT_TIMEOUT):
  """git 명령을 실행해 stdout을 돌려준다. 실패/타임아웃이면 빈 문자열.

  네트워크를 타는 git 호출(fetch 등)이 자격증명 프롬프트나 응답 없는 remote에
  걸려 워커 전체가 멈추는 일을 막으려고 항상 timeout을 건다. 또한 대화형
  프롬프트를 원천 차단해 백그라운드에서 조용히 실패하도록 한다.
  """
  env = dict(os.environ)
  env["GIT_TERMINAL_PROMPT"] = "0"
  env.setdefault("GIT_ASKPASS", "true")
  try:
    out = subprocess.run(
      ["git"] + args,
      cwd=cwd,
      capture_output=True,
      text=True,
      check=True,
      timeout=timeout,
      env=env,
    )
    return out.stdout
  except subprocess.TimeoutExpired:
    log(f"git {' '.join(args)} 타임아웃({timeout}s), 건너뜀")
    return ""
  except subprocess.CalledProcessError:
    return ""


def parse_remote(remote_url):
  """remote URL에서 owner/repo를 뽑는다.

  예) https://github.com/yunyoung0531/DodamDuck_FE.git -> "yunyoung0531/DodamDuck_FE"
      git@github.com:yunyoung0531/DodamDuck_FE.git      -> 같음
  """
  url = remote_url.strip()
  m = re.match(
    r"^(?:https?://)?(?:[^@/]+@)?([^/:]+(?::\d+)?)[:/](.+?)(?:\.git)?/?$", url
  )
  if not m:
    raise ValueError(f"remote URL 파싱 실패: {remote_url}")
  host = m.group(1)
  repo_path = m.group(2)
  if "github.com" not in host:
    raise ValueError(f"GitHub remote가 아니다: {host}")
  return repo_path


def load_token(repo_root):
  """토큰을 환경변수 → 파일 → `gh auth token` 순으로 찾는다.

  `gh auth login`을 이미 했다면 별도 토큰 발급 없이 그대로 쓴다.
  """
  token = os.environ.get("GITHUB_TOKEN", "").strip()
  if token:
    return token

  token_file = os.path.join(repo_root, ".git", "github-pr.token")
  if os.path.exists(token_file):
    with open(token_file, encoding="utf-8") as f:
      token = f.read().strip()
      if token:
        return token

  try:
    out = subprocess.run(
      ["gh", "auth", "token"], capture_output=True, text=True, timeout=15
    )
    if out.returncode == 0:
      return out.stdout.strip()
  except (subprocess.TimeoutExpired, FileNotFoundError):
    pass
  return ""


def api_request(path, token, method="GET", payload=None):
  """GitHub API 호출. (status_code, parsed_json) 반환."""
  url = f"https://api.github.com{path}"
  data = json.dumps(payload).encode("utf-8") if payload is not None else None
  req = urllib.request.Request(url, data=data, method=method)
  req.add_header("Authorization", f"Bearer {token}")
  req.add_header("Accept", "application/vnd.github+json")
  req.add_header("X-GitHub-Api-Version", "2022-11-28")
  req.add_header("Content-Type", "application/json")
  try:
    with urllib.request.urlopen(req, timeout=15) as resp:
      body = resp.read().decode("utf-8")
      return resp.status, (json.loads(body) if body else None)
  except urllib.error.HTTPError as e:
    body = e.read().decode("utf-8", "replace")
    try:
      return e.code, json.loads(body)
    except json.JSONDecodeError:
      return e.code, {"raw": body}
  except urllib.error.URLError as e:
    log(f"API 연결 실패: {e}")
    return 0, None


def wait_for_remote_branch(repo, token, branch, local_sha):
  """remote에 브랜치(해당 커밋)가 반영될 때까지 폴링한다."""
  deadline = time.monotonic() + BRANCH_WAIT_TIMEOUT
  path = f"/repos/{repo}/branches/{urllib.parse.quote(branch)}"
  while time.monotonic() < deadline:
    status, body = api_request(path, token)
    if status == 200 and body:
      sha = (body.get("commit") or {}).get("sha", "")
      if sha.startswith(local_sha[:12]) or local_sha.startswith(sha[:12]):
        return True
    time.sleep(0.5)
  # 커밋 일치까지는 못 봐도 브랜치가 있으면 진행
  status, _ = api_request(path, token)
  return status == 200


def existing_open_pr(repo, token, branch):
  """해당 브랜치를 head로 하는 열린 PR이 있으면 그 객체를 반환."""
  owner = repo.split("/")[0]
  status, body = api_request(
    f"/repos/{repo}/pulls?state=open&head={owner}:{urllib.parse.quote(branch)}", token
  )
  if status == 200 and isinstance(body, list) and body:
    return body[0]
  return None


def default_base_branch(repo, token):
  status, body = api_request(f"/repos/{repo}", token)
  if status == 200 and body:
    return body.get("default_branch") or "main"
  return "main"


def resolve_base_ref(repo_root, target):
  """diff 기준이 될 ref를 정한다. origin/<target>이 없으면 로컬 <target>으로 폴백."""
  for ref in (f"origin/{target}", target):
    if run_git(
      ["rev-parse", "--verify", "--quiet", f"{ref}^{{commit}}"], repo_root
    ).strip():
      return ref
  return ""


# 변경 경로에서 도메인 scope를 뽑는다. 이 레포의 디렉터리 구조에 맞춘 순서다.
SCOPE_PATTERNS = [
  r"^src/services/([^/]+)/",
  r"^src/components/([^/]+)/",
  r"^src/app/api/([^/]+)/",
  r"^src/app/\(?([^/)]+)\)?/",
  r"^src/libs/([^/]+)/",
]
# 도메인이 아닌 디렉터리는 scope로 쓰지 않는다.
NOT_SCOPES = {
  "ui",
  "common",
  "app",
  "api",
  "libs",
  "lib",
  "types",
  "stores",
  "providers",
  "hooks",
  "constants",
  "validations",
  "supabase",
  "query",
  "__tests__",
}


def infer_scope(changed_files):
  """변경 파일에서 커밋 컨벤션 scope를 추론한다. 애매하면 빈 문자열.

  한 도메인 작업이라도 공용 컴포넌트나 테스트를 함께 건드리는 일이 흔하다.
  그때마다 scope를 비우면 쓸모가 없으므로, 가장 많은 scope가 과반이면 채택한다.
  진짜로 여러 도메인에 걸친 변경만 scope를 생략한다 (커밋 컨벤션 규칙).
  """
  counts = {}
  for path in changed_files:
    if path.startswith((".github/", ".githooks/", ".claude/")) or "/" not in path:
      candidate = "config"
    else:
      candidate = ""
      for pattern in SCOPE_PATTERNS:
        m = re.match(pattern, path)
        if m and m.group(1) not in NOT_SCOPES:
          candidate = m.group(1)
          break
    if candidate:
      counts[candidate] = counts.get(candidate, 0) + 1

  if not counts:
    return ""
  top, hits = max(counts.items(), key=lambda kv: kv[1])
  return top if hits * 2 >= sum(counts.values()) else ""


def collect_context(repo_root, base, branch):
  """PR 근거가 될 커밋 로그, 변경 파일, 변경 통계, diff를 모은다."""
  rng = f"{base}..{branch}"
  commit_log = run_git(["log", "--pretty=format:%s%n%b", rng], repo_root).strip()
  changed = run_git(["diff", "--name-only", f"{base}...{branch}"], repo_root)
  changed_files = [f for f in changed.splitlines() if f.strip()]
  stat = run_git(["diff", "--stat", f"{base}...{branch}"], repo_root).strip()

  diff = run_git(["diff", f"{base}...{branch}"], repo_root)
  if len(diff) > MAX_DIFF_CHARS:
    diff = diff[:MAX_DIFF_CHARS] + "\n...(생략)..."

  return commit_log, changed_files, stat, diff


def strip_conventional_prefix(subject):
  """커밋 제목에서 type과 메시지를 분리한다."""
  m = re.match(r"^(\w+)(?:\([^)]*\))?:\s*(.+)$", subject)
  if m:
    return m.group(1), m.group(2)
  return "feat", subject


def build_title(commit_log, scope):
  first = commit_log.splitlines()[0] if commit_log else "변경사항"
  tag, message = strip_conventional_prefix(first)
  return f"{tag}({scope}): {message}" if scope else f"{tag}: {message}"


def generate_with_claude(repo_root, commit_log, changed_files, stat, scope, diff):
  """claude CLI로 규칙에 맞는 제목/본문을 생성한다. 실패하면 None."""
  prompt = f"""당신은 이 저장소 변경사항으로 GitHub Pull Request 초안을 작성한다.
아래 커밋 로그와 diff를 보고 PR 제목과 본문을 만들어라.

[제목 규칙]
- `{{type}}({{scope}}): {{한글 메시지}}` 형식, 70자 이내
- type: feat / fix / refactor / chore / perf / docs / test
- scope 후보: {scope or "(없으면 scope 생략)"}

[본문 규칙]
`## 작업 내용`, `## 변경 파일`, `## 테스트 계획` 세 섹션을 순서대로 포함한다.
- 작업 내용: 무엇을 왜 바꿨는지. diff에서 보이는 사실만 쓰고 추측하지 않는다.
- 변경 파일: `` `경로` — 설명 `` 형태의 목록
- 테스트 계획: `- [ ]` 체크박스. 실제로 확인해야 할 항목만 쓴다.
  Next.js 웹 앱이므로 브라우저에서 확인해야 할 화면이 있으면 포함한다.

[작성 지침]
- 한글로 작성한다. 가운뎃점(·)은 쓰지 않는다.
- 구성원이 내용을 파악하는 데 불편함이 없도록 명료하게 필요한 내용만 담는다.
  불필요할 정도로 자세하게 쓰지 않는다.
- 문장이 완료되지 않았는데 불필요하게 줄바꿈하지 않는다.

[출력 형식]
아래 JSON 객체 하나만 출력한다. 다른 텍스트, 코드펜스 금지.
{{"title": "제목", "body": "본문 마크다운"}}

[커밋 로그]
{commit_log}

[변경 통계]
{stat}

[diff]
{diff}
"""
  try:
    result = subprocess.run(
      ["claude", "-p", prompt, "--output-format", "text"],
      cwd=repo_root,
      capture_output=True,
      text=True,
      timeout=CLAUDE_TIMEOUT,
    )
  except (subprocess.TimeoutExpired, FileNotFoundError) as e:
    log(f"claude 호출 실패: {e}")
    return None
  if result.returncode != 0:
    log(f"claude 비정상 종료: {result.stderr.strip()[:200]}")
    return None

  out = result.stdout.strip()
  m = re.search(r"\{.*\}", out, re.DOTALL)
  if not m:
    log("claude 출력에서 JSON을 찾지 못함")
    return None
  try:
    data = json.loads(m.group(0))
    title = data.get("title", "").strip()
    body = data.get("body", "").strip()
    if title and body:
      return title, body
  except json.JSONDecodeError:
    log("claude JSON 파싱 실패")
  return None


def fallback_body(commit_log, changed_files):
  """claude 실패 시 커밋 이력 기반 템플릿 본문."""
  commits = "\n".join(f"- {line}" for line in commit_log.splitlines() if line.strip())
  files = "\n".join(f"- `{f}`" for f in changed_files[:40])
  return f"""## 작업 내용

{commits or "- 변경사항"}

## 변경 파일

{files}

## 테스트 계획

- [ ] `pnpm type-check` / `pnpm lint` / `pnpm test:run` 통과
- [ ] 변경된 화면 동작 확인

> 본문 자동 생성에 실패해 커밋 이력으로 대체했습니다. 직접 보완해주세요.
> 실패 원인은 `.git/github-pr.log`에서 확인할 수 있습니다.
"""


def main():
  if len(sys.argv) < 4:
    log("인자 부족: <branch> <local_sha> <remote_url>")
    return 1
  branch, local_sha, remote_url = sys.argv[1], sys.argv[2], sys.argv[3]

  repo_root = run_git(["rev-parse", "--show-toplevel"], os.getcwd()).strip()
  if not repo_root:
    repo_root = os.getcwd()

  try:
    repo = parse_remote(remote_url)
  except ValueError as e:
    log(str(e))
    return 1

  token = load_token(repo_root)
  if not token:
    log(
      "토큰 없음: `gh auth login`을 실행하거나 "
      "GITHUB_TOKEN 환경변수 또는 .git/github-pr.token 파일을 설정하세요."
    )
    return 1

  target = os.environ.get("GITHUB_BASE_BRANCH") or default_base_branch(repo, token)
  if branch == target:
    log(f"기본 브랜치({target}) push는 PR을 만들지 않음")
    return 0

  log(f"{branch} -> {target} PR 생성 검토 시작")

  if not wait_for_remote_branch(repo, token, branch, local_sha):
    log(f"remote 브랜치 {branch} 반영 확인 실패, 중단")
    return 1

  pr = existing_open_pr(repo, token, branch)
  if pr:
    log(f"이미 열린 PR 존재: {pr.get('html_url')}")
    return 0

  # 최신 origin 상태로 diff 계산. fetch가 막혀도 기존 ref로 계속 진행한다.
  run_git(["fetch", "origin", target], repo_root, timeout=GIT_NETWORK_TIMEOUT)
  base = resolve_base_ref(repo_root, target)
  if not base:
    log(f"diff 기준 ref를 찾지 못함(origin/{target}, {target} 모두 없음), 중단")
    return 1

  commit_log, changed_files, stat, diff = collect_context(repo_root, base, branch)
  if not changed_files:
    log("변경 파일 없음, PR 생성 생략")
    return 0

  scope = infer_scope(changed_files)
  generated = generate_with_claude(
    repo_root, commit_log, changed_files, stat, scope, diff
  )
  if generated:
    title, body = generated
    log("claude로 본문 생성 완료")
  else:
    title = build_title(commit_log, scope)
    body = fallback_body(commit_log, changed_files)
    log("폴백 템플릿으로 본문 생성")

  payload = {
    "title": title,
    "body": body,
    "head": branch,
    "base": target,
    "draft": True,
  }
  status, resp = api_request(f"/repos/{repo}/pulls", token, method="POST", payload=payload)
  if status in (200, 201) and resp:
    log(f"PR 생성 완료: {resp.get('html_url')}")
    return 0

  # 이미 존재하면 성공 취급 (동시 push 등)
  if status == 422 and existing_open_pr(repo, token, branch):
    log("PR이 이미 존재함")
    return 0
  log(f"PR 생성 실패 (status={status}): {resp}")
  return 1


if __name__ == "__main__":
  sys.exit(main())
