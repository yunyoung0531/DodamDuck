import { createBoardPostSchema } from '@/libs/validations/board';

describe('createBoardPostSchema', () => {
  it('유효한 게시판 데이터를 통과시킨다', () => {
    const result = createBoardPostSchema.safeParse({
      title: '육아 꿀팁 공유합니다',
      content: '아이와 함께하는 좋은 놀이 방법을 소개합니다.',
    });

    expect(result.success).toBe(true);
  });

  it('빈 제목을 거부한다', () => {
    const result = createBoardPostSchema.safeParse({
      title: '',
      content: '내용은 10자 이상 입력합니다.',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]!.message).toBe('제목을 입력해주세요');
    }
  });

  it('10자 미만 내용을 거부한다', () => {
    const result = createBoardPostSchema.safeParse({
      title: '제목입니다',
      content: '짧은 내용',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message);
      expect(messages).toContain('내용은 10자 이상 입력해주세요');
    }
  });

  it('100자 초과 제목을 거부한다', () => {
    const result = createBoardPostSchema.safeParse({
      title: 'a'.repeat(101),
      content: '내용은 10자 이상 입력합니다.',
    });

    expect(result.success).toBe(false);
  });

  it('5000자 초과 내용을 거부한다', () => {
    const result = createBoardPostSchema.safeParse({
      title: '제목입니다',
      content: 'a'.repeat(5001),
    });

    expect(result.success).toBe(false);
  });
});
