import { createClient } from '@/libs/supabase/client';
import { servFetchBoardPosts } from '@/services/board/board-services';
import { createMockBoardPost } from '../mocks/factories';
import type { MockSupabaseClient } from '../mocks/supabase';


const mockSupabase = createClient() as unknown as MockSupabaseClient;

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
