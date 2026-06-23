import { z } from 'zod';

export const loginSchema = z.object({
  userID: z.string().min(1, '아이디를 입력해주세요'),
  userPassword: z.string().min(1, '비밀번호를 입력해주세요'),
});

export type LoginForm = z.infer<typeof loginSchema>;

const SPECIAL_CHAR_REGEX = /[`!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~]/;

export const signupSchema = z.object({
  userID: z.string().min(1, '아이디를 입력해주세요'),
  userPassword: z
    .string()
    .min(8, '비밀번호는 8자 이상이어야 합니다')
    .regex(SPECIAL_CHAR_REGEX, '특수문자를 포함해야 합니다'),
  location: z.string().min(1, '주소를 입력해주세요'),
  agree: z.boolean().refine((v) => v, '약관에 동의해주세요'),
});

export type SignupForm = z.infer<typeof signupSchema>;
