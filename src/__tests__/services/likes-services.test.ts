import { createBrowserSupabase } from '@/libs/supabase/client';
import {
  servFetchUserLikedPostIds,
  servToggleLike,
  servFetchUserLikedSharingPosts,
} from '@/services/likes/likes-services';
import { createMockUser } from '../mocks/supabase';
import { createMockSharingPost } from '../mocks/factories';
import type { MockSupabaseClient } from '../mocks/supabase';

const mockSupabase = createBrowserSupabase() as unknown as MockSupabaseClient;

describe('servFetchUserLikedPostIds', () => {
  it('인증된 사용자의 좋아요 post ID 배열을 반환한다', async () => {
    const mockUser = createMockUser();
    mockSupabase.auth = {
      getUser: vi.fn(() =>
        Promise.resolve({ data: { user: mockUser }, error: null })
      ),
    } as typeof mockSupabase.auth;

    const eqMock = vi.fn(() =>
      Promise.resolve({
        data: [{ post_id: 1 }, { post_id: 3 }, { post_id: 5 }],
        error: null,
      })
    );
    mockSupabase.from = vi.fn(() => ({
      select: vi.fn(() => ({
        eq: eqMock,
      })),
    })) as ReturnType<typeof vi.fn>;

    const result = await servFetchUserLikedPostIds();

    expect(result).toEqual([1, 3, 5]);
    expect(mockSupabase.from).toHaveBeenCalledWith('sharing_likes');
  });

  it('비인증 사용자는 빈 배열을 반환한다', async () => {
    mockSupabase.auth = {
      getUser: vi.fn(() =>
        Promise.resolve({ data: { user: null }, error: null })
      ),
    } as typeof mockSupabase.auth;

    const result = await servFetchUserLikedPostIds();

    expect(result).toEqual([]);
  });
});

describe('servToggleLike', () => {
  it('RPC toggle_like를 호출하고 결과를 반환한다', async () => {
    mockSupabase.rpc = vi.fn(() =>
      Promise.resolve({ data: true, error: null })
    ) as ReturnType<typeof vi.fn>;

    const result = await servToggleLike(42);

    expect(result).toBe(true);
    expect(mockSupabase.rpc).toHaveBeenCalledWith('toggle_like', {
      target_table: 'sharing',
      target_post_id: 42,
    });
  });

  it('에러 발생 시 예외를 던진다', async () => {
    mockSupabase.rpc = vi.fn(() =>
      Promise.resolve({ data: null, error: { message: 'RPC error' } })
    ) as ReturnType<typeof vi.fn>;

    await expect(servToggleLike(1)).rejects.toThrow();
  });
});

describe('servFetchUserLikedSharingPosts', () => {
  it('좋아요한 교환/나눔 게시글을 반환한다', async () => {
    const mockUser = createMockUser();
    mockSupabase.auth = {
      getUser: vi.fn(() =>
        Promise.resolve({ data: { user: mockUser }, error: null })
      ),
    } as typeof mockSupabase.auth;

    const mockPosts = [
      createMockSharingPost({ id: 1, title: '좋아요 게시글' }),
    ];

    let callCount = 0;
    mockSupabase.from = vi.fn(() => {
      callCount++;
      if (callCount === 1) {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() =>
              Promise.resolve({
                data: [{ post_id: 1 }],
                error: null,
              })
            ),
          })),
        };
      }
      return {
        select: vi.fn(() => ({
          in: vi.fn(() => ({
            order: vi.fn(() =>
              Promise.resolve({ data: mockPosts, error: null })
            ),
          })),
        })),
      };
    }) as ReturnType<typeof vi.fn>;

    const result = await servFetchUserLikedSharingPosts();

    expect(result).toHaveLength(1);
    expect(result[0]!.title).toBe('좋아요 게시글');
  });

  it('좋아요가 없으면 빈 배열을 반환한다', async () => {
    const mockUser = createMockUser();
    mockSupabase.auth = {
      getUser: vi.fn(() =>
        Promise.resolve({ data: { user: mockUser }, error: null })
      ),
    } as typeof mockSupabase.auth;

    mockSupabase.from = vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() =>
          Promise.resolve({
            data: [],
            error: null,
          })
        ),
      })),
    })) as ReturnType<typeof vi.fn>;

    const result = await servFetchUserLikedSharingPosts();

    expect(result).toEqual([]);
  });

  it('비인증 사용자는 빈 배열을 반환한다', async () => {
    mockSupabase.auth = {
      getUser: vi.fn(() =>
        Promise.resolve({ data: { user: null }, error: null })
      ),
    } as typeof mockSupabase.auth;

    const result = await servFetchUserLikedSharingPosts();

    expect(result).toEqual([]);
  });
});
