import {
  docsNeedingReview,
  extractLinks,
  extractPnpmUsages,
  extractSeeTargets,
  validatePnpmUsage,
} from '../../../scripts/doc-checks.mjs';

const SCRIPTS = ['dev', 'lint', 'type-check', 'test:run', 'pr'];
const usagesOf = (markdown: string) =>
  extractPnpmUsages(markdown).map((usage) => usage.tokens);
const fenced = (lang: string, body: string) =>
  ['```' + lang, body, '```'].join('\n');

describe('extractPnpmUsages', () => {
  it('셸 펜스에서 명령 자리에 온 pnpm 호출을 찾는다', () => {
    const markdown = fenced(
      'bash',
      'pnpm type-check && pnpm test:run | tail\n$ pnpm pr --dry-run'
    );

    expect(usagesOf(markdown)).toEqual([
      ['type-check'],
      ['test:run'],
      ['pr', '--dry-run'],
    ]);
  });

  it('다른 명령의 인자로 쓰인 pnpm은 호출로 보지 않는다', () => {
    const markdown = fenced('bash', 'echo pnpm nope\nwhich pnpm');

    expect(usagesOf(markdown)).toEqual([]);
  });

  it('셸이 아닌 펜스와 표시 없는 펜스는 보지 않는다', () => {
    expect(usagesOf(fenced('', 'pnpm nope'))).toEqual([]);
    expect(usagesOf(fenced('json', 'pnpm nope'))).toEqual([]);
  });

  it('본문에서는 pnpm으로 시작하는 인라인 코드만 본다', () => {
    const markdown = '`pnpm lint`를 돌린다. `npx pnpm nope`은 호출이 아니다.';

    expect(usagesOf(markdown)).toEqual([['lint']]);
  });

  it('리다이렉션과 주석 뒤는 인자로 보지 않는다', () => {
    expect(usagesOf(fenced('sh', 'pnpm lint 2>/dev/null # --wat'))).toEqual([
      ['lint'],
    ]);
  });
});

describe('validatePnpmUsage', () => {
  it('package.json의 스크립트와 pnpm 자체 명령은 통과한다', () => {
    expect(
      validatePnpmUsage(['test:run', '--', '--coverage'], SCRIPTS)
    ).toBeNull();
    expect(validatePnpmUsage(['run', 'lint'], SCRIPTS)).toBeNull();
    expect(
      validatePnpmUsage(['install', '--frozen-lockfile'], SCRIPTS)
    ).toBeNull();
    expect(validatePnpmUsage(['dlx', 'prettier'], SCRIPTS)).toBeNull();
    expect(validatePnpmUsage(['<스크립트>'], SCRIPTS)).toBeNull();
    expect(validatePnpmUsage([], SCRIPTS)).toBeNull();
  });

  it('package.json에 없는 스크립트는 문제로 돌려준다', () => {
    expect(validatePnpmUsage(['typecheck'], SCRIPTS)).toMatch(
      /package.json에 없는 스크립트: typecheck/
    );
    expect(validatePnpmUsage(['run', 'mr'], SCRIPTS)).toMatch(
      /package.json에 없는 스크립트: mr/
    );
  });
});

describe('extractLinks', () => {
  it('레포 안을 가리키는 링크만 뽑는다', () => {
    const markdown = [
      '[읽기](./README.md) [절](docs/a.md#제목) [밖](https://example.com) [앵커](#확인)',
      '`[코드](no.md)`',
      fenced('md', '[펜스](no.md)'),
    ].join('\n');

    expect(extractLinks(markdown).map((link) => link.target)).toEqual([
      './README.md',
      'docs/a.md',
    ]);
  });
});

describe('extractSeeTargets', () => {
  it('@see가 가리키는 파일 경로만 뽑는다', () => {
    const code = [
      '/** @see docs/implementation-notes/chat.md */',
      ' * @see [규칙](../rules/comments.md) 형식',
      ' * @see https://example.com/spec',
      ' * @see formatTimeSince',
    ].join('\n');

    expect(extractSeeTargets(code).map((see) => see.target)).toEqual([
      'docs/implementation-notes/chat.md',
      '../rules/comments.md',
    ]);
  });

  it('주석이 아닌 줄의 @see는 건너뛴다', () => {
    expect(
      extractSeeTargets("const sample = '/** @see docs/missing.md */';")
    ).toEqual([]);
  });
});

describe('docsNeedingReview', () => {
  it('다루는 코드만 바뀐 문서를 고른다', () => {
    const docMap = {
      'docs/implementation-notes/chat.md': ['src/components/chat/'],
      'README.md': ['package.json'],
    };

    expect(
      docsNeedingReview(docMap, [
        'src/components/chat/MessageList.tsx',
        'src/app/page.tsx',
      ])
    ).toEqual([
      {
        doc: 'docs/implementation-notes/chat.md',
        changedCode: ['src/components/chat/MessageList.tsx'],
      },
    ]);
  });

  it('문서도 함께 바뀌었으면 고르지 않는다', () => {
    const docMap = { 'README.md': ['package.json'] };

    expect(docsNeedingReview(docMap, ['package.json', 'README.md'])).toEqual(
      []
    );
    expect(docsNeedingReview(docMap, ['src/other.ts'])).toEqual([]);
  });
});
