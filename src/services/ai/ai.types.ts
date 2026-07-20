import type { GeneratedPost } from '@/libs/validations/ai';

export interface GeneratePostRequest {
  imageBase64: string;
  mimeType: string;
}

export interface GeneratePostResponse {
  data: GeneratedPost;
}
