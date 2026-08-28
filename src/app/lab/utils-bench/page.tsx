import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import UtilsBenchContents from './components/UtilsBenchContents';

export const metadata: Metadata = {
  title: 'lodash vs es-toolkit 속도 비교',
  robots: { index: false, follow: false },
};

/**
 * 실험용 페이지. 프로덕션 기능이 아니다.
 * 비교가 끝나면 제거 여부를 결정한다 (debounce-benchmark-plan.md Phase 4).
 *
 * 배포본에는 노출하지 않는다. lodash와 es-toolkit을 동시에 불러오는 페이지라
 * 실제 사용자에게 전달될 이유가 없다.
 */
export default function UtilsBenchPage() {
  if (process.env.NODE_ENV === 'production') {
    notFound();
  }

  return <UtilsBenchContents />;
}
