#!/usr/bin/env node
/**
 * 문서가 말하는 것이 코드에 실제로 있는지 검사합니다. `pre-commit`과 CI가 함께 씁니다.
 *
 * @remarks
 * 문서 속 `pnpm` 스크립트, 문서와 주석이 가리키는 파일, 문서 연결표의 경로를 봅니다.
 * 문장의 뜻이 맞는지는 보지 않습니다. 그것은 세션 종료 훅이 Claude에게 확인시킵니다.
 * 가리키는 파일이 없어도 그 경로가 gitignore 대상이면 건너뜁니다. 로컬에만 두는 문서라 CI에는 없기 때문입니다.
 */

import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';

import {
  extractLinks,
  extractPnpmUsages,
  extractSeeTargets,
  validatePnpmUsage,
} from './doc-checks.mjs';

const DOC_MAP_PATH = '.claude/doc-map.json';
/** gitignore 대상이지만 로컬에 있으면 함께 검사하는 문서 */
const LOCAL_DOC_PATHS = ['CLAUDE.md', '.claude', 'docs'];

const root = execFileSync('git', ['rev-parse', '--show-toplevel'], {
  encoding: 'utf8',
}).trim();
const listFiles = (args) =>
  execFileSync('git', ['ls-files', '-z', ...args], {
    cwd: root,
    encoding: 'utf8',
  })
    .split('\0')
    .filter(Boolean)
    .filter((file) => existsSync(join(root, file)));

const tracked = listFiles([]);
const localDocs = listFiles([
  '--others',
  '--ignored',
  '--exclude-standard',
  '--',
  ...LOCAL_DOC_PATHS,
]);

const problems = [];
const report = (file, line, message) =>
  problems.push(`${file}${line ? `:${line}` : ''} ${message}`);
const read = (file) => readFileSync(join(root, file), 'utf8');

const isIgnored = (path) =>
  spawnSync('git', ['check-ignore', '-q', relative(root, path)], { cwd: root })
    .status === 0;

function checkTarget(file, line, target, base, label) {
  const path = target.startsWith('/')
    ? join(root, target)
    : resolve(base, target);
  if (existsSync(path) || isIgnored(path)) return;
  report(file, line, `${label}가 가리키는 파일이 없다: ${target}`);
}

const scripts = Object.keys(JSON.parse(read('package.json')).scripts ?? {});

for (const file of [...tracked, ...localDocs].filter((path) =>
  path.endsWith('.md')
)) {
  const markdown = read(file);
  for (const { line, tokens } of extractPnpmUsages(markdown)) {
    const problem = validatePnpmUsage(tokens, scripts);
    if (problem) report(file, line, `pnpm ${tokens.join(' ')}: ${problem}`);
  }
  for (const { line, target } of extractLinks(markdown)) {
    checkTarget(file, line, target, join(root, dirname(file)), '링크');
  }
}

for (const file of tracked.filter((path) => /\.(ts|tsx|mjs)$/.test(path))) {
  for (const { line, target } of extractSeeTargets(read(file))) {
    const base = target.startsWith('.') ? join(root, dirname(file)) : root;
    checkTarget(file, line, target, base, '@see');
  }
}

if (existsSync(join(root, DOC_MAP_PATH))) {
  const docMap = JSON.parse(read(DOC_MAP_PATH));
  for (const [doc, coveredPaths] of Object.entries(docMap)) {
    if (!existsSync(join(root, doc)))
      report(DOC_MAP_PATH, 0, `문서가 없다: ${doc}`);
    for (const covered of coveredPaths) {
      if (!existsSync(join(root, covered))) {
        report(DOC_MAP_PATH, 0, `${doc}가 다루는 경로가 없다: ${covered}`);
      }
    }
  }
}

if (problems.length === 0) process.exit(0);

process.stderr.write(
  `[check-docs] 문서와 코드가 어긋난 곳 ${problems.length}건\n${problems.map((problem) => `  ${problem}`).join('\n')}\n`
);
process.exit(1);
