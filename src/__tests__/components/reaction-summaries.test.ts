import { toReactionSummaries } from '@/components/chat/reaction-summaries';
import { CHAT_REACTION_EMOJIS } from '@/services/chat/chat.types';

const ME = 'test-uuid-1';

describe('toReactionSummaries', () => {
  it('리액션이 없으면 빈 배열을 반환한다', () => {
    expect(toReactionSummaries([], ME)).toEqual([]);
  });

  it('같은 이모지를 개수로 묶는다', () => {
    // Arrange
    const emoji = CHAT_REACTION_EMOJIS[0];
    const reactions = [
      { emoji, user_id: ME },
      { emoji, user_id: 'other' },
    ];

    // Act
    const summaries = toReactionSummaries(reactions, ME);

    // Assert
    expect(summaries).toEqual([{ emoji, count: 2, isMine: true }]);
  });

  it('내가 누르지 않았으면 isMine이 false다', () => {
    // Arrange
    const emoji = CHAT_REACTION_EMOJIS[0];
    const reactions = [{ emoji, user_id: 'other' }];

    // Act
    const summaries = toReactionSummaries(reactions, ME);

    // Assert
    expect(summaries).toEqual([{ emoji, count: 1, isMine: false }]);
  });

  it('누른 순서가 아니라 피커에 보이는 순서로 정렬한다', () => {
    // Arrange — 세트에서 이모지를 가져온다. 값을 적어두면 세트가 바뀔 때
    // 둘 중 하나가 세트 밖으로 밀려나 "세트 밖은 뒤로" 규칙이 대신 통과시킨다.
    const [, earlier, later] = CHAT_REACTION_EMOJIS;
    const reactions = [
      { emoji: later!, user_id: 'other' },
      { emoji: earlier!, user_id: ME },
    ];

    // Act
    const summaries = toReactionSummaries(reactions, ME);

    // Assert — 나중에 눌린 것이 피커에서 앞이면 앞에 온다
    expect(summaries.map((summary) => summary.emoji)).toEqual([
      earlier,
      later,
    ]);
  });
});

// 세트에서 빠진 뒤에도 DB에 남아 있는 이모지를 흉내낸다.
const REMOVED_EMOJI = '❤️';

describe('toReactionSummaries 피커 세트 밖 이모지', () => {
  it('이 묶음이 쓰는 이모지는 실제로 세트 밖이다', () => {
    expect(CHAT_REACTION_EMOJIS).not.toContain(REMOVED_EMOJI);
  });

  it('세트에서 빠진 이모지도 표시한다', () => {
    // Arrange — 세트가 바뀌기 전에 달린 리액션
    const reactions = [{ emoji: REMOVED_EMOJI, user_id: ME }];

    // Act
    const summaries = toReactionSummaries(reactions, ME);

    // Assert — 안 보이면 취소할 방법이 없어진다
    expect(summaries).toEqual([
      { emoji: REMOVED_EMOJI, count: 1, isMine: true },
    ]);
  });

  it('세트 안 이모지를 앞에, 밖 이모지를 뒤에 둔다', () => {
    // Arrange
    const inSet = CHAT_REACTION_EMOJIS[0];
    const reactions = [
      { emoji: REMOVED_EMOJI, user_id: 'other' },
      { emoji: inSet, user_id: ME },
    ];

    // Act
    const summaries = toReactionSummaries(reactions, ME);

    // Assert
    expect(summaries.map((summary) => summary.emoji)).toEqual([
      inSet,
      REMOVED_EMOJI,
    ]);
  });
});
