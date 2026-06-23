import { z } from 'zod';

export const createSharingPostSchema = z.object({
  title: z.string().min(1, '상품명을 입력해주세요').max(100),
  content: z.string().min(10, '내용은 10자 이상 입력해주세요').max(5000),
  location: z.string().min(1, '거래 희망 장소를 입력해주세요'),
  exchangeOption: z.enum(['교환', '나눔']),
});

export type CreateSharingPostForm = z.infer<typeof createSharingPostSchema>;
