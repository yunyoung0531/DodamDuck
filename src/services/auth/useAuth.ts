import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authQueries } from './queries';
import {
  servSignIn,
  servSignUp,
  servSignOut,
  servUpdateProfile,
  servUpdateProfileImage,
} from './auth-services';
import type {
  SignInRequest,
  SignUpRequest,
  UpdateProfileRequest,
} from './auth.types';

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
    meta: { errorTitle: '로그아웃 실패' },
  });
}

/**
 * 로그아웃 후 홈으로 이동하고 서버 컴포넌트를 다시 그립니다.
 * `refresh()`가 없으면 세션이 남아있는 상태로 렌더된 서버 컴포넌트가 그대로 보입니다.
 */
export function useLogout() {
  const router = useRouter();
  const signOut = useSignOut();

  return async function logout() {
    await signOut.mutateAsync();
    router.push('/');
    router.refresh();
  };
}

export function useUpdateProfileImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => servUpdateProfileImage(file),
    meta: { errorTitle: '프로필 사진 업로드 실패' },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: authQueries.currentProfile().queryKey,
      });
    },
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: UpdateProfileRequest) => {
      if (request.profileImage) {
        await servUpdateProfileImage(request.profileImage);
      }
      await servUpdateProfile({
        display_name: request.display_name,
      });
    },
    meta: { errorTitle: '프로필 수정 실패' },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: authQueries.currentProfile().queryKey,
      });
    },
  });
}
