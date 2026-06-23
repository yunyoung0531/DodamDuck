import { createSharingPostSchema } from '@/libs/validations/sharing';

describe('createSharingPostSchema', () => {
  it('유효한 교환 게시글 데이터를 통과시킨다', () => {
    const result = createSharingPostSchema.safeParse({
      title: '레고 교환합니다',
      content: '상태 좋은 레고 세트입니다. 교환 원합니다.',
      location: '광주광역시 북구',
      exchangeOption: '교환',
    });

    expect(result.success).toBe(true);
  });

  it('유효한 나눔 게시글 데이터를 통과시킨다', () => {
    const result = createSharingPostSchema.safeParse({
      title: '인형 나눔합니다',
      content: '사용감 있지만 깨끗한 인형입니다. 나눔합니다.',
      location: '서울특별시 강남구',
      exchangeOption: '나눔',
    });

    expect(result.success).toBe(true);
  });

  it('빈 상품명을 거부한다', () => {
    const result = createSharingPostSchema.safeParse({
      title: '',
      content: '내용은 10자 이상 입력합니다.',
      location: '광주광역시',
      exchangeOption: '교환',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]!.message).toBe('상품명을 입력해주세요');
    }
  });

  it('10자 미만 내용을 거부한다', () => {
    const result = createSharingPostSchema.safeParse({
      title: '레고 교환',
      content: '짧은 내용',
      location: '광주광역시',
      exchangeOption: '교환',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message);
      expect(messages).toContain('내용은 10자 이상 입력해주세요');
    }
  });

  it('빈 거래 희망 장소를 거부한다', () => {
    const result = createSharingPostSchema.safeParse({
      title: '레고 교환합니다',
      content: '상태 좋은 레고 세트입니다. 교환 원합니다.',
      location: '',
      exchangeOption: '교환',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message);
      expect(messages).toContain('거래 희망 장소를 입력해주세요');
    }
  });

  it('교환/나눔 외 옵션을 거부한다', () => {
    const result = createSharingPostSchema.safeParse({
      title: '레고 교환합니다',
      content: '상태 좋은 레고 세트입니다. 교환 원합니다.',
      location: '광주광역시',
      exchangeOption: '판매',
    });

    expect(result.success).toBe(false);
  });

  it('100자 초과 상품명을 거부한다', () => {
    const result = createSharingPostSchema.safeParse({
      title: 'a'.repeat(101),
      content: '내용은 10자 이상 입력합니다.',
      location: '광주광역시',
      exchangeOption: '교환',
    });

    expect(result.success).toBe(false);
  });
});
