import { createClient } from '@/libs/supabase/client';
import {
  servSignIn,
  servSignUp,
  servSignOut,
  servCheckUsername,
  servFetchCurrentProfile,
  servUpdateProfile,
  servUpdateProfileImage,
} from '@/services/auth/auth-services';
import { createMockUser, createMockProfile } from '../mocks/supabase';
import type { MockSupabaseClient } from '../mocks/supabase';

vi.mock('@/libs/supabase/storage', () => ({
  uploadImage: vi.fn(() =>
    Promise.resolve('https://test.supabase.co/storage/new-profile.jpg')
  ),
  extractStoragePath: vi.fn(() => 'old-path.jpg'),
  deleteImage: vi.fn(() => Promise.resolve()),
}));


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

describe('servSignOut', () => {
  it('로그아웃에 성공한다', async () => {
    mockSupabase.auth.signOut = vi.fn(() =>
      Promise.resolve({ error: null })
    );

    await expect(servSignOut()).resolves.toBeUndefined();
    expect(mockSupabase.auth.signOut).toHaveBeenCalled();
  });

  it('로그아웃 실패 시 에러를 던진다', async () => {
    mockSupabase.auth.signOut = vi.fn(() =>
      Promise.resolve({ error: { message: 'Sign out failed' } })
    );

    await expect(servSignOut()).rejects.toThrow();
  });
});

describe('servFetchCurrentProfile', () => {
  it('인증된 사용자의 프로필을 반환한다', async () => {
    const mockUser = createMockUser();
    const mockProfile = createMockProfile();

    mockSupabase.auth = {
      getUser: vi.fn(() =>
        Promise.resolve({ data: { user: mockUser }, error: null })
      ),
    } as typeof mockSupabase.auth;

    mockSupabase.from = vi.fn(() => ({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn(() =>
            Promise.resolve({ data: mockProfile, error: null })
          ),
        }),
      }),
    })) as ReturnType<typeof vi.fn>;

    const result = await servFetchCurrentProfile();

    expect(result).not.toBeNull();
    expect(result!.user.id).toBe(mockUser.id);
    expect(result!.profile.username).toBe('testuser');
  });

  it('미인증 사용자는 null을 반환한다', async () => {
    mockSupabase.auth = {
      getUser: vi.fn(() =>
        Promise.resolve({ data: { user: null }, error: null })
      ),
    } as typeof mockSupabase.auth;

    const result = await servFetchCurrentProfile();
    expect(result).toBeNull();
  });
});

describe('servUpdateProfile', () => {
  it('프로필을 업데이트한다', async () => {
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

    await expect(
      servUpdateProfile({
        display_name: '새이름',
        location: '서울특별시',
      })
    ).resolves.toBeUndefined();
  });

  it('미인증 사용자는 에러를 던진다', async () => {
    mockSupabase.auth = {
      getUser: vi.fn(() =>
        Promise.resolve({ data: { user: null }, error: null })
      ),
    } as typeof mockSupabase.auth;

    await expect(
      servUpdateProfile({
        display_name: '새이름',
        location: '서울',
      })
    ).rejects.toThrow('인증이 필요합니다');
  });
});

describe('servUpdateProfileImage', () => {
  it('프로필 이미지를 업데이트하고 URL을 반환한다', async () => {
    const mockUser = createMockUser();

    mockSupabase.auth = {
      getUser: vi.fn(() =>
        Promise.resolve({ data: { user: mockUser }, error: null })
      ),
    } as typeof mockSupabase.auth;

    const eqForSelect = vi.fn().mockReturnValue({
      single: vi.fn(() =>
        Promise.resolve({ data: { profile_url: '' }, error: null })
      ),
    });

    const eqForUpdate = vi.fn(() =>
      Promise.resolve({ error: null })
    );

    let callCount = 0;
    mockSupabase.from = vi.fn(() => {
      callCount++;
      if (callCount === 1) {
        return {
          select: vi.fn().mockReturnValue({ eq: eqForSelect }),
        };
      }
      return {
        update: vi.fn().mockReturnValue({ eq: eqForUpdate }),
      };
    }) as ReturnType<typeof vi.fn>;

    const file = new File(['test'], 'photo.jpg', { type: 'image/jpeg' });
    const result = await servUpdateProfileImage(file);

    expect(result).toBe('https://test.supabase.co/storage/new-profile.jpg');
  });

  it('기존 프로필 이미지가 있으면 삭제를 시도한다', async () => {
    const { deleteImage } = await import('@/libs/supabase/storage');
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
                Promise.resolve({
                  data: { profile_url: 'https://test.supabase.co/object/public/profile-images/old.jpg' },
                  error: null,
                })
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

    const file = new File(['test'], 'photo.jpg', { type: 'image/jpeg' });
    await servUpdateProfileImage(file);

    expect(deleteImage).toHaveBeenCalled();
  });

  it('미인증 사용자는 에러를 던진다', async () => {
    mockSupabase.auth = {
      getUser: vi.fn(() =>
        Promise.resolve({ data: { user: null }, error: null })
      ),
    } as typeof mockSupabase.auth;

    const file = new File(['test'], 'photo.jpg', { type: 'image/jpeg' });
    await expect(servUpdateProfileImage(file)).rejects.toThrow(
      '인증이 필요합니다'
    );
  });
});
