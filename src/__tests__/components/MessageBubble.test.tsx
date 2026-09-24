import { screen } from '@testing-library/react';
import { renderWithProviders } from '../test-utils';
import { MessageBubble } from '@/components/chat/MessageBubble';
import { createMockChatMessage } from '../mocks/factories';
import { CHAT_REACTION_EMOJIS } from '@/services/chat/chat.types';

const ME = 'test-uuid-1';
const EMOJI = CHAT_REACTION_EMOJIS[0];

function renderBubble(isMine: boolean, reactions = [{ emoji: EMOJI, user_id: 'other' }]) {
  renderWithProviders(
    <MessageBubble
      message={createMockChatMessage({ chat_message_reactions: reactions })}
      isMine={isMine}
      isFirstInGroup
      isLastInGroup
      currentUserId={ME}
      partnerName="상대"
      partnerProfileUrl={null}
      onToggleReaction={vi.fn()}
    />
  );
}

describe('MessageBubble 리액션 권한', () => {
  it('상대 메시지에는 리액션 추가 버튼을 보여준다', () => {
    // Arrange, Act
    renderBubble(false);

    // Assert
    expect(screen.getByLabelText('리액션 달기')).toBeInTheDocument();
  });

  it('내 메시지에는 리액션 추가 버튼이 없다', () => {
    // Arrange, Act
    renderBubble(true);

    // Assert
    expect(screen.queryByLabelText('리액션 달기')).not.toBeInTheDocument();
  });

  it('내 메시지에 달린 칩은 누를 수 없다', () => {
    // Arrange, Act — 칩이 버튼이면 눌러서 내 리액션을 달 수 있다
    renderBubble(true);

    // Assert
    expect(screen.getByText(EMOJI)).toBeInTheDocument();
    expect(screen.queryAllByRole('button')).toHaveLength(0);
  });

  it('상대 메시지에 달린 칩은 누를 수 있다', () => {
    // Arrange, Act
    renderBubble(false);

    // Assert
    expect(
      screen.getByLabelText(`${EMOJI} 리액션 1개`)
    ).toBeInTheDocument();
  });
});
