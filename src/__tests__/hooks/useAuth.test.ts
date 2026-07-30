import { createClient } from '@/libs/supabase/client';
import { renderHookWithProviders, waitFor } from '../test-utils';
import {
  useSignIn,
  useSignUp,
  useSignOut,
  useCheckUsername,
  useUpdateProfile,
  useUpdateProfileImage,
} from '@/services/auth/useAuth';
import { createMockUser } from '../mocks/supabase';
import type { MockSupabaseClient } from '../mocks/supabase';

vi.mock('@/libs/supabase/storage', () => ({
  uploadImage: vi.fn(() =>
    Promise.resolve('https://test.supabase.co/storage/new-profile.jpg')
  ),
  extractStoragePath: vi.fn(() => 'old-path.jpg'),
  deleteImage: vi.fn(() => Promise.resolve()),
}));


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

describe('useSignOut', () => {
  it('로그아웃 mutation이 성공한다', async () => {
    mockSupabase.auth.signOut = vi.fn(() =>
      Promise.resolve({ error: null })
    );

    const { result } = renderHookWithProviders(() => useSignOut());

    result.current.mutate();

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });
});

describe('useUpdateProfile', () => {
  it('프로필 업데이트 mutation이 성공한다', async () => {
    const mockUser = createMockUser();
    mockSupabase.auth = {
      getUser: vi.fn(() =>
        Promise.resolve({ data: { user: mockUser }, error: null })
      ),
    } as typeof mockSupabase.auth;

    mockSupabase.from = vi.fn(() => ({
      update: vi.fn().mockReturnValue({
        eq: vi.fn(() => Promise.resolve({ error: null })),
      }),
    })) as ReturnType<typeof vi.fn>;

    const { result } = renderHookWithProviders(() => useUpdateProfile());

    result.current.mutate({
      display_name: '새이름',
      location: '서울특별시',
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });
});

describe('useUpdateProfileImage', () => {
  it('프로필 이미지 업데이트 mutation이 성공한다', async () => {
    const mockUser = createMockUser();
    mockSupabase.auth = {
      getUser: vi.fn(() =>
        Promise.resolve({ data: { user: mockUser }, error: null })
      ),
    } as typeof mockSupabase.auth;

    let callCount = 0;
    mockSupabase.from = vi.fn(() => {
      callCount++;
      if (callCount === 1) {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn(() =>
                Promise.resolve({ data: { profile_url: '' }, error: null })
              ),
            }),
          }),
        };
      }
      return {
        update: vi.fn().mockReturnValue({
          eq: vi.fn(() => Promise.resolve({ error: null })),
        }),
      };
    }) as ReturnType<typeof vi.fn>;

    const { result } = renderHookWithProviders(() => useUpdateProfileImage());

    result.current.mutate(
      new File(['test'], 'photo.jpg', { type: 'image/jpeg' })
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });
});
