import {
  QueryClient,
  QueryClientProvider,
  useMutation,
} from '@tanstack/react-query';
import { toast } from 'sonner';
import { act, renderHook, waitFor } from '@testing-library/react';
import { createMutationCache } from '@/libs/query/mutation-cache';

vi.mock('sonner', () => ({
  toast: { error: vi.fn(), success: vi.fn() },
}));

function renderMutation(options: Parameters<typeof useMutation>[0]) {
  const queryClient = new QueryClient({ mutationCache: createMutationCache() });
  return renderHook(() => useMutation(options), {
    wrapper: ({ children }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  });
}

const fail = () => Promise.reject(new Error('인증이 필요합니다'));

describe('createMutationCache', () => {
  beforeEach(() => {
    vi.mocked(toast.error).mockClear();
  });

  it('mutation이 실패하면 errorTitle과 정규화한 문구로 토스트를 띄운다', async () => {
    const { result } = renderMutation({
      mutationFn: fail,
      meta: { errorTitle: '글 등록 실패' },
    });

    act(() => result.current.mutate(undefined));

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(toast.error).toHaveBeenCalledTimes(1);
    expect(toast.error).toHaveBeenCalledWith('글 등록 실패', {
      description: '인증이 필요합니다',
    });
  });

  it('errorTitle이 없으면 공통 제목을 쓴다', async () => {
    const { result } = renderMutation({ mutationFn: fail });

    act(() => result.current.mutate(undefined));

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(toast.error).toHaveBeenCalledWith('요청을 처리하지 못했습니다', {
      description: '인증이 필요합니다',
    });
  });

  it('훅에 롤백용 onError가 있어도 토스트는 한 번이다', async () => {
    const rollback = vi.fn();
    const { result } = renderMutation({
      mutationFn: fail,
      onError: rollback,
      meta: { errorTitle: '좋아요 실패' },
    });

    act(() => result.current.mutate(undefined));

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(rollback).toHaveBeenCalledTimes(1);
    expect(toast.error).toHaveBeenCalledTimes(1);
  });

  it('meta.silent면 토스트를 띄우지 않고 error는 남긴다', async () => {
    const { result } = renderMutation({
      mutationFn: fail,
      meta: { silent: true },
    });

    act(() => result.current.mutate(undefined));

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toEqual(new Error('인증이 필요합니다'));
    expect(toast.error).not.toHaveBeenCalled();
  });
});
