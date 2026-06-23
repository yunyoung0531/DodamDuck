import { z } from 'zod';

export const createBoardPostSchema = z.object({
  title: z.string().min(1, '제목을 입력해주세요').max(100),
  content: z.string().min(10, '내용은 10자 이상 입력해주세요').max(5000),
});

export type CreateBoardPostForm = z.infer<typeof createBoardPostSchema>;
