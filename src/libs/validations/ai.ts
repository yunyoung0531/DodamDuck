import { z } from 'zod';
import {
  MAX_TAG_COUNT,
  SHARING_CATEGORY_VALUES,
} from '@/services/sharing/sharing.types';

export const generatedPostSchema = z.object({
  title: z.string().describe('브랜드 + 상품명, 30자 이내'),
  content: z.string().describe('상품 설명, 50~200자, 따뜻한 말투'),
  tags: z
    .array(z.string())
    .max(MAX_TAG_COUNT)
    .describe(`관련 키워드 1~${MAX_TAG_COUNT}개, '#' 없이`),
  category: z
    .enum(SHARING_CATEGORY_VALUES)
    .describe(
      `다음 중 하나를 글자 그대로: ${SHARING_CATEGORY_VALUES.join(' / ')}`
    ),
});

export type GeneratedPost = z.infer<typeof generatedPostSchema>;
