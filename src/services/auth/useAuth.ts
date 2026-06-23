import { useQuery, useMutation } from '@tanstack/react-query';
import { authQueries } from './queries';
import { servSignIn, servSignUp, servSignOut } from './auth-services';
import type { SignInRequest, SignUpRequest } from './auth.types';

export function useCheckUsername(username: string) {
  return useQuery(authQueries.checkUsername(username));
}

export function useSignIn() {
  return useMutation({
    mutationFn: (request: SignInRequest) => servSignIn(request),
  });
}

export function useSignUp() {
  return useMutation({
    mutationFn: (request: SignUpRequest) => servSignUp(request),
  });
}

export function useSignOut() {
  return useMutation({
    mutationFn: () => servSignOut(),
  });
}
