import type { Profile } from '@/services/auth/auth.types';

/**
 * Supabase 클라이언트 목 타입.
 * vi.mocked(createClient)() 대신 createClient() as unknown as MockSupabaseClient
 * 패턴으로 사용하여 Supabase SDK의 엄격한 제네릭 타입 충돌을 우회한다.
 */
export interface MockSupabaseAuth {
  getUser: ReturnType<typeof vi.fn>;
  onAuthStateChange: ReturnType<typeof vi.fn>;
  signInWithPassword: ReturnType<typeof vi.fn>;
  signUp: ReturnType<typeof vi.fn>;
  signOut: ReturnType<typeof vi.fn>;
}

export interface MockSupabaseClient {
  auth: MockSupabaseAuth;
  from: ReturnType<typeof vi.fn>;
  rpc: ReturnType<typeof vi.fn>;
  storage: {
    from: ReturnType<typeof vi.fn>;
  };
  channel: ReturnType<typeof vi.fn>;
  removeChannel: ReturnType<typeof vi.fn>;
}

export function createMockProfile(
  overrides?: Partial<Profile>
): Profile {
  return {
    id: 'test-uuid-1',
    username: 'testuser',
    display_name: '테스트유저',
    location: '광주광역시',
    profile_url: '',
    level: 1,
    verification_count: 0,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    ...overrides,
  };
}

export function createMockUser(overrides?: Record<string, unknown>) {
  return {
    id: 'test-uuid-1',
    email: 'testuser@dodamduck.app',
    app_metadata: {},
    user_metadata: {
      username: 'testuser',
      display_name: '테스트유저',
      location: '광주광역시',
    },
    aud: 'authenticated',
    created_at: '2024-01-01T00:00:00Z',
    ...overrides,
  };
}

interface MockChainResult {
  data: unknown;
  error: null;
}

export function createMockSupabaseClient(
  overrides?: Record<string, unknown>
) {
  const defaultResult: MockChainResult = { data: null, error: null };

  const chainMethods = {
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    neq: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    or: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    single: vi.fn(() => Promise.resolve(defaultResult)),
    maybeSingle: vi.fn(() => Promise.resolve(defaultResult)),
    then: vi.fn((cb: (val: MockChainResult) => void) => cb(defaultResult)),
  };

  return {
    auth: {
      getUser: vi.fn(() =>
        Promise.resolve({ data: { user: null }, error: null })
      ),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } },
      })),
      signInWithPassword: vi.fn(() =>
        Promise.resolve({ data: { user: createMockUser() }, error: null })
      ),
      signUp: vi.fn(() =>
        Promise.resolve({ data: { user: createMockUser() }, error: null })
      ),
      signOut: vi.fn(() => Promise.resolve({ error: null })),
    },
    from: vi.fn(() => chainMethods),
    rpc: vi.fn(() => Promise.resolve(defaultResult)),
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn(() =>
          Promise.resolve({ data: { path: 'test.jpg' }, error: null })
        ),
        getPublicUrl: vi.fn(() => ({
          data: { publicUrl: 'https://test.supabase.co/storage/test.jpg' },
        })),
        remove: vi.fn(() => Promise.resolve({ data: [], error: null })),
      })),
    },
    channel: vi.fn(() => ({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn(),
      unsubscribe: vi.fn(),
    })),
    removeChannel: vi.fn(),
    ...overrides,
  };
}
