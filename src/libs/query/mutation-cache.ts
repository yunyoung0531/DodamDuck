import { MutationCache } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getErrorMessage } from '@/libs/error-message';

const DEFAULT_ERROR_TITLE = '요청을 처리하지 못했습니다';

/**
 * @description 모든 mutation의 실패를 한 곳에서 토스트로 알리는 `MutationCache`를 만듭니다.
 *
 * @remarks
 * 훅이나 컴포넌트의 `onError`에서 토스트를 띄우지 않습니다. 두 곳에서 띄우면 한 번의 실패에 토스트가 두 개 뜹니다.
 * 제목은 `meta.errorTitle`, 알리지 않으려면 `meta.silent`를 씁니다. 브라우저용 `QueryClient`에만 넣습니다.
 * @see docs/error-handling.md
 * @public
 */
export function createMutationCache() {
  return new MutationCache({
    onError: (error, _variables, _onMutateResult, mutation) => {
      if (mutation.meta?.silent) return;
      toast.error(mutation.meta?.errorTitle ?? DEFAULT_ERROR_TITLE, {
        description: getErrorMessage(error),
      });
    },
  });
}
