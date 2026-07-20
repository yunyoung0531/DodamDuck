import { z } from 'zod';

export const generatedPostSchema = z.object({
  title: z.string().describe('브랜드 + 상품명, 30자 이내'),
  content: z.string().describe('상품 설명, 50~200자, 따뜻한 말투'),
  tags: z
    .array(z.string())
    .max(5)
    .describe("관련 키워드 1~5개, '#' 없이"),
});

export type GeneratedPost = z.infer<typeof generatedPostSchema>;
