#!/usr/bin/env node
/**
 * 본문을 만들고 push 한 뒤 GitHub CLI로 PR을 열거나 갱신합니다.
 *
 * @remarks
 * `--dry-run`을 주면 제목과 본문만 만들고 push와 PR 변경을 하지 않습니다.
 * `--base <브랜치>`를 주면 `main` 대신 그 브랜치를 대상으로 삼습니다.
 * 인증은 `gh auth login`으로 로그인한 계정을 씁니다.
 */

import { execFileSync, spawnSync } from 'node:child_process';

import { draftPr } from './draft-pr.mjs';
import {
  BODY_PATH,
  DEFAULT_BASE,
  DETAIL_PLACEHOLDER,
  REMOTE,
  WHY_PLACEHOLDER,
  buildPr,
  fillPlaceholder,
  git,
  readExistingBody,
  readTitleFromBody,
  toDescription,
  writeBody,
} from './pr-body.mjs';

/** GitHub가 PR 본문으로 받는 최대 길이. 넘으면 API가 422를 돌려줍니다. */
const MAX_BODY_CHARS = 65536;

const isDryRun = process.argv.includes('--dry-run');
const baseIndex = process.argv.indexOf('--base');
const baseBranch =
  baseIndex === -1 ? DEFAULT_BASE : process.argv[baseIndex + 1];

function fail(message, code = 1) {
  process.stderr.write(`[pr] ${message}\n`);
  process.exit(code);
}

function gh(args, input) {
  const result = spawnSync('gh', args, {
    encoding: 'utf8',
    input,
    stdio: ['pipe', 'pipe', 'inherit'],
  });
  if (result.error)
    fail('gh를 찾을 수 없다. brew install gh 뒤 gh auth login을 한다');
  if (result.status !== 0) {
    fail(
      `gh ${args[0]} ${args[1]} 실패. 위 메시지를 확인한다`,
      result.status ?? 1
    );
  }
  return result.stdout.trim();
}

function readRepo() {
  let url;
  try {
    url = git(['remote', 'get-url', REMOTE]);
  } catch {
    fail(
      `${REMOTE} 원격이 없다. git remote add ${REMOTE} <GitHub 저장소 주소>로 건다`
    );
  }
  const match = url.match(/github\.com[:/]([^/]+\/[^/]+?)(?:\.git)?$/);
  if (!match) fail(`${REMOTE} 원격이 GitHub 주소가 아니다: ${url}`);
  return match[1];
}

function findOpenPr(repo, branch) {
  const [existing] = JSON.parse(
    gh([
      'pr',
      'list',
      '--repo',
      repo,
      '--head',
      branch,
      '--state',
      'open',
      '--json',
      'number,title,url',
    ])
  );
  return existing ?? null;
}

/**
 * 올릴 제목과 본문을 정해 `.pr-body.md`에 적습니다.
 *
 * @param openTitle 이미 열려 있는 PR의 제목. 본문을 다시 만들었을 때 제목을 또 적지 않게 합니다.
 */
function prepare(pr, openTitle) {
  let body = readExistingBody(pr.branch) ?? pr.body;
  let title = readTitleFromBody(body) ?? pr.title ?? openTitle;

  const needsWhy = body.includes(WHY_PLACEHOLDER);
  const needsDetail = body.includes(DETAIL_PLACEHOLDER);
  if (!title || needsWhy || needsDetail) {
    process.stderr.write('[pr] 초안을 만드는 중\n');
    const draft = draftPr({ subjects: pr.subjects, diff: pr.diff });
    if (draft) {
      if (needsWhy) body = fillPlaceholder(body, WHY_PLACEHOLDER, draft.why);
      if (needsDetail)
        body = fillPlaceholder(body, DETAIL_PLACEHOLDER, draft.detail);
      title ??= draft.title;
    } else {
      process.stderr.write(
        `[pr] 초안을 만들지 못했다. ${BODY_PATH}를 손으로 채운다\n`
      );
    }
  }

  if (!title) {
    fail(
      `제목이 없다. ${BODY_PATH} 첫 줄의 "# " 뒤에 제목을 적는다\n` +
        '[pr] 커밋 제목처럼 쓴다. 예: chore: 커밋 훅을 husky로 이전'
    );
  }

  if (!readTitleFromBody(body))
    body = `# ${title}\n\n${body.replace(/^#\s+.*\n+/, '')}`;
  writeBody(body);

  const lint = spawnSync('pnpm', ['exec', 'commitlint'], {
    input: title,
    stdio: ['pipe', 'inherit', 'inherit'],
  });
  if (lint.status !== 0) fail(`제목이 커밋 규칙을 어긴다: ${title}`);

  return { title, description: toDescription(body) };
}

const repo = readRepo();
if (!baseBranch) fail('--base 뒤에 브랜치 이름을 적는다');
const pr = buildPr(baseBranch);
if (pr.reason) fail(pr.reason);

const existing = findOpenPr(repo, pr.branch);
const { title, description } = prepare(pr, existing?.title);
process.stderr.write(`[pr] 제목: ${title}\n[pr] 본문: ${BODY_PATH}\n`);

if (description.length > MAX_BODY_CHARS) {
  fail(
    `본문이 ${description.length}자로 한도(${MAX_BODY_CHARS})를 넘는다. ${BODY_PATH}를 줄인다`
  );
}
if (isDryRun) {
  process.stderr.write('[pr] --dry-run이라 push와 PR 생성을 건너뛴다\n');
  process.exit(0);
}

try {
  execFileSync('git', ['push', '--set-upstream', REMOTE, 'HEAD'], {
    stdio: 'inherit',
  });
} catch (error) {
  fail(
    'push 실패. 위 git 메시지를 확인한다',
    typeof error.status === 'number' ? error.status : 1
  );
}

if (existing) {
  gh(
    [
      'pr',
      'edit',
      String(existing.number),
      '--repo',
      repo,
      '--title',
      title,
      '--body-file',
      '-',
    ],
    description
  );
  process.stderr.write(`[pr] 열려 있던 PR을 갱신했다: ${existing.url}\n`);
} else {
  const url = gh(
    [
      'pr',
      'create',
      '--repo',
      repo,
      '--base',
      baseBranch,
      '--head',
      pr.branch,
      '--title',
      title,
      '--body-file',
      '-',
    ],
    description
  );
  process.stderr.write(`[pr] PR을 열었다: ${url}\n`);
}
