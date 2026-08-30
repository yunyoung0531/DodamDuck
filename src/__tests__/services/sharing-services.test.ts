import { createBrowserSupabase } from '@/libs/supabase/client';
import {
  servFetchSharingPosts,
  servFetchSharingDetail,
  servCreateSharingPost,
  servDeleteSharingPost,
  servIncrementSharingViewCount,
  servAddSharingComment,
  servDeleteSharingComment,
  servSearchSharingPosts,
  servFetchPopularSearches,
} from '@/services/sharing/sharing-services';
import { SHARING_CATEGORY } from '@/services/sharing/sharing.types';
import { createMockUser } from '../mocks/supabase';
import { createMockSharingPost, createMockSharingDetail } from '../mocks/factories';
import type { MockSupabaseClient } from '../mocks/supabase';

vi.mock('@/libs/supabase/storage', () => ({
  uploadImage: vi.fn(() =>
    Promise.resolve('https://test.supabase.co/storage/uploaded.jpg')
  ),
}));


const mockSupabase = createBrowserSupabase() as unknown as MockSupabaseClient;

describe('servFetchSharingPosts', () => {
  it('게시글 목록을 반환한다', async () => {
    const mockPosts = [
      createMockSharingPost({ id: 1, title: '레고 교환합니다' }),
      createMockSharingPost({ id: 2, title: '인형 나눔합니다' }),
    ];

    mockSupabase.from = vi.fn(() => ({
      select: vi.fn().mockReturnValue({
        order: vi.fn(() =>
          Promise.resolve({ data: mockPosts, error: null })
        ),
      }),
    })) as ReturnType<typeof vi.fn>;

    const result = await servFetchSharingPosts();

    expect(result).toHaveLength(2);
    expect(result[0]!.title).toBe('레고 교환합니다');
  });

  it('에러 발생 시 예외를 던진다', async () => {
    mockSupabase.from = vi.fn(() => ({
      select: vi.fn().mockReturnValue({
        order: vi.fn(() =>
          Promise.resolve({ data: null, error: { message: 'DB error' } })
        ),
      }),
    })) as ReturnType<typeof vi.fn>;

    await expect(servFetchSharingPosts()).rejects.toThrow();
  });

  it('카테고리를 넘기면 해당 카테고리로 필터링한다', async () => {
    const order = vi.fn(() => Promise.resolve({ data: [], error: null }));
    const eq = vi.fn().mockReturnValue({ order });
    const select = vi.fn().mockReturnValue({ eq, order });

    mockSupabase.from = vi.fn(() => ({ select })) as ReturnType<typeof vi.fn>;

    await servFetchSharingPosts(SHARING_CATEGORY.BLOCKS);

    expect(eq).toHaveBeenCalledWith('category', SHARING_CATEGORY.BLOCKS);
  });

  it('카테고리를 넘기지 않으면 필터를 걸지 않는다', async () => {
    const order = vi.fn(() => Promise.resolve({ data: [], error: null }));
    const eq = vi.fn().mockReturnValue({ order });
    const select = vi.fn().mockReturnValue({ eq, order });

    mockSupabase.from = vi.fn(() => ({ select })) as ReturnType<typeof vi.fn>;

    await servFetchSharingPosts();

    expect(eq).not.toHaveBeenCalled();
  });
});

describe('servDeleteSharingComment', () => {
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

    await expect(servDeleteSharingComment(1)).resolves.toBeUndefined();
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

    await expect(servDeleteSharingComment(99)).rejects.toThrow(
      '삭제 권한이 없거나 존재하지 않는 댓글입니다.'
    );
  });

  it('미인증 사용자는 에러를 던진다', async () => {
    mockSupabase.auth = {
      getUser: vi.fn(() =>
        Promise.resolve({ data: { user: null }, error: null })
      ),
    } as typeof mockSupabase.auth;

    await expect(servDeleteSharingComment(1)).rejects.toThrow(
      '인증이 필요합니다'
    );
  });
});

describe('servFetchPopularSearches', () => {
  it('인기 검색어를 반환한다', async () => {
    const mockPopular = [
      { query: '레고', search_count: 10 },
      { query: '인형', search_count: 5 },
    ];

    mockSupabase.rpc = vi.fn(() =>
      Promise.resolve({ data: mockPopular, error: null })
    ) as ReturnType<typeof vi.fn>;

    const result = await servFetchPopularSearches();

    expect(result).toHaveLength(2);
    expect(result[0]!.query).toBe('레고');
  });
});

describe('servFetchSharingDetail', () => {
  it('게시글 상세 정보를 반환한다', async () => {
    const mockDetail = createMockSharingDetail();

    const eqMock = vi.fn().mockReturnValue({
      single: vi.fn(() =>
        Promise.resolve({ data: mockDetail.post, error: null })
      ),
    });
    const commentsEqMock = vi.fn().mockReturnValue({
      order: vi.fn(() =>
        Promise.resolve({ data: mockDetail.comments, error: null })
      ),
    });

    let callCount = 0;
    mockSupabase.from = vi.fn(() => {
      callCount++;
      if (callCount === 1) {
        return {
          select: vi.fn().mockReturnValue({ eq: eqMock }),
        };
      }
      return {
        select: vi.fn().mockReturnValue({ eq: commentsEqMock }),
      };
    }) as ReturnType<typeof vi.fn>;

    const result = await servFetchSharingDetail(1);

    expect(result.post.title).toBe('레고 교환합니다');
    expect(result.comments).toHaveLength(1);
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

    await expect(servFetchSharingDetail(999)).rejects.toThrow();
  });
});

describe('servCreateSharingPost', () => {
  it('게시글을 생성하고 반환한다', async () => {
    const mockUser = createMockUser();
    const mockPost = createMockSharingPost({ title: '새 장난감' });

    mockSupabase.auth = {
      getUser: vi.fn(() =>
        Promise.resolve({ data: { user: mockUser }, error: null })
      ),
    } as typeof mockSupabase.auth;

    const insert = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        single: vi.fn(() => Promise.resolve({ data: mockPost, error: null })),
      }),
    });

    mockSupabase.from = vi.fn(() => ({ insert })) as ReturnType<typeof vi.fn>;

    const result = await servCreateSharingPost({
      title: '새 장난감',
      content: '상태 좋습니다',
      location: '광주광역시',
      exchangeOption: '교환',
      category: SHARING_CATEGORY.RIDE,
      tags: ['장난감'],
      image: new File(['test'], 'test.jpg', { type: 'image/jpeg' }),
    });

    expect(result.title).toBe('새 장난감');
    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({ category: SHARING_CATEGORY.RIDE })
    );
  });

  it('미인증 사용자는 에러를 던진다', async () => {
    mockSupabase.auth = {
      getUser: vi.fn(() =>
        Promise.resolve({ data: { user: null }, error: null })
      ),
    } as typeof mockSupabase.auth;

    await expect(
      servCreateSharingPost({
        title: '테스트',
        content: '내용',
        location: '광주',
        exchangeOption: '교환',
        category: SHARING_CATEGORY.ETC,
        tags: [],
        image: new File(['test'], 'test.jpg', { type: 'image/jpeg' }),
      })
    ).rejects.toThrow('인증이 필요합니다');
  });
});

describe('servDeleteSharingPost', () => {
  it('게시글을 삭제한다', async () => {
    mockSupabase.from = vi.fn(() => ({
      delete: vi.fn().mockReturnValue({
        eq: vi.fn(() => Promise.resolve({ error: null })),
      }),
    })) as ReturnType<typeof vi.fn>;

    await expect(servDeleteSharingPost(1)).resolves.toBeUndefined();
  });

  it('에러 발생 시 예외를 던진다', async () => {
    mockSupabase.from = vi.fn(() => ({
      delete: vi.fn().mockReturnValue({
        eq: vi.fn(() =>
          Promise.resolve({ error: { message: 'Delete failed' } })
        ),
      }),
    })) as ReturnType<typeof vi.fn>;

    await expect(servDeleteSharingPost(1)).rejects.toThrow();
  });
});

describe('servIncrementSharingViewCount', () => {
  it('조회수를 증가시킨다', async () => {
    mockSupabase.rpc = vi.fn(() =>
      Promise.resolve({ data: null, error: null })
    ) as ReturnType<typeof vi.fn>;

    await expect(servIncrementSharingViewCount(1)).resolves.toBeUndefined();
    expect(mockSupabase.rpc).toHaveBeenCalledWith('increment_sharing_views', {
      target_post_id: 1,
    });
  });

  it('에러 발생 시 예외를 던진다', async () => {
    mockSupabase.rpc = vi.fn(() =>
      Promise.resolve({ data: null, error: { message: 'RPC error' } })
    ) as ReturnType<typeof vi.fn>;

    await expect(servIncrementSharingViewCount(1)).rejects.toThrow();
  });
});

describe('servAddSharingComment', () => {
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
      servAddSharingComment({ postId: 1, content: '좋은 장난감이네요' })
    ).resolves.toBeUndefined();
  });

  it('미인증 사용자는 에러를 던진다', async () => {
    mockSupabase.auth = {
      getUser: vi.fn(() =>
        Promise.resolve({ data: { user: null }, error: null })
      ),
    } as typeof mockSupabase.auth;

    await expect(
      servAddSharingComment({ postId: 1, content: '댓글' })
    ).rejects.toThrow('인증이 필요합니다');
  });
});

describe('servSearchSharingPosts', () => {
  it('검색 결과를 반환한다', async () => {
    const mockPosts = [createMockSharingPost({ id: 1, title: '레고 교환' })];

    mockSupabase.rpc = vi.fn(() =>
      Promise.resolve({ data: [{ id: 1 }], error: null })
    ) as ReturnType<typeof vi.fn>;

    mockSupabase.from = vi.fn(() => ({
      select: vi.fn().mockReturnValue({
        in: vi.fn().mockReturnValue({
          order: vi.fn(() =>
            Promise.resolve({ data: mockPosts, error: null })
          ),
        }),
      }),
    })) as ReturnType<typeof vi.fn>;

    const result = await servSearchSharingPosts('레고');

    expect(result).toHaveLength(1);
    expect(result[0]!.title).toBe('레고 교환');
  });

  it('검색 결과가 없으면 빈 배열을 반환한다', async () => {
    mockSupabase.rpc = vi.fn(() =>
      Promise.resolve({ data: [], error: null })
    ) as ReturnType<typeof vi.fn>;

    const result = await servSearchSharingPosts('존재하지않는검색어');

    expect(result).toHaveLength(0);
  });
});
