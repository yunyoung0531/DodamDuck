import { QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createTestQueryClient } from '../test-utils';
import { createMockProfile } from '../mocks/supabase';
import { createBrowserSupabase } from '@/libs/supabase/client';
import { SharingWriteButton } from '@/components/sharing/SharingWriteButton';
import type { CurrentProfile } from '@/services/auth/auth.types';
import type { MockSupabaseClient } from '../mocks/supabase';

const DAY_MS = 24 * 60 * 60 * 1000;
const mockSupabase = createBrowserSupabase() as unknown as MockSupabaseClient;

function renderWithProfile(currentProfile: CurrentProfile | null) {
  const queryClient = createTestQueryClient();
  queryClient.setQueryData(['auth', 'currentProfile'], currentProfile);
  render(
    <QueryClientProvider client={queryClient}>
      <SharingWriteButton size="sm">글쓰기</SharingWriteButton>
    </QueryClientProvider>
  );
}

function signedIn(verifiedAt: string | null): CurrentProfile {
  return {
    user: { id: 'test-uuid-1', email: 'testuser@dodamduck.app' },
    profile: createMockProfile({
      verified_region_code: verifiedAt ? '1230059000' : null,
      verified_at: verifiedAt,
    }),
  };
}

beforeEach(() => {
  mockSupabase.auth = {
    ...mockSupabase.auth,
    onAuthStateChange: vi.fn(() => ({
      data: { subscription: { unsubscribe: vi.fn() } },
    })),
  };
});

describe('SharingWriteButton', () => {
  it('로그인하지 않았으면 글쓰기 링크로 둔다', () => {
    renderWithProfile(null);

    expect(screen.getByRole('link', { name: '글쓰기' })).toHaveAttribute(
      'href',
      '/sharing/new'
    );
  });

  it('인증이 유효하면 글쓰기 링크로 둔다', () => {
    renderWithProfile(signedIn(new Date(Date.now() - DAY_MS).toISOString()));

    expect(screen.getByRole('link', { name: '글쓰기' })).toHaveAttribute(
      'href',
      '/sharing/new'
    );
  });

  it('인증한 적이 없으면 누를 때 인증 안내를 연다', async () => {
    const user = userEvent.setup();
    renderWithProfile(signedIn(null));

    expect(
      screen.queryByRole('link', { name: '글쓰기' })
    ).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '글쓰기' }));

    expect(
      await screen.findByText('동네 인증이 필요합니다')
    ).toBeInTheDocument();
  });

  it('인증이 만료되었으면 누를 때 인증 안내를 연다', async () => {
    const user = userEvent.setup();
    renderWithProfile(
      signedIn(new Date(Date.now() - 31 * DAY_MS).toISOString())
    );

    await user.click(screen.getByRole('button', { name: '글쓰기' }));

    expect(
      await screen.findByText('동네 인증이 필요합니다')
    ).toBeInTheDocument();
  });

  it('안내에서 동네 인증을 누르면 인증 패널로 바뀐다', async () => {
    const user = userEvent.setup();
    renderWithProfile(signedIn(null));

    await user.click(screen.getByRole('button', { name: '글쓰기' }));
    await user.click(await screen.findByRole('button', { name: '동네 인증' }));

    expect(
      await screen.findByRole('button', { name: '현재 위치로 동네 찾기' })
    ).toBeInTheDocument();
  });
});
