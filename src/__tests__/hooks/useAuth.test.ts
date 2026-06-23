import { createClient } from '@/libs/supabase/client';
import { renderHookWithProviders, waitFor } from '../test-utils';
import { useSignIn, useSignUp, useCheckUsername } from '@/services/auth/useAuth';
import type { MockSupabaseClient } from '../mocks/supabase';

vi.mock('@/libs/supabase/client');

const mockSupabase = createClient() as unknown as MockSupabaseClient;

describe('useSignIn', () => {
  it('로그인 성공 시 데이터를 반환한다', async () => {
    const mockData = {
      user: { id: 'uuid-1', email: 'testuser@dodamduck.app' },
      session: { access_token: 'mock-token' },
    };

    mockSupabase.auth.signInWithPassword = vi.fn(() =>
      Promise.resolve({ data: mockData, error: null })
    );

    const { result } = renderHookWithProviders(() => useSignIn());

    result.current.mutate({
      userID: 'testuser',
      userPassword: 'password123!',
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.user?.email).toBe('testuser@dodamduck.app');
  });
});

describe('useSignUp', () => {
  it('회원가입 성공 시 데이터를 반환한다', async () => {
    const mockData = {
      user: { id: 'uuid-new', email: 'newuser@dodamduck.app' },
      session: null,
    };

    mockSupabase.auth.signUp = vi.fn(() =>
      Promise.resolve({ data: mockData, error: null })
    );

    const { result } = renderHookWithProviders(() => useSignUp());

    result.current.mutate({
      userID: 'newuser',
      userPassword: 'password123!',
      location: '광주광역시',
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.user?.email).toBe('newuser@dodamduck.app');
  });
});

describe('useCheckUsername', () => {
  it('아이디가 비어있으면 쿼리를 실행하지 않는다', () => {
    const { result } = renderHookWithProviders(() => useCheckUsername(''));

    expect(result.current.isFetching).toBe(false);
  });
});
