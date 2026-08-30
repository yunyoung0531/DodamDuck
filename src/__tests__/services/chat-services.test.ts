import { createBrowserSupabase } from '@/libs/supabase/client';
import {
  servFetchChatList,
  servFetchMessages,
  servSendMessage,
} from '@/services/chat/chat-services';
import { createMockChatRoom, createMockChatMessage } from '../mocks/factories';
import type { MockSupabaseClient } from '../mocks/supabase';


const mockSupabase = createBrowserSupabase() as unknown as MockSupabaseClient;

describe('servFetchChatList', () => {
  it('채팅 목록을 반환한다', async () => {
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

    const result = await servFetchChatList();

    expect(result).toHaveLength(1);
    expect(result[0]!.last_message).toBe('안녕하세요');
  });

  it('미인증 시 에러를 던진다', async () => {
    mockSupabase.auth.getUser = vi.fn(() =>
      Promise.resolve({ data: { user: null }, error: null })
    );

    await expect(servFetchChatList()).rejects.toThrow('인증이 필요합니다');
  });
});

describe('servFetchMessages', () => {
  it('채팅 메시지를 반환한다', async () => {
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

    const result = await servFetchMessages(1);

    expect(result).toHaveLength(2);
    expect(result[0]!.message).toBe('안녕하세요');
  });
});

describe('servSendMessage', () => {
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

    await expect(
      servSendMessage({ roomId: 1, message: '테스트 메시지' })
    ).resolves.toBeUndefined();
  });
});
