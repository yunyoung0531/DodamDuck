/**
 * lodash / es-toolkit 번들 크기 격리 측정.
 *
 * Next 빌드 청크는 앱 코드가 섞여 노이즈가 크다. 여기서는 해당 유틸만 쓰는
 * 최소 엔트리를 만들어 esbuild로 번들하고 raw / minified / min+gzip을 잰다.
 *
 * 실행: pnpm bench:bundle
 * 계획: debounce-benchmark-plan.md (Phase 2)
 */
import { build } from 'esbuild';
import { gzipSync } from 'node:zlib';

interface Source {
  id: string;
  label: string;
  /** 유틸 이름 목록을 받아 엔트리 소스를 만든다. */
  entry: (utils: readonly string[]) => string;
}

/** 트리셰이킹에 지워지지 않도록 각 유틸을 감싸 export 한다. */
function reexport(utils: readonly string[]) {
  return utils.map((u) => `export const ${u}_ = (...a) => ${u}(...a);`).join('\n');
}

const SOURCES: Source[] = [
  {
    id: 'lodash-full',
    label: "import _ from 'lodash'",
    entry: (utils) =>
      `import _ from 'lodash';\n` +
      utils.map((u) => `export const ${u}_ = (...a) => _.${u}(...a);`).join('\n'),
  },
  {
    id: 'lodash-deep',
    label: "import x from 'lodash/x'",
    entry: (utils) =>
      utils.map((u) => `import ${u} from 'lodash/${u}';`).join('\n') +
      '\n' +
      reexport(utils),
  },
  {
    id: 'lodash-es',
    label: "import { x } from 'lodash-es'",
    entry: (utils) =>
      `import { ${utils.join(', ')} } from 'lodash-es';\n` + reexport(utils),
  },
  {
    id: 'es-toolkit',
    label: "import { x } from 'es-toolkit'",
    entry: (utils) =>
      `import { ${utils.join(', ')} } from 'es-toolkit';\n` + reexport(utils),
  },
  {
    id: 'es-toolkit-compat',
    label: "import { x } from 'es-toolkit/compat'",
    entry: (utils) =>
      `import { ${utils.join(', ')} } from 'es-toolkit/compat';\n` +
      reexport(utils),
  },
];

const SCENARIOS: { title: string; utils: readonly string[] }[] = [
  { title: 'debounce 단독', utils: ['debounce'] },
  {
    title: '유틸 5개 (debounce, throttle, groupBy, uniqBy, chunk)',
    utils: ['debounce', 'throttle', 'groupBy', 'uniqBy', 'chunk'],
  },
];

interface Measurement {
  raw: number;
  min: number;
  gzip: number;
}

function print(line: string) {
  process.stdout.write(`${line}\n`);
}

async function bundle(contents: string, minify: boolean): Promise<string> {
  const result = await build({
    stdin: { contents, resolveDir: process.cwd(), loader: 'js' },
    bundle: true,
    write: false,
    format: 'esm',
    platform: 'browser',
    target: 'es2020',
    treeShaking: true,
    minify,
    logLevel: 'silent',
  });

  const output = result.outputFiles?.[0];
  if (!output) throw new Error('esbuild가 출력을 만들지 못했습니다.');
  return output.text;
}

async function measure(contents: string): Promise<Measurement> {
  const [raw, min] = await Promise.all([
    bundle(contents, false),
    bundle(contents, true),
  ]);

  return {
    raw: Buffer.byteLength(raw),
    min: Buffer.byteLength(min),
    gzip: gzipSync(Buffer.from(min), { level: 9 }).byteLength,
  };
}

function formatBytes(bytes: number) {
  return bytes.toLocaleString('en-US').padStart(9);
}

function formatRatio(value: number, base: number) {
  if (base === 0) return '—'.padStart(7);
  return `${(value / base).toFixed(2)}x`.padStart(7);
}

async function runScenario(scenario: { title: string; utils: readonly string[] }) {
  print(`\n## ${scenario.title}\n`);
  print(
    '| 임포트 방식                             |       raw |  minified |  min+gzip | es-toolkit 대비 |'
  );
  print(
    '|-----------------------------------------|-----------|-----------|-----------|-----------------|'
  );

  const results = new Map<string, Measurement>();

  for (const source of SOURCES) {
    try {
      results.set(source.id, await measure(source.entry(scenario.utils)));
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      print(`| ${source.label.padEnd(39)} | 측정 실패: ${message}`);
    }
  }

  const baseline = results.get('es-toolkit')?.gzip ?? 0;

  for (const source of SOURCES) {
    const result = results.get(source.id);
    if (!result) continue;
    print(
      `| ${source.label.padEnd(39)} |` +
        ` ${formatBytes(result.raw)} |` +
        ` ${formatBytes(result.min)} |` +
        ` ${formatBytes(result.gzip)} |` +
        ` ${formatRatio(result.gzip, baseline)}         |`
    );
  }
}

async function main() {
  for (const scenario of SCENARIOS) {
    await runScenario(scenario);
  }
  print('\n측정 단위: 바이트. gzip은 level 9.');
}

main().catch((error: unknown) => {
  process.stderr.write(`${String(error)}\n`);
  process.exit(1);
});
