import { createClient } from '@/libs/supabase/client';
import { renderHookWithProviders, waitFor } from '../test-utils';
import {
  useSharingList,
  useSharingSearch,
  usePopularSearches,
} from '@/services/sharing/useSharing';
import { createMockSharingPost } from '../mocks/factories';
import type { MockSupabaseClient } from '../mocks/supabase';

vi.mock('@/libs/supabase/client');

const mockSupabase = createClient() as unknown as MockSupabaseClient;

describe('useSharingList', () => {
  it('게시글 목록을 가져온다', async () => {
    const mockPosts = [
      createMockSharingPost({ id: 1, title: '레고 교환' }),
      createMockSharingPost({ id: 2, title: '인형 나눔' }),
    ];

    mockSupabase.from = vi.fn(() => ({
      select: vi.fn().mockReturnValue({
        order: vi.fn(() =>
          Promise.resolve({ data: mockPosts, error: null })
        ),
      }),
    })) as ReturnType<typeof vi.fn>;

    const { result } = renderHookWithProviders(() => useSharingList());

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toHaveLength(2);
    expect(result.current.data![0]!.title).toBe('레고 교환');
  });
});

describe('useSharingSearch', () => {
  it('빈 검색어이면 쿼리를 실행하지 않는다', () => {
    const { result } = renderHookWithProviders(() => useSharingSearch(''));

    expect(result.current.isFetching).toBe(false);
  });
});

describe('usePopularSearches', () => {
  it('인기 검색어를 가져온다', async () => {
    const mockPopular = [
      { query: '레고', search_count: 10 },
      { query: '인형', search_count: 5 },
    ];

    mockSupabase.rpc = vi.fn(() =>
      Promise.resolve({ data: mockPopular, error: null })
    ) as ReturnType<typeof vi.fn>;

    const { result } = renderHookWithProviders(() => usePopularSearches());

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toHaveLength(2);
    expect(result.current.data![0]!.query).toBe('레고');
  });
});
