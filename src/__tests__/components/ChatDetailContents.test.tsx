import { screen, fireEvent } from '@testing-library/react';
import { useParams } from 'next/navigation';
import { renderWithProviders } from '../test-utils';
import { createMockChatMessage } from '../mocks/factories';
import ChatDetailContents from '@/app/chat/[id]/components/ChatDetailContents';
import type { User } from '@supabase/supabase-js';
import type { Profile } from '@/services/auth/auth.types';

beforeAll(() => {
  Element.prototype.scrollTo = mockScrollTo;
});

const mockMutate = vi.fn();
const mockScrollTo = vi.fn();

let mockMessages: unknown[] = [];

vi.mock('@/services/chat/useChat', () => ({
  useChatList: () => ({ data: [] }),
  useChatMessages: () => ({ data: mockMessages }),
  useSendMessage: () => ({ mutate: mockMutate, isPending: false }),
  useToggleReaction: () => ({ mutate: vi.fn(), isPending: false }),
}));

const user = { id: 'test-uuid-1' } as User;
const profile = {
  display_name: '유녕',
  profile_url: '',
  level: 1,
} as Profile;

function renderChat() {
  vi.mocked(useParams).mockReturnValue({ id: '4' });
  renderWithProviders(<ChatDetailContents user={user} profile={profile} />);
  return screen.getByPlaceholderText('메시지를 입력하세요');
}

describe('ChatDetailContents 메시지 전송', () => {
  beforeEach(() => {
    mockMutate.mockClear();
  });

  it('Enter를 누르면 메시지를 전송한다', () => {
    // Arrange
    const input = renderChat();
    fireEvent.change(input, { target: { value: '안녕하세요' } });

    // Act
    fireEvent.keyDown(input, { key: 'Enter' });

    // Assert
    expect(mockMutate).toHaveBeenCalledTimes(1);
  });

  it('한글 조합 중 Enter는 전송하지 않는다', () => {
    // Arrange — 조합을 확정하는 Enter는 isComposing이 true로 들어온다
    const input = renderChat();
    fireEvent.change(input, { target: { value: '안녕하세용' } });

    // Act
    fireEvent.keyDown(input, { key: 'Enter', isComposing: true });

    // Assert
    expect(mockMutate).not.toHaveBeenCalled();
  });

  it('한글 입력 후 Enter 한 번에 두 번 전송되지 않는다', () => {
    // Arrange — 실제 브라우저는 조합 확정 Enter와 실제 Enter로 keydown을 두 번 보낸다
    const input = renderChat();
    fireEvent.change(input, { target: { value: '안녕하세용' } });

    // Act
    fireEvent.keyDown(input, { key: 'Enter', isComposing: true });
    fireEvent.keyDown(input, { key: 'Enter' });

    // Assert
    expect(mockMutate).toHaveBeenCalledTimes(1);
  });

  it('빈 메시지는 전송하지 않는다', () => {
    // Arrange
    const input = renderChat();
    fireEvent.change(input, { target: { value: '   ' } });

    // Act
    fireEvent.keyDown(input, { key: 'Enter' });

    // Assert
    expect(mockMutate).not.toHaveBeenCalled();
  });
});


describe('ChatDetailContents 자동 스크롤', () => {
  beforeEach(() => {
    mockScrollTo.mockClear();
    mockMessages = [createMockChatMessage({ id: 1 })];
  });

  it('메시지가 늘면 맨 아래로 내린다', () => {
    // Arrange
    vi.mocked(useParams).mockReturnValue({ id: '4' });
    const { rerender } = renderWithProviders(
      <ChatDetailContents user={user} profile={profile} />
    );
    mockScrollTo.mockClear();

    // Act
    mockMessages = [
      createMockChatMessage({ id: 1 }),
      createMockChatMessage({ id: 2 }),
    ];
    rerender(<ChatDetailContents user={user} profile={profile} />);

    // Assert
    expect(mockScrollTo).toHaveBeenCalled();
  });

  it('리액션만 바뀌면 스크롤하지 않는다', () => {
    // Arrange — 위를 읽던 사용자가 맨 아래로 끌려가면 안 된다
    vi.mocked(useParams).mockReturnValue({ id: '4' });
    const { rerender } = renderWithProviders(
      <ChatDetailContents user={user} profile={profile} />
    );
    mockScrollTo.mockClear();

    // Act — 개수는 그대로고 배열 정체성만 바뀐다 (낙관적 갱신이 만드는 상황)
    mockMessages = [
      createMockChatMessage({
        id: 1,
        chat_message_reactions: [{ emoji: '👍', user_id: 'other' }],
      }),
    ];
    rerender(<ChatDetailContents user={user} profile={profile} />);

    // Assert
    expect(mockScrollTo).not.toHaveBeenCalled();
  });
});
