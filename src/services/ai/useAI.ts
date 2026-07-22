import { useMutation } from '@tanstack/react-query';
import { servGeneratePostFromImage } from './ai-services';
import { AI_MUTATION_KEYS } from './queries';
import type { GeneratePostRequest } from './ai.types';

export function useGeneratePost() {
  return useMutation({
    mutationKey: AI_MUTATION_KEYS.generatePost,
    mutationFn: (request: GeneratePostRequest) =>
      servGeneratePostFromImage(request),
  });
}
