#!/usr/bin/env node
/**
 * 스테이징된 파일만 검사하고 고치지 않는다. 고치게 하면 스테이징하지 않은 변경까지 함께 커밋된다.
 * 목록은 `git diff --cached`에서 오지만 포맷은 작업 트리 내용에 하기 때문이다.
 *
 * 경로를 `-z`로 받아 NUL로 나눈다. `core.quotepath` 기본값이 한글 파일명을 인용해 검사에서
 * 빠지게 하는 것과, 공백이 있는 이름이 단어 분리로 쪼개지는 것을 함께 피한다.
 *
 * ESLint는 `pnpm lint`와 같은 범위(`src/`의 ts, tsx)만 보고 경고로는 막지 않는다.
 * 기존 경고가 남아 있어 경고까지 막으면 그 파일을 건드리는 커밋이 모두 막힌다.
 */

import { execFileSync, spawnSync } from 'node:child_process';

const staged = execFileSync(
  'git',
  ['diff', '--cached', '--name-only', '-z', '--diff-filter=ACMR'],
  {
    encoding: 'utf8',
  }
)
  .split('\0')
  .filter(Boolean);

if (staged.length === 0) process.exit(0);

const steps = [
  {
    name: 'ESLint',
    args: ['exec', 'eslint'],
    files: staged.filter((path) => /^src\/.*\.(ts|tsx)$/.test(path)),
  },
  {
    name: 'Prettier',
    args: ['exec', 'prettier', '--check', '--ignore-unknown'],
    files: staged,
  },
];

let hasFailure = false;
for (const { name, args, files } of steps) {
  if (files.length === 0) continue;
  const result = spawnSync('pnpm', [...args, ...files], { stdio: 'inherit' });
  if (result.status !== 0) {
    process.stderr.write(`[pre-commit] ${name} 실패\n`);
    hasFailure = true;
  }
}

if (hasFailure) {
  process.stderr.write(
    '[pre-commit] 고친 뒤 다시 add 한다. 포맷은 `pnpm format`, 린트는 `pnpm lint --fix`로 고친다\n'
  );
  process.exit(1);
}
