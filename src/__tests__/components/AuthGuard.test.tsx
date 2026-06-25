import { renderWithProviders, screen, waitFor } from '../test-utils';
import { createClient } from '@/libs/supabase/client';
import { useRouter } from 'next/navigation';
import { AuthGuard } from '@/components/common/AuthGuard';
import { createMockUser, createMockProfile } from '../mocks/supabase';
import type { MockSupabaseClient } from '../mocks/supabase';

vi.mock('@/libs/supabase/client');

const mockSupabase = createClient() as unknown as MockSupabaseClient;

describe('AuthGuard', () => {
  it('로딩 중일 때 로더를 표시한다', () => {
    let resolveGetUser: (value: unknown) => void;
    mockSupabase.auth.getUser = vi.fn(
      () =>
        new Promise((resolve) => {
          resolveGetUser = resolve;
        })
    );
    mockSupabase.auth.onAuthStateChange = vi.fn(() => ({
      data: { subscription: { unsubscribe: vi.fn() } },
    }));

    renderWithProviders(
      <AuthGuard>
        <div>보호된 콘텐츠</div>
      </AuthGuard>
    );

    expect(screen.getByText('로딩 중...')).toBeInTheDocument();
    expect(screen.queryByText('보호된 콘텐츠')).not.toBeInTheDocument();

    resolveGetUser!({ data: { user: null }, error: null });
  });

  it('미인증 시 로그인 페이지로 리다이렉트한다', async () => {
    const pushMock = vi.fn();
    vi.mocked(useRouter).mockReturnValue({
      push: pushMock,
      back: vi.fn(),
      replace: vi.fn(),
      refresh: vi.fn(),
      prefetch: vi.fn(),
      forward: vi.fn(),
    });

    mockSupabase.auth.getUser = vi.fn(() =>
      Promise.resolve({ data: { user: null }, error: null })
    );
    mockSupabase.auth.onAuthStateChange = vi.fn(() => ({
      data: { subscription: { unsubscribe: vi.fn() } },
    }));

    renderWithProviders(
      <AuthGuard>
        <div>보호된 콘텐츠</div>
      </AuthGuard>
    );

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith('/signin?callbackUrl=%2F');
    });

    expect(screen.queryByText('보호된 콘텐츠')).not.toBeInTheDocument();
  });

  it('인증됨 상태에서 children을 렌더링한다', async () => {
    const mockUser = createMockUser();
    const mockProfile = createMockProfile();

    mockSupabase.auth.getUser = vi.fn(() =>
      Promise.resolve({ data: { user: mockUser }, error: null })
    );
    mockSupabase.auth.onAuthStateChange = vi.fn(() => ({
      data: { subscription: { unsubscribe: vi.fn() } },
    }));
    mockSupabase.from = vi.fn(() => ({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn(() =>
            Promise.resolve({ data: mockProfile, error: null })
          ),
        }),
      }),
    })) as ReturnType<typeof vi.fn>;

    renderWithProviders(
      <AuthGuard>
        <div>보호된 콘텐츠</div>
      </AuthGuard>
    );

    await waitFor(() => {
      expect(screen.getByText('보호된 콘텐츠')).toBeInTheDocument();
    });
  });
});
