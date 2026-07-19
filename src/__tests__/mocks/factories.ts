import type { SharingPost, SharingDetailResponse } from '@/services/sharing/sharing.types';
import type { BoardPost, BoardDetailResponse } from '@/services/board/board.types';
import type { ChatRoom, ChatMessage } from '@/services/chat/chat.types';
import type { LibraryItem } from '@/services/library/library.types';

const DEFAULT_PROFILE = {
  username: '테스트유저',
  display_name: '테스트유저',
  profile_url: '',
};

export function createMockSharingPost(
  overrides?: Partial<SharingPost>
): SharingPost {
  return {
    id: 1,
    user_id: 'test-uuid-1',
    image_url: 'https://test.supabase.co/storage/img1.jpg',
    title: '레고 교환합니다',
    content: '상태 좋은 레고입니다',
    location: '광주광역시',
    exchange_option: '교환',
    tags: ['레고', '장난감'],
    views: 10,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    profiles: DEFAULT_PROFILE,
    ...overrides,
  };
}

export function createMockSharingDetail(
  overrides?: Partial<SharingDetailResponse>
): SharingDetailResponse {
  return {
    post: createMockSharingPost(),
    comments: [
      {
        id: 1,
        post_id: 1,
        user_id: 'comment-user-1',
        content: '교환 원합니다',
        created_at: '2024-01-02T00:00:00Z',
        profiles: {
          username: '댓글유저',
          display_name: '댓글유저',
        },
      },
    ],
    ...overrides,
  };
}

export function createMockBoardPost(
  overrides?: Partial<BoardPost>
): BoardPost {
  return {
    id: 1,
    user_id: 'test-uuid-1',
    image_url: 'https://test.supabase.co/storage/img1.jpg',
    title: '육아 꿀팁 공유',
    content: '좋은 육아 정보입니다',
    comment_count: 3,
    views: 20,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    profiles: DEFAULT_PROFILE,
    ...overrides,
  };
}

export function createMockBoardDetail(
  overrides?: Partial<BoardDetailResponse>
): BoardDetailResponse {
  return {
    post: createMockBoardPost(),
    comments: [],
    ...overrides,
  };
}

export function createMockChatRoom(
  overrides?: Partial<ChatRoom>
): ChatRoom {
  return {
    id: 1,
    user1_id: 'test-uuid-1',
    user2_id: 'test-uuid-2',
    post_id: null,
    last_message: '안녕하세요',
    last_message_at: '2024-01-01T10:00:00Z',
    created_at: '2024-01-01T00:00:00Z',
    user1_profile: {
      username: 'user1',
      display_name: '유저1',
      profile_url: '',
    },
    user2_profile: {
      username: 'user2',
      display_name: '유저2',
      profile_url: '',
    },
    ...overrides,
  };
}

export function createMockChatMessage(
  overrides?: Partial<ChatMessage>
): ChatMessage {
  return {
    id: 1,
    room_id: 1,
    sender_id: 'test-uuid-1',
    message: '안녕하세요',
    created_at: '2024-01-01T10:00:00Z',
    profiles: {
      username: 'user1',
      display_name: '유저1',
    },
    ...overrides,
  };
}

export function createMockLibraryItem(
  overrides?: Partial<LibraryItem>
): LibraryItem {
  return {
    순번: 1,
    장난감명: '레고 블록',
    '영 역': '블록',
    사용연령: '3세 이상',
    대여료: '1000',
    제조사: '레고코리아',
    관리기관명: '광주광역시 장난감도서관',
    관리기관전화번호: '062-123-4567',
    소재지도로명주소: '광주광역시 북구 용봉로 1',
    소재지지번주소: '광주광역시 북구 용봉동 1',
    ...overrides,
  };
}
