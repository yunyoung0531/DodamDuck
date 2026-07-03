import { createClient } from '@/libs/supabase/client';
import { renderHookWithProviders, waitFor } from '../test-utils';
import { useBoardList } from '@/services/board/useBoard';
import { createMockBoardPost } from '../mocks/factories';
import type { MockSupabaseClient } from '../mocks/supabase';


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
