import { createClient } from '@/libs/supabase/client';
import { renderHookWithProviders, waitFor } from '../test-utils';
import {
  useBoardList,
  useBoardDetail,
  useCreateBoardPost,
  useDeleteBoardPost,
  useAddBoardComment,
  useDeleteBoardComment,
  useIncrementBoardViewCount,
} from '@/services/board/useBoard';
import { createMockBoardPost, createMockBoardDetail } from '../mocks/factories';
import { createMockUser } from '../mocks/supabase';
import type { MockSupabaseClient } from '../mocks/supabase';

vi.mock('@/libs/supabase/storage', () => ({
  uploadImage: vi.fn(() =>
    Promise.resolve('https://test.supabase.co/storage/uploaded.jpg')
  ),
}));


const mockSupabase = createClient() as unknown as MockSupabaseClient;

describe('useBoardList', () => {
  it('게시판 목록을 가져온다', async () => {
    const mockPosts = [
      createMockBoardPost({ id: 1, title: '육아 꿀팁' }),
      createMockBoardPost({ id: 2, title: '놀이 방법' }),
    ];

    mockSupabase.from = vi.fn(() => ({
      select: vi.fn().mockReturnValue({
        order: vi.fn(() =>
          Promise.resolve({ data: mockPosts, error: null })
        ),
      }),
    })) as ReturnType<typeof vi.fn>;

    const { result } = renderHookWithProviders(() => useBoardList());

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toHaveLength(2);
    expect(result.current.data![0]!.title).toBe('육아 꿀팁');
  });
});

describe('useBoardDetail', () => {
  it('게시글 상세를 가져온다', async () => {
    const mockDetail = createMockBoardDetail();

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

    const { result } = renderHookWithProviders(() => useBoardDetail(1));

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data!.post.title).toBe('육아 꿀팁 공유');
  });
});

describe('useCreateBoardPost', () => {
  it('게시글 생성 mutation이 성공한다', async () => {
    const mockUser = createMockUser();
    const mockPost = createMockBoardPost({ title: '새 게시글' });

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

    const { result } = renderHookWithProviders(() => useCreateBoardPost());

    result.current.mutate({
      title: '새 게시글',
      content: '내용입니다',
      image: new File(['test'], 'test.jpg', { type: 'image/jpeg' }),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });
});

describe('useDeleteBoardPost', () => {
  it('게시글 삭제 mutation이 성공한다', async () => {
    mockSupabase.from = vi.fn(() => ({
      delete: vi.fn().mockReturnValue({
        eq: vi.fn(() => Promise.resolve({ error: null })),
      }),
    })) as ReturnType<typeof vi.fn>;

    const { result } = renderHookWithProviders(() => useDeleteBoardPost());

    result.current.mutate(1);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });
});

describe('useAddBoardComment', () => {
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

    const { result } = renderHookWithProviders(() => useAddBoardComment());

    result.current.mutate({ postId: 1, content: '좋은 정보네요' });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });
});

describe('useDeleteBoardComment', () => {
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
      useDeleteBoardComment(1)
    );

    result.current.mutate(1);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });
});

describe('useIncrementBoardViewCount', () => {
  it('조회수 증가 mutation이 성공한다', async () => {
    mockSupabase.rpc = vi.fn(() =>
      Promise.resolve({ data: null, error: null })
    ) as ReturnType<typeof vi.fn>;

    const { result } = renderHookWithProviders(() =>
      useIncrementBoardViewCount()
    );

    result.current.mutate(1);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });
});
