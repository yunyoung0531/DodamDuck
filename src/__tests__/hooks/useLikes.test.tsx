import { createBrowserSupabase } from '@/libs/supabase/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { renderHookWithProviders } from '../test-utils';
import {
  useUserLikedIds,
  useIsLiked,
  useToggleLike,
  useUserLikedSharingPosts,
} from '@/services/likes/useLikes';
import type { MockSupabaseClient } from '../mocks/supabase';

const mockSupabase = createBrowserSupabase() as unknown as MockSupabaseClient;

function setupAuthenticatedUser() {
  mockSupabase.auth = {
    getUser: vi.fn(() =>
      Promise.resolve({
        data: { user: { id: 'test-uuid-1', email: 'test@example.com' } },
        error: null,
      })
    ),
    onAuthStateChange: vi.fn(() => ({
      data: { subscription: { unsubscribe: vi.fn() } },
    })),
  } as typeof mockSupabase.auth;
}

function setupUnauthenticatedUser() {
  mockSupabase.auth = {
    getUser: vi.fn(() =>
      Promise.resolve({ data: { user: null }, error: null })
    ),
    onAuthStateChange: vi.fn(() => ({
      data: { subscription: { unsubscribe: vi.fn() } },
    })),
  } as typeof mockSupabase.auth;
}

function createSeededQueryClient(likedIds: number[]) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
    },
  });
  queryClient.setQueryData(['likes', 'userIds'], likedIds);
  return queryClient;
}

describe('useUserLikedIds', () => {
  it('비인증 사용자는 쿼리를 실행하지 않는다', () => {
    setupUnauthenticatedUser();

    mockSupabase.from = vi.fn(() => ({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn(() =>
            Promise.resolve({ data: null, error: null })
          ),
        }),
      }),
    })) as ReturnType<typeof vi.fn>;

    const { result } = renderHookWithProviders(() => useUserLikedIds());

    expect(result.current.isFetching).toBe(false);
  });

  it('인증된 사용자의 좋아요 ID 목록을 가져온다', async () => {
    setupAuthenticatedUser();

    const profileEq = vi.fn().mockReturnValue({
      single: vi.fn(() =>
        Promise.resolve({
          data: {
            id: 'test-uuid-1',
            username: 'test',
            display_name: '테스트',
            location: '광주',
            profile_url: '',
            level: 1,
            verification_count: 0,
            created_at: '',
            updated_at: '',
          },
          error: null,
        })
      ),
    });

    const likesEq = vi.fn(() =>
      Promise.resolve({
        data: [{ post_id: 1 }, { post_id: 3 }],
        error: null,
      })
    );

    let callCount = 0;
    mockSupabase.from = vi.fn(() => {
      callCount++;
      if (callCount === 1) {
        return {
          select: vi.fn().mockReturnValue({ eq: profileEq }),
        };
      }
      return {
        select: vi.fn().mockReturnValue({ eq: likesEq }),
      };
    }) as ReturnType<typeof vi.fn>;

    const { result } = renderHookWithProviders(() => useUserLikedIds());

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual([1, 3]);
  });
});

describe('useIsLiked', () => {
  it('좋아요한 게시글이면 true를 반환한다', () => {
    const queryClient = createSeededQueryClient([1, 3, 5]);

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(() => useIsLiked(3), { wrapper });

    expect(result.current.isLiked).toBe(true);
    expect(result.current.isLoading).toBe(false);
  });

  it('좋아요하지 않은 게시글이면 false를 반환한다', () => {
    const queryClient = createSeededQueryClient([1, 3, 5]);

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(() => useIsLiked(2), { wrapper });

    expect(result.current.isLiked).toBe(false);
    expect(result.current.isLoading).toBe(false);
  });

  it('likedIds가 없으면 false를 반환한다', () => {
    const { result } = renderHookWithProviders(() => useIsLiked(1));

    expect(result.current.isLiked).toBe(false);
  });

  it('비로그인 사용자는 쿼리가 비활성이라 isLoading이 false다', () => {
    const { result } = renderHookWithProviders(() => useIsLiked(1));

    expect(result.current.isLoading).toBe(false);
  });
});

describe('useToggleLike', () => {
  it('좋아요 토글 mutation이 성공한다', async () => {
    mockSupabase.rpc = vi.fn(() =>
      Promise.resolve({ data: true, error: null })
    ) as ReturnType<typeof vi.fn>;

    const { result } = renderHookWithProviders(() => useToggleLike());

    result.current.mutate(1);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });

  it('toggle_like RPC를 호출한다', async () => {
    mockSupabase.rpc = vi.fn(() =>
      Promise.resolve({ data: true, error: null })
    ) as ReturnType<typeof vi.fn>;

    const { result } = renderHookWithProviders(() => useToggleLike());

    result.current.mutate(5);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockSupabase.rpc).toHaveBeenCalledWith('toggle_like', {
      target_table: 'sharing',
      target_post_id: 5,
    });
  });

  it('mutation 실패 시 에러 상태가 된다', async () => {
    mockSupabase.rpc = vi.fn(() =>
      Promise.resolve({ data: null, error: { message: 'RPC error' } })
    ) as ReturnType<typeof vi.fn>;

    const { result } = renderHookWithProviders(() => useToggleLike());

    result.current.mutate(1);

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });
});

describe('useUserLikedSharingPosts', () => {
  it('비인증 사용자는 쿼리를 실행하지 않는다', () => {
    setupUnauthenticatedUser();

    mockSupabase.from = vi.fn(() => ({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn(() =>
            Promise.resolve({ data: null, error: null })
          ),
        }),
      }),
    })) as ReturnType<typeof vi.fn>;

    const { result } = renderHookWithProviders(() =>
      useUserLikedSharingPosts()
    );

    expect(result.current.isFetching).toBe(false);
  });
});
