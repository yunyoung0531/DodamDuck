import { loginSchema, signupSchema } from '@/libs/validations/auth';

describe('loginSchema', () => {
  it('유효한 로그인 데이터를 통과시킨다', () => {
    const result = loginSchema.safeParse({
      userID: 'testuser',
      userPassword: 'password123!',
    });

    expect(result.success).toBe(true);
  });

  it('빈 아이디를 거부한다', () => {
    const result = loginSchema.safeParse({
      userID: '',
      userPassword: 'password123!',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]!.message).toBe('아이디를 입력해주세요');
    }
  });

  it('빈 비밀번호를 거부한다', () => {
    const result = loginSchema.safeParse({
      userID: 'testuser',
      userPassword: '',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]!.message).toBe('비밀번호를 입력해주세요');
    }
  });
});

describe('signupSchema', () => {
  it('유효한 회원가입 데이터를 통과시킨다', () => {
    const result = signupSchema.safeParse({
      userID: 'newuser',
      userPassword: 'password123!',
      location: '광주광역시',
      agree: true,
    });

    expect(result.success).toBe(true);
  });

  it('8자 미만 비밀번호를 거부한다', () => {
    const result = signupSchema.safeParse({
      userID: 'newuser',
      userPassword: 'short!',
      location: '광주광역시',
      agree: true,
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message);
      expect(messages).toContain('비밀번호는 8자 이상이어야 합니다');
    }
  });

  it('특수문자 없는 비밀번호를 거부한다', () => {
    const result = signupSchema.safeParse({
      userID: 'newuser',
      userPassword: 'password1234',
      location: '광주광역시',
      agree: true,
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message);
      expect(messages).toContain('특수문자를 포함해야 합니다');
    }
  });

  it('빈 주소를 거부한다', () => {
    const result = signupSchema.safeParse({
      userID: 'newuser',
      userPassword: 'password123!',
      location: '',
      agree: true,
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message);
      expect(messages).toContain('주소를 입력해주세요');
    }
  });

  it('약관 미동의를 거부한다', () => {
    const result = signupSchema.safeParse({
      userID: 'newuser',
      userPassword: 'password123!',
      location: '광주광역시',
      agree: false,
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message);
      expect(messages).toContain('약관에 동의해주세요');
    }
  });
});
