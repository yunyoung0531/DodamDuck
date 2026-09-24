import { buildMessageRows } from '@/components/chat/message-rows';
import { createMockChatMessage } from '../mocks/factories';

function message(id: number, senderId: string, createdAt: string) {
  return createMockChatMessage({ id, sender_id: senderId, created_at: createdAt });
}

describe('buildMessageRows', () => {
  it('첫 메시지 앞에는 항상 날짜 구분선을 넣는다', () => {
    // Arrange
    const messages = [message(1, 'me', '2026-09-23T10:00:00')];

    // Act
    const rows = buildMessageRows(messages);

    // Assert
    expect(rows[0]!.showDateDivider).toBe(true);
  });

  it('날짜가 바뀌는 지점에만 구분선을 넣는다', () => {
    // Arrange
    const messages = [
      message(1, 'me', '2026-09-22T23:50:00'),
      message(2, 'me', '2026-09-23T00:10:00'),
      message(3, 'me', '2026-09-23T00:20:00'),
    ];

    // Act
    const rows = buildMessageRows(messages);

    // Assert
    expect(rows.map((row) => row.showDateDivider)).toEqual([true, true, false]);
  });

  it('같은 사람이 같은 분에 연달아 보내면 하나의 묶음으로 본다', () => {
    // Arrange
    const messages = [
      message(1, 'me', '2026-09-23T10:00:10'),
      message(2, 'me', '2026-09-23T10:00:40'),
      message(3, 'me', '2026-09-23T10:00:55'),
    ];

    // Act
    const rows = buildMessageRows(messages);

    // Assert — 프로필은 처음에, 시간은 마지막에만
    expect(rows.map((row) => row.isFirstInGroup)).toEqual([true, false, false]);
    expect(rows.map((row) => row.isLastInGroup)).toEqual([false, false, true]);
  });

  it('분이 바뀌면 묶음이 끊긴다', () => {
    // Arrange
    const messages = [
      message(1, 'me', '2026-09-23T10:00:59'),
      message(2, 'me', '2026-09-23T10:01:00'),
    ];

    // Act
    const rows = buildMessageRows(messages);

    // Assert
    expect(rows.map((row) => row.isLastInGroup)).toEqual([true, true]);
  });

  it('보낸 사람이 바뀌면 묶음이 끊긴다', () => {
    // Arrange
    const messages = [
      message(1, 'me', '2026-09-23T10:00:10'),
      message(2, 'partner', '2026-09-23T10:00:20'),
    ];

    // Act
    const rows = buildMessageRows(messages);

    // Assert
    expect(rows.map((row) => row.isFirstInGroup)).toEqual([true, true]);
    expect(rows.map((row) => row.isLastInGroup)).toEqual([true, true]);
  });

  it('날짜가 바뀌면 시각이 같아도 묶음이 끊긴다', () => {
    // Arrange
    const messages = [
      message(1, 'me', '2026-09-22T10:00:10'),
      message(2, 'me', '2026-09-23T10:00:20'),
    ];

    // Act
    const rows = buildMessageRows(messages);

    // Assert
    expect(rows.map((row) => row.isLastInGroup)).toEqual([true, true]);
  });
});
