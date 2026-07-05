import { createClient } from '@/libs/supabase/client';
import {
  servSignIn,
  servSignUp,
  servCheckUsername,
} from '@/services/auth/auth-services';
import type { MockSupabaseClient } from '../mocks/supabase';


const mockSupabase = createClient() as unknown as MockSupabaseClient;

describe('servSignIn', () => {
  it('로그인 성공 시 데이터를 반환한다', async () => {
    const mockData = {
      user: { id: 'uuid-1', email: 'testuser@example.com' },
      session: { access_token: 'mock-token' },
    };

    mockSupabase.auth.signInWithPassword = vi.fn(() =>
      Promise.resolve({ data: mockData, error: null })
    );

    const result = await servSignIn({
      userID: 'testuser',
      userPassword: 'password123!',
    });

    expect(result.user?.email).toBe('testuser@example.com');
    expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
      email: 'testuser@example.com',
      password: 'password123!',
    });
  });

  it('로그인 실패 시 에러를 던진다', async () => {
    mockSupabase.auth.signInWithPassword = vi.fn(() =>
      Promise.resolve({
        data: { user: null, session: null },
        error: { message: 'Invalid login', status: 400 },
      })
    );

    await expect(
      servSignIn({ userID: 'wrong', userPassword: 'wrong' })
    ).rejects.toThrow();
  });
});

describe('servSignUp', () => {
  it('회원가입 성공 시 데이터를 반환한다', async () => {
    const mockData = {
      user: { id: 'uuid-new', email: 'newuser@example.com' },
      session: null,
    };

    mockSupabase.auth.signUp = vi.fn(() =>
      Promise.resolve({ data: mockData, error: null })
    );

    const result = await servSignUp({
      userID: 'newuser',
      userPassword: 'password123!',
      location: '광주광역시',
    });

    expect(result.user?.email).toBe('newuser@example.com');
  });
});

describe('servCheckUsername', () => {
  it('사용 가능한 아이디일 때 isAvailable을 반환한다', async () => {
    const mockFrom = vi.fn(() => ({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn(() =>
            Promise.resolve({ data: null, error: null })
          ),
        }),
      }),
    }));
    mockSupabase.from = mockFrom;

    const result = await servCheckUsername('newuser');
    expect(result.isAvailable).toBe(true);
  });

  it('중복 아이디일 때 isAvailable이 false이다', async () => {
    const mockFrom = vi.fn(() => ({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn(() =>
            Promise.resolve({ data: { id: 'uuid-1' }, error: null })
          ),
        }),
      }),
    }));
    mockSupabase.from = mockFrom;

    const result = await servCheckUsername('existinguser');
    expect(result.isAvailable).toBe(false);
  });
});
