import { createClient } from '@/libs/supabase/client';
import {
  servFetchSharingPosts,
  servFetchPopularSearches,
  servDeleteSharingComment,
} from '@/services/sharing/sharing-services';
import { createMockUser } from '../mocks/supabase';
import { createMockSharingPost } from '../mocks/factories';
import type { MockSupabaseClient } from '../mocks/supabase';


const mockSupabase = createClient() as unknown as MockSupabaseClient;

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
