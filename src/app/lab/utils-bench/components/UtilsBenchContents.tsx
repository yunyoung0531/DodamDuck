'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/common/PageHeader';
import {
  BENCH_CASES,
  DATA_SIZES,
  createDataset,
  measureCase,
  type BenchResult,
  type DataSize,
} from './bench-cases';

function formatOps(opsPerSec: number) {
  return `${Math.round(opsPerSec).toLocaleString('ko-KR')} 회/초`;
}

function ResultRow({ result }: { result: BenchResult }) {
  const isEsToolkitFaster = result.ratio > 1;
  const fasterRatio = isEsToolkitFaster ? result.ratio : 1 / result.ratio;
  const total = result.lodashOps + result.esToolkitOps;
  const lodashPercent = total > 0 ? (result.lodashOps / total) * 100 : 50;
  const esToolkitPercent = 100 - lodashPercent;

  return (
    <div className="flex flex-col gap-2 border-b py-4 last:border-b-0">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold">{result.label}</p>
        <Badge variant={isEsToolkitFaster ? 'default' : 'secondary'}>
          {isEsToolkitFaster ? 'es-toolkit' : 'lodash'}이 {fasterRatio.toFixed(2)}배
          빠름
        </Badge>
      </div>

      <div className="flex h-6 w-full overflow-hidden rounded-md bg-muted">
        <div
          className="flex items-center justify-center bg-slate-400 text-xs text-white w-[var(--bar-width)]"
          style={{ '--bar-width': `${lodashPercent}%` } as React.CSSProperties}
        >
          lodash
        </div>
        <div
          className="flex items-center justify-center bg-dodam-500 text-xs text-white w-[var(--bar-width)]"
          style={
            { '--bar-width': `${esToolkitPercent}%` } as React.CSSProperties
          }
        >
          es-toolkit
        </div>
      </div>

      <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted-foreground">
        <span>lodash {formatOps(result.lodashOps)}</span>
        <span>es-toolkit {formatOps(result.esToolkitOps)}</span>
      </div>
    </div>
  );
}

export default function UtilsBenchContents() {
  const [size, setSize] = useState<DataSize>(10_000);
  const [results, setResults] = useState<BenchResult[]>([]);
  const [runningCaseId, setRunningCaseId] = useState<string | null>(null);

  async function handleRun() {
    setResults([]);
    const data = createDataset(size);
    const collected: BenchResult[] = [];

    for (const benchCase of BENCH_CASES) {
      setRunningCaseId(benchCase.id);
      // 측정은 메인 스레드를 막으므로 케이스마다 한 번 양보해 진행 상태를 그린다.
      await new Promise((resolve) => setTimeout(resolve, 0));
      collected.push(measureCase(benchCase, data));
      setResults([...collected]);
    }

    setRunningCaseId(null);
  }

  const isRunning = runningCaseId !== null;

  return (
    <div className="flex justify-center px-4 py-10">
      <div className="flex w-full max-w-3xl flex-col gap-8">
        <PageHeader
          subtitle="lodash vs es-toolkit"
          title="유틸 함수 속도 비교"
        />

        <Card>
          <CardHeader>
            <CardTitle className="text-base">데이터 크기</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-wrap gap-2">
              {DATA_SIZES.map((dataSize) => (
                <Button
                  key={dataSize}
                  variant={dataSize === size ? 'default' : 'outline'}
                  size="sm"
                  disabled={isRunning}
                  onClick={() => setSize(dataSize)}
                >
                  {dataSize.toLocaleString('ko-KR')}건
                </Button>
              ))}
            </div>

            <Button onClick={handleRun} disabled={isRunning}>
              {isRunning ? '측정 중...' : '측정 시작'}
            </Button>

            <p className="text-xs text-muted-foreground">
              각 함수마다 예열 60ms 후 200ms 동안 반복 실행해 초당 처리 횟수를
              잽니다. 측정 중에는 화면이 잠시 멈춥니다. 개발 서버가 아닌 프로덕션
              빌드(`pnpm build && pnpm start`)에서 재야 의미 있는 숫자가 나옵니다.
            </p>
          </CardContent>
        </Card>

        {results.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                결과 — {size.toLocaleString('ko-KR')}건
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col">
              {results.map((result) => (
                <ResultRow key={result.id} result={result} />
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
