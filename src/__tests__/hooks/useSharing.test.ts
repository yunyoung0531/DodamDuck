import { createClient } from '@/libs/supabase/client';
import { renderHookWithProviders, waitFor } from '../test-utils';
import {
  useSharingList,
  useSharingDetail,
  useSharingSearch,
  usePopularSearches,
  useCreateSharingPost,
  useDeleteSharingPost,
  useAddSharingComment,
  useDeleteSharingComment,
  useIncrementSharingViewCount,
} from '@/services/sharing/useSharing';
import { createMockSharingPost, createMockSharingDetail } from '../mocks/factories';
import { createMockUser } from '../mocks/supabase';
import type { MockSupabaseClient } from '../mocks/supabase';

vi.mock('@/libs/supabase/storage', () => ({
  uploadImage: vi.fn(() =>
    Promise.resolve('https://test.supabase.co/storage/uploaded.jpg')
  ),
}));


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

describe('useSharingDetail', () => {
  it('게시글 상세를 가져온다', async () => {
    const mockDetail = createMockSharingDetail();

    let callCount = 0;
    mockSupabase.from = vi.fn(() => {
      callCount++;
      if (callCount === 1) {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn(() =>
                Promise.resolve({ data: mockDetail.post, error: null })
              ),
            }),
          }),
        };
      }
      return {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn(() =>
              Promise.resolve({ data: mockDetail.comments, error: null })
            ),
          }),
        }),
      };
    }) as ReturnType<typeof vi.fn>;

    const { result } = renderHookWithProviders(() => useSharingDetail(1));

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data!.post.title).toBe('레고 교환합니다');
    expect(result.current.data!.comments).toHaveLength(1);
  });
});

describe('useCreateSharingPost', () => {
  it('게시글 생성 mutation이 성공한다', async () => {
    const mockUser = createMockUser();
    const mockPost = createMockSharingPost({ title: '새 장난감' });

    mockSupabase.auth = {
      getUser: vi.fn(() =>
        Promise.resolve({ data: { user: mockUser }, error: null })
      ),
    } as typeof mockSupabase.auth;

    mockSupabase.from = vi.fn(() => ({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn(() =>
            Promise.resolve({ data: mockPost, error: null })
          ),
        }),
      }),
    })) as ReturnType<typeof vi.fn>;

    const { result } = renderHookWithProviders(() => useCreateSharingPost());

    result.current.mutate({
      title: '새 장난감',
      content: '상태 좋음',
      location: '광주광역시',
      exchangeOption: '교환',
      tags: ['장난감'],
      image: new File(['test'], 'test.jpg', { type: 'image/jpeg' }),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });
});

describe('useDeleteSharingPost', () => {
  it('게시글 삭제 mutation이 성공한다', async () => {
    mockSupabase.from = vi.fn(() => ({
      delete: vi.fn().mockReturnValue({
        eq: vi.fn(() => Promise.resolve({ error: null })),
      }),
    })) as ReturnType<typeof vi.fn>;

    const { result } = renderHookWithProviders(() => useDeleteSharingPost());

    result.current.mutate(1);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });
});

describe('useAddSharingComment', () => {
  it('댓글 추가 mutation이 성공한다', async () => {
    const mockUser = createMockUser();
    mockSupabase.auth = {
      getUser: vi.fn(() =>
        Promise.resolve({ data: { user: mockUser }, error: null })
      ),
    } as typeof mockSupabase.auth;

    mockSupabase.from = vi.fn(() => ({
      insert: vi.fn(() => Promise.resolve({ error: null })),
    })) as ReturnType<typeof vi.fn>;

    const { result } = renderHookWithProviders(() => useAddSharingComment());

    result.current.mutate({ postId: 1, content: '좋은 장난감이네요' });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });
});

describe('useDeleteSharingComment', () => {
  it('댓글 삭제 mutation이 성공한다', async () => {
    const mockUser = createMockUser();
    mockSupabase.auth = {
      getUser: vi.fn(() =>
        Promise.resolve({ data: { user: mockUser }, error: null })
      ),
    } as typeof mockSupabase.auth;

    mockSupabase.from = vi.fn(() => ({
      delete: vi.fn(() => ({
        eq: vi.fn(() => ({
          eq: vi.fn(() => Promise.resolve({ error: null, count: 1 })),
        })),
      })),
    })) as ReturnType<typeof vi.fn>;

    const { result } = renderHookWithProviders(() =>
      useDeleteSharingComment(1)
    );

    result.current.mutate(1);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });
});

describe('useIncrementSharingViewCount', () => {
  it('조회수 증가 mutation이 성공한다', async () => {
    mockSupabase.rpc = vi.fn(() =>
      Promise.resolve({ data: null, error: null })
    ) as ReturnType<typeof vi.fn>;

    const { result } = renderHookWithProviders(() =>
      useIncrementSharingViewCount()
    );

    result.current.mutate(1);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });
});
