import { createClient } from '@/libs/supabase/client';
import {
  servFetchSharingPosts,
  servFetchPopularSearches,
} from '@/services/sharing/sharing-services';
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
