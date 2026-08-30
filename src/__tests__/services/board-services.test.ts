import { createBrowserSupabase } from '@/libs/supabase/client';
import {
  servFetchBoardPosts,
  servFetchBoardDetail,
  servCreateBoardPost,
  servDeleteBoardPost,
  servIncrementBoardViewCount,
  servAddBoardComment,
  servDeleteBoardComment,
} from '@/services/board/board-services';
import { createMockUser } from '../mocks/supabase';
import { createMockBoardPost, createMockBoardDetail } from '../mocks/factories';
import type { MockSupabaseClient } from '../mocks/supabase';

vi.mock('@/libs/supabase/storage', () => ({
  uploadImage: vi.fn(() =>
    Promise.resolve('https://test.supabase.co/storage/uploaded.jpg')
  ),
}));


const mockSupabase = createBrowserSupabase() as unknown as MockSupabaseClient;

describe('servFetchBoardPosts', () => {
  it('게시판 목록을 반환한다', async () => {
    const mockPosts = [
      createMockBoardPost({ id: 1, title: '육아 꿀팁 공유' }),
    ];

    mockSupabase.from = vi.fn(() => ({
      select: vi.fn().mockReturnValue({
        order: vi.fn(() =>
          Promise.resolve({ data: mockPosts, error: null })
        ),
      }),
    })) as ReturnType<typeof vi.fn>;

    const result = await servFetchBoardPosts();

    expect(result).toHaveLength(1);
    expect(result[0]!.title).toBe('육아 꿀팁 공유');
    expect(result[0]!.views).toBe(20);
  });

  it('에러 발생 시 예외를 던진다', async () => {
    mockSupabase.from = vi.fn(() => ({
      select: vi.fn().mockReturnValue({
        order: vi.fn(() =>
          Promise.resolve({ data: null, error: { message: 'DB error' } })
        ),
      }),
    })) as ReturnType<typeof vi.fn>;

    await expect(servFetchBoardPosts()).rejects.toThrow();
  });
});

describe('servFetchBoardDetail', () => {
  it('게시글 상세 정보를 반환한다', async () => {
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

    const result = await servFetchBoardDetail(1);

    expect(result.post.title).toBe('육아 꿀팁 공유');
    expect(result.comments).toHaveLength(0);
  });

  it('존재하지 않는 게시글이면 에러를 던진다', async () => {
    mockSupabase.from = vi.fn(() => ({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn(() =>
            Promise.resolve({ data: null, error: { message: 'Not found' } })
          ),
        }),
      }),
    })) as ReturnType<typeof vi.fn>;

    await expect(servFetchBoardDetail(999)).rejects.toThrow();
  });
});

describe('servCreateBoardPost', () => {
  it('게시글을 생성하고 반환한다', async () => {
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

    const result = await servCreateBoardPost({
      title: '새 게시글',
      content: '게시글 내용입니다',
      image: new File(['test'], 'test.jpg', { type: 'image/jpeg' }),
    });

    expect(result.title).toBe('새 게시글');
  });

  it('미인증 사용자는 에러를 던진다', async () => {
    mockSupabase.auth = {
      getUser: vi.fn(() =>
        Promise.resolve({ data: { user: null }, error: null })
      ),
    } as typeof mockSupabase.auth;

    await expect(
      servCreateBoardPost({
        title: '테스트',
        content: '내용',
        image: new File(['test'], 'test.jpg', { type: 'image/jpeg' }),
      })
    ).rejects.toThrow('인증이 필요합니다');
  });
});

describe('servDeleteBoardPost', () => {
  it('게시글을 삭제한다', async () => {
    mockSupabase.from = vi.fn(() => ({
      delete: vi.fn().mockReturnValue({
        eq: vi.fn(() => Promise.resolve({ error: null })),
      }),
    })) as ReturnType<typeof vi.fn>;

    await expect(servDeleteBoardPost(1)).resolves.toBeUndefined();
  });

  it('에러 발생 시 예외를 던진다', async () => {
    mockSupabase.from = vi.fn(() => ({
      delete: vi.fn().mockReturnValue({
        eq: vi.fn(() =>
          Promise.resolve({ error: { message: 'Delete failed' } })
        ),
      }),
    })) as ReturnType<typeof vi.fn>;

    await expect(servDeleteBoardPost(1)).rejects.toThrow();
  });
});

describe('servIncrementBoardViewCount', () => {
  it('조회수를 증가시킨다', async () => {
    mockSupabase.rpc = vi.fn(() =>
      Promise.resolve({ data: null, error: null })
    ) as ReturnType<typeof vi.fn>;

    await expect(servIncrementBoardViewCount(1)).resolves.toBeUndefined();
    expect(mockSupabase.rpc).toHaveBeenCalledWith('increment_board_views', {
      target_post_id: 1,
    });
  });

  it('에러 발생 시 예외를 던진다', async () => {
    mockSupabase.rpc = vi.fn(() =>
      Promise.resolve({ data: null, error: { message: 'RPC error' } })
    ) as ReturnType<typeof vi.fn>;

    await expect(servIncrementBoardViewCount(1)).rejects.toThrow();
  });
});

describe('servAddBoardComment', () => {
  it('댓글을 추가한다', async () => {
    const mockUser = createMockUser();
    mockSupabase.auth = {
      getUser: vi.fn(() =>
        Promise.resolve({ data: { user: mockUser }, error: null })
      ),
    } as typeof mockSupabase.auth;

    mockSupabase.from = vi.fn(() => ({
      insert: vi.fn(() => Promise.resolve({ error: null })),
    })) as ReturnType<typeof vi.fn>;

    await expect(
      servAddBoardComment({ postId: 1, content: '좋은 정보네요' })
    ).resolves.toBeUndefined();
  });

  it('미인증 사용자는 에러를 던진다', async () => {
    mockSupabase.auth = {
      getUser: vi.fn(() =>
        Promise.resolve({ data: { user: null }, error: null })
      ),
    } as typeof mockSupabase.auth;

    await expect(
      servAddBoardComment({ postId: 1, content: '댓글' })
    ).rejects.toThrow('인증이 필요합니다');
  });
});

describe('servDeleteBoardComment', () => {
  it('본인 댓글을 정상적으로 삭제한다', async () => {
    const mockUser = createMockUser();
    mockSupabase.auth = {
      getUser: vi.fn(() =>
        Promise.resolve({ data: { user: mockUser }, error: null })
      ),
    } as typeof mockSupabase.auth;

    const eqSecond = vi.fn(() =>
      Promise.resolve({ error: null, count: 1 })
    );
    const eqFirst = vi.fn(() => ({ eq: eqSecond }));
    mockSupabase.from = vi.fn(() => ({
      delete: vi.fn(() => ({ eq: eqFirst })),
    })) as ReturnType<typeof vi.fn>;

    await expect(servDeleteBoardComment(1)).resolves.toBeUndefined();
    expect(eqFirst).toHaveBeenCalledWith('id', 1);
    expect(eqSecond).toHaveBeenCalledWith('user_id', mockUser.id);
  });

  it('다른 사용자의 댓글 삭제 시 에러를 던진다', async () => {
    const mockUser = createMockUser();
    mockSupabase.auth = {
      getUser: vi.fn(() =>
        Promise.resolve({ data: { user: mockUser }, error: null })
      ),
    } as typeof mockSupabase.auth;

    const eqSecond = vi.fn(() =>
      Promise.resolve({ error: null, count: 0 })
    );
    mockSupabase.from = vi.fn(() => ({
      delete: vi.fn(() => ({ eq: vi.fn(() => ({ eq: eqSecond })) })),
    })) as ReturnType<typeof vi.fn>;

    await expect(servDeleteBoardComment(99)).rejects.toThrow(
      '삭제 권한이 없거나 존재하지 않는 댓글입니다.'
    );
  });

  it('미인증 사용자는 에러를 던진다', async () => {
    mockSupabase.auth = {
      getUser: vi.fn(() =>
        Promise.resolve({ data: { user: null }, error: null })
      ),
    } as typeof mockSupabase.auth;

    await expect(servDeleteBoardComment(1)).rejects.toThrow(
      '인증이 필요합니다'
    );
  });
});
