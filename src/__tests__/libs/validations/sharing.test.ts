import { createSharingPostSchema } from '@/libs/validations/sharing';
import {
  SHARING_CATEGORY,
  SHARING_CATEGORY_VALUES,
} from '@/services/sharing/sharing.types';

describe('createSharingPostSchema', () => {
  it('유효한 교환 게시글 데이터를 통과시킨다', () => {
    const result = createSharingPostSchema.safeParse({
      title: '레고 교환합니다',
      content: '상태 좋은 레고 세트입니다. 교환 원합니다.',
      location: '광주광역시 북구',
      exchangeOption: '교환',
      category: SHARING_CATEGORY.BLOCKS,
    });

    expect(result.success).toBe(true);
  });

  it('유효한 나눔 게시글 데이터를 통과시킨다', () => {
    const result = createSharingPostSchema.safeParse({
      title: '인형 나눔합니다',
      content: '사용감 있지만 깨끗한 인형입니다. 나눔합니다.',
      location: '서울특별시 강남구',
      exchangeOption: '나눔',
      category: SHARING_CATEGORY.ROLEPLAY,
    });

    expect(result.success).toBe(true);
  });

  it('빈 상품명을 거부한다', () => {
    const result = createSharingPostSchema.safeParse({
      title: '',
      content: '내용은 10자 이상 입력합니다.',
      location: '광주광역시',
      exchangeOption: '교환',
      category: SHARING_CATEGORY.BLOCKS,
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
      category: SHARING_CATEGORY.BLOCKS,
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
      category: SHARING_CATEGORY.BLOCKS,
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
      category: SHARING_CATEGORY.BLOCKS,
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.map((i) => i.path[0])).toEqual([
        'exchangeOption',
      ]);
    }
  });

  it('100자 초과 상품명을 거부한다', () => {
    const result = createSharingPostSchema.safeParse({
      title: 'a'.repeat(101),
      content: '내용은 10자 이상 입력합니다.',
      location: '광주광역시',
      exchangeOption: '교환',
      category: SHARING_CATEGORY.BLOCKS,
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.map((i) => i.path[0])).toEqual(['title']);
    }
  });

  it('카테고리 누락을 거부한다', () => {
    const result = createSharingPostSchema.safeParse({
      title: '레고 교환합니다',
      content: '상태 좋은 레고 세트입니다. 교환 원합니다.',
      location: '광주광역시',
      exchangeOption: '교환',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.map((i) => i.path[0])).toEqual(['category']);
      expect(result.error.issues[0]!.message).toBe('카테고리를 선택해주세요');
    }
  });

  it('UI 전용 값인 전체를 카테고리로 거부한다', () => {
    const result = createSharingPostSchema.safeParse({
      title: '레고 교환합니다',
      content: '상태 좋은 레고 세트입니다. 교환 원합니다.',
      location: '광주광역시',
      exchangeOption: '교환',
      category: SHARING_CATEGORY.ALL,
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.map((i) => i.path[0])).toEqual(['category']);
    }
  });

  it('정의되지 않은 카테고리를 거부한다', () => {
    const result = createSharingPostSchema.safeParse({
      title: '레고 교환합니다',
      content: '상태 좋은 레고 세트입니다. 교환 원합니다.',
      location: '광주광역시',
      exchangeOption: '교환',
      category: '유모차·카시트',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.map((i) => i.path[0])).toEqual(['category']);
    }
  });

  it('카테고리 6종을 모두 통과시킨다', () => {
    for (const category of SHARING_CATEGORY_VALUES) {
      const result = createSharingPostSchema.safeParse({
        title: '레고 교환합니다',
        content: '상태 좋은 레고 세트입니다. 교환 원합니다.',
        location: '광주광역시',
        exchangeOption: '교환',
        category,
      });

      expect(result.success).toBe(true);
    }
  });
});

describe('SHARING_CATEGORY_VALUES', () => {
  it('DB CHECK 제약과 같은 6종이며 전체를 포함하지 않는다', () => {
    expect(SHARING_CATEGORY_VALUES).toHaveLength(6);
    expect(SHARING_CATEGORY_VALUES).not.toContain(SHARING_CATEGORY.ALL);
  });

  // DB CHECK 제약은 U+00B7(MIDDLE DOT)로 저장돼 있다.
  // 눈으로 구분되지 않는 U+30FB 등이 섞이면 INSERT 시 CHECK 위반이 난다.
  it('구분점으로 U+00B7만 사용한다', () => {
    const CONFUSABLES = ['・', '•', '･', '‧', '⋅'];

    for (const value of SHARING_CATEGORY_VALUES) {
      for (const confusable of CONFUSABLES) {
        expect(value.includes(confusable)).toBe(false);
      }
    }

    const withMiddleDot = SHARING_CATEGORY_VALUES.filter((value) =>
      [...value].some((char) => char.codePointAt(0) === 0x00b7)
    );

    expect(withMiddleDot).toHaveLength(5);
  });
});
