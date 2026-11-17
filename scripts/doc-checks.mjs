/** 셸 명령으로 읽는 코드 펜스의 언어 표시. 표시가 없는 펜스는 출력 예시일 수 있어 보지 않습니다. */
const SHELL_FENCES = new Set(['bash', 'sh', 'zsh', 'shell']);
const FENCE = /^\s*```\s*([\w-]*)/;

/** `package.json`의 `scripts`가 아니어도 되는 pnpm 자체 명령 */
const PNPM_BUILTINS = new Set([
  'add',
  'audit',
  'config',
  'create',
  'dlx',
  'exec',
  'i',
  'install',
  'link',
  'list',
  'ls',
  'outdated',
  'prune',
  'rebuild',
  'remove',
  'rm',
  'store',
  'up',
  'update',
  'why',
]);

/** 리다이렉션과 주석 뒤는 명령의 인자가 아닙니다. */
function toTokens(rest) {
  const tokens = [];
  for (const token of rest.trim().split(/\s+/).filter(Boolean)) {
    if (/^(\d?>|#)/.test(token)) break;
    tokens.push(token);
  }
  return tokens;
}

/**
 * 문서에서 `pnpm`을 부르는 자리를 찾습니다.
 *
 * @remarks
 * 셸 펜스에서는 명령 자리에 온 `pnpm`만 봅니다. `echo pnpm`처럼 인자로 쓰인 것은 건너뜁니다.
 * 본문에서는 `pnpm`으로 시작하는 인라인 코드만 봅니다.
 * @returns `{ line, tokens }` 목록. `tokens`는 `pnpm` 뒤의 인자입니다.
 */
export function extractPnpmUsages(markdown) {
  const inShell =
    /(?:^\s*(?:\$\s+)?|(?:&&|\|\||[;|(])\s*)pnpm(?=\s|$)([^;&|)]*)/g;
  const inSpan = /^pnpm(?=\s|$)(.*)$/;

  const usages = [];
  let fenceLang = null;
  markdown.split('\n').forEach((text, index) => {
    const fence = text.match(FENCE);
    if (fence) {
      fenceLang = fenceLang === null ? fence[1].toLowerCase() : null;
      return;
    }
    if (fenceLang !== null) {
      if (!SHELL_FENCES.has(fenceLang)) return;
      for (const match of text.matchAll(inShell)) {
        usages.push({ line: index + 1, tokens: toTokens(match[1]) });
      }
      return;
    }
    for (const span of text.matchAll(/`([^`]+)`/g)) {
      const match = span[1].match(inSpan);
      if (match) usages.push({ line: index + 1, tokens: toTokens(match[1]) });
    }
  });
  return usages;
}

const isPlaceholder = (token) => /^[<[]/.test(token);

/**
 * `package.json`에 있는 스크립트를 부르는지 봅니다.
 *
 * @param scripts `package.json`의 `scripts` 이름 목록
 * @returns 문제를 설명하는 문장. 맞는 호출이면 null
 */
export function validatePnpmUsage(tokens, scripts) {
  const [first, second] = tokens;
  if (!first || isPlaceholder(first) || first.startsWith('-')) return null;

  const script = first === 'run' ? second : first;
  if (!script || isPlaceholder(script)) return null;
  if (first !== 'run' && PNPM_BUILTINS.has(script)) return null;
  return scripts.includes(script)
    ? null
    : `package.json에 없는 스크립트: ${script}`;
}

const isExternal = (target) => /^([a-z][a-z0-9+.-]*:|#|\/\/)/i.test(target);

/** 펜스와 인라인 코드 밖의 마크다운 링크 가운데 레포 안의 파일을 가리키는 것 */
export function extractLinks(markdown) {
  const links = [];
  let inFence = false;
  markdown.split('\n').forEach((text, index) => {
    if (FENCE.test(text)) {
      inFence = !inFence;
      return;
    }
    if (inFence) return;
    const prose = text.replace(/`[^`]*`/g, '');
    for (const match of prose.matchAll(
      /\]\(\s*<?([^)\s>]+)>?(?:\s+"[^"]*")?\s*\)/g
    )) {
      const target = match[1].split('#')[0];
      if (target && !isExternal(match[1]))
        links.push({ line: index + 1, target });
    }
  });
  return links;
}

/** 코드 주석의 `@see`가 가리키는 레포 안의 파일. 문자열 안에 적힌 `@see`는 주석이 아니라서 건너뜁니다. */
export function extractSeeTargets(code) {
  const targets = [];
  code.split('\n').forEach((text, index) => {
    const match = text.match(/^\s*(?:\/\/|\/\*+|\*)\s*.*?@see\s+(\S.*)$/);
    if (!match) return;
    const link = match[1].match(/\]\(([^)\s]+)\)/);
    const raw = (link ? link[1] : match[1].split(/\s/)[0])
      .split('#')[0]
      .replace(/[.,;]+$/, '');
    const looksLikePath = raw.includes('/') || /\.[a-z]+$/i.test(raw);
    if (raw && looksLikePath && !isExternal(raw))
      targets.push({ line: index + 1, target: raw });
  });
  return targets;
}

const covers = (covered, file) =>
  covered.endsWith('/') ? file.startsWith(covered) : file === covered;

/**
 * 다루는 코드는 바뀌었는데 자신은 그대로인 문서를 고릅니다.
 *
 * @param docMap 문서 경로에서 그 문서가 다루는 코드 경로 목록으로 가는 표. `/`로 끝나면 폴더 전체입니다.
 * @param changedFiles 기준 브랜치 이후 바뀐 파일
 * @returns `{ doc, changedCode }` 목록
 */
export function docsNeedingReview(docMap, changedFiles) {
  const changed = new Set(changedFiles);
  const reviews = [];
  for (const [doc, coveredPaths] of Object.entries(docMap)) {
    if (changed.has(doc)) continue;
    const changedCode = changedFiles.filter(
      (file) =>
        file !== doc && coveredPaths.some((covered) => covers(covered, file))
    );
    if (changedCode.length) reviews.push({ doc, changedCode });
  }
  return reviews;
}
