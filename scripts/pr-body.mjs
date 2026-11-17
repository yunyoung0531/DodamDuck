import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';

export const DEFAULT_BASE = 'main';
export const REMOTE = 'origin';
export const BODY_PATH = '.pr-body.md';
export const TITLE_PLACEHOLDER =
  '<제목을 적는다. 커밋 제목처럼 명사형으로 끝낸다>';
/** 이 문자열들이 본문에 그대로 남아 있으면 그 절을 아직 아무도 채우지 않은 것입니다. */
export const WHY_PLACEHOLDER = `<!--
이 변경이 왜 필요한지 적는다. 무엇이 불편했거나 없었는지를 한두 문장으로 쓴다.
-->`;
export const DETAIL_PLACEHOLDER = `<!--
커밋에서 만들 수 없는 부분이다. 아래를 채운다.
- 어떻게 고쳤는지
- 판단이 갈린 지점과 고른 이유
- 근거가 되는 실행 결과
-->`;

/** 읽는 사람이 핵심부터 보도록 이 순서로 묶습니다. */
const TYPE_LABELS = [
  ['feat', '기능'],
  ['fix', '수정'],
  ['refactor', '리팩터'],
  ['perf', '성능'],
  ['revert', '되돌림'],
  ['test', '테스트'],
  ['ci', 'CI'],
  ['build', '빌드'],
  ['docs', '문서'],
  ['chore', '설정'],
  ['style', '포맷'],
];
/** 기본 1MB로는 diff 전체를 받다가 ENOBUFS로 끝납니다. */
const GIT_MAX_BUFFER = 64 * 1024 * 1024;

export function git(args) {
  return execFileSync('git', args, {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'ignore'],
    maxBuffer: GIT_MAX_BUFFER,
  }).trim();
}

/** 원격의 대상 브랜치를 먼저 보고, 없으면 로컬을 봅니다. 찾지 못하면 null */
function findBase(baseBranch) {
  for (const ref of [`${REMOTE}/${baseBranch}`, baseBranch]) {
    try {
      return git(['merge-base', 'HEAD', ref]);
    } catch {
      continue;
    }
  }
  return null;
}

function labelSubject(subject) {
  const match = subject.match(/^([a-z]+)!?:\s*(.+)$/);
  const index = match
    ? TYPE_LABELS.findIndex(([type]) => type === match[1])
    : -1;
  if (index === -1)
    return { order: TYPE_LABELS.length, label: '그 밖', text: subject };
  return { order: index, label: TYPE_LABELS[index][1], text: match[2] };
}

function taskGroups(subjects) {
  const groups = new Map();
  for (const item of subjects
    .map(labelSubject)
    .sort((a, b) => a.order - b.order)) {
    if (!groups.has(item.label)) groups.set(item.label, []);
    groups.get(item.label).push(item.text);
  }
  return [...groups]
    .map(
      ([label, texts]) =>
        `**${label}**\n\n${texts.map((text) => `- [x] ${text}`).join('\n')}`
    )
    .join('\n\n');
}

/** 본문 끝에 붙는 표시. 다른 브랜치에서 만든 본문을 올리지 않으려고 브랜치 이름을 적어 둡니다. */
const branchMarker = (branch) => `<!-- pr-body: ${branch} -->`;

/**
 * 대상 브랜치 이후의 커밋으로 만든 PR 골격.
 *
 * @param baseBranch PR을 합칠 브랜치
 * @returns 만들 수 없으면 사유를 담은 `{ reason }`
 */
export function buildPr(baseBranch = DEFAULT_BASE) {
  const base = findBase(baseBranch);
  if (!base) return { reason: `${baseBranch}를 찾을 수 없다` };

  const branch = git(['rev-parse', '--abbrev-ref', 'HEAD']);
  if (branch === baseBranch)
    return { reason: `${baseBranch}에서는 PR을 만들지 않는다` };

  const subjects = git([
    'log',
    '--reverse',
    '--no-merges',
    '--format=%s',
    `${base}..HEAD`,
  ])
    .split('\n')
    .filter(Boolean);
  if (subjects.length === 0)
    return { reason: `${baseBranch} 이후 커밋이 없다` };

  const diff = git(['diff', `${base}..HEAD`]);
  const body = `# ${TITLE_PLACEHOLDER}

## 📝 작업 내용

${taskGroups(subjects)}

## ❔ 왜?

${WHY_PLACEHOLDER}

## 📋 자세한 설명

${DETAIL_PLACEHOLDER}

## ✔️ 확인

- [x] \`pnpm type-check\`와 \`pnpm test:run\` 통과 (pre-push)
- [ ] \`/code-review\` 셀프 리뷰
- [ ] 화면이 바뀌었으면 브라우저에서 직접 확인
- [ ] 요청과 무관한 변경이 섞이지 않았는지 확인

${branchMarker(branch)}
`;

  return {
    title: subjects.length === 1 ? subjects[0] : null,
    body,
    branch,
    subjects,
    diff,
  };
}

/** 치환 문자열의 `$`가 특수 패턴으로 읽히지 않도록 함수로 넘깁니다. */
export function fillPlaceholder(body, placeholder, text) {
  return body.replace(placeholder, () => text);
}

/** 본문 첫 줄의 H1이 제목입니다. 없거나 아직 플레이스홀더면 null */
export function readTitleFromBody(body) {
  const match = body.split('\n')[0].match(/^#\s+(.+)$/);
  if (!match) return null;
  const title = match[1].trim();
  return title === TITLE_PLACEHOLDER ? null : title;
}

/** GitHub는 제목과 설명을 따로 받습니다. 제목 줄과 브랜치 표시를 뺀 설명을 돌려줍니다. */
export function toDescription(body) {
  const lines = body.split('\n');
  const withoutTitle = /^#\s+/.test(lines[0])
    ? lines.slice(1).join('\n')
    : body;
  return withoutTitle
    .replace(/^\n+/, '')
    .replace(/\n*<!-- pr-body: .* -->\n*$/, '\n');
}

/** 이 브랜치에서 만든 본문만 돌려줍니다. 손으로 채운 설명을 덮어쓰지 않으려고 먼저 읽습니다. */
export function readExistingBody(branch) {
  try {
    const body = readFileSync(BODY_PATH, 'utf8');
    return body.includes(branchMarker(branch)) ? body : null;
  } catch {
    return null;
  }
}

export function writeBody(body) {
  writeFileSync(BODY_PATH, body);
}
