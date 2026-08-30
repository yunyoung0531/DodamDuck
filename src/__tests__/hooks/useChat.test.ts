import { createBrowserSupabase } from '@/libs/supabase/client';
import { renderHookWithProviders, waitFor } from '../test-utils';
import {
  useChatList,
  useChatMessages,
  useSendMessage,
  useCreateChatRoom,
} from '@/services/chat/useChat';
import { createMockChatRoom, createMockChatMessage } from '../mocks/factories';
import type { MockSupabaseClient } from '../mocks/supabase';


const mockSupabase = createBrowserSupabase() as unknown as MockSupabaseClient;

describe('useChatList', () => {
  it('채팅 목록을 가져온다', async () => {
    const mockRooms = [createMockChatRoom()];

    mockSupabase.auth.getUser = vi.fn(() =>
      Promise.resolve({
        data: { user: { id: 'test-uuid-1' } },
        error: null,
      })
    );

    mockSupabase.from = vi.fn(() => ({
      select: vi.fn().mockReturnValue({
        or: vi.fn().mockReturnValue({
          order: vi.fn(() =>
            Promise.resolve({ data: mockRooms, error: null })
          ),
        }),
      }),
    })) as ReturnType<typeof vi.fn>;

    const { result } = renderHookWithProviders(() => useChatList());

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toHaveLength(1);
    expect(result.current.data![0]!.last_message).toBe('안녕하세요');
  });
});

describe('useChatMessages', () => {
  it('roomId가 0이면 쿼리를 실행하지 않는다', () => {
    const { result } = renderHookWithProviders(() => useChatMessages(0));

    expect(result.current.isFetching).toBe(false);
  });

  it('채팅 메시지를 가져온다', async () => {
    const mockMessages = [
      createMockChatMessage({ message: '안녕하세요' }),
      createMockChatMessage({
        id: 2,
        sender_id: 'test-uuid-2',
        message: '네 안녕하세요!',
      }),
    ];

    mockSupabase.from = vi.fn(() => ({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn(() =>
            Promise.resolve({ data: mockMessages, error: null })
          ),
        }),
      }),
    })) as ReturnType<typeof vi.fn>;

    const { result } = renderHookWithProviders(() => useChatMessages(1));

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toHaveLength(2);
    expect(result.current.data![0]!.message).toBe('안녕하세요');
  });
});

describe('useSendMessage', () => {
  it('메시지 전송이 성공한다', async () => {
    mockSupabase.auth.getUser = vi.fn(() =>
      Promise.resolve({
        data: { user: { id: 'test-uuid-1' } },
        error: null,
      })
    );

    mockSupabase.from = vi.fn(() => ({
      insert: vi.fn(() =>
        Promise.resolve({ data: null, error: null })
      ),
    })) as ReturnType<typeof vi.fn>;

    const { result } = renderHookWithProviders(() => useSendMessage());

    result.current.mutate({ roomId: 1, message: '테스트 메시지' });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });
});

describe('useCreateChatRoom', () => {
  it('채팅방 생성 mutation이 성공한다', async () => {
    const mockRoom = createMockChatRoom();

    mockSupabase.auth.getUser = vi.fn(() =>
      Promise.resolve({
        data: { user: { id: 'test-uuid-1' } },
        error: null,
      })
    );

    mockSupabase.from = vi.fn(() => ({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: vi.fn(() =>
              Promise.resolve({ data: null, error: null })
            ),
          }),
        }),
      }),
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn(() =>
            Promise.resolve({ data: mockRoom, error: null })
          ),
        }),
      }),
    })) as ReturnType<typeof vi.fn>;

    const { result } = renderHookWithProviders(() => useCreateChatRoom());

    result.current.mutate({ otherUserId: 'test-uuid-2', postId: 1 });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });
});
