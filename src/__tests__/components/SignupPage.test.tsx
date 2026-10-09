import userEvent from '@testing-library/user-event';
import { renderWithProviders, screen, waitFor } from '../test-utils';
import { useRouter, useSearchParams } from 'next/navigation';
import { createBrowserSupabase } from '@/libs/supabase/client';
import SignupPage from '@/app/signup/page';
import { createMockUser } from '../mocks/supabase';
import type { MockSupabaseClient } from '../mocks/supabase';

const mockPush = vi.fn();
const mockRefresh = vi.fn();
const mockSupabase = createBrowserSupabase() as unknown as MockSupabaseClient;

vi.mocked(useRouter).mockReturnValue({
  push: mockPush,
  refresh: mockRefresh,
  back: vi.fn(),
  replace: vi.fn(),
  prefetch: vi.fn(),
  forward: vi.fn(),
});

function setCallbackUrl(callbackUrl: string) {
  vi.mocked(useSearchParams).mockReturnValue(
    new URLSearchParams({ callbackUrl }) as ReturnType<typeof useSearchParams>
  );
}

async function submitSignup() {
  const user = userEvent.setup();
  renderWithProviders(<SignupPage />);

  await user.type(screen.getByLabelText('아이디'), 'newuser');
  await user.click(screen.getByRole('button', { name: '중복확인' }));
  await screen.findByText('사용 가능한 아이디입니다.');
  await user.type(screen.getByLabelText('비밀번호'), 'password!1');
  await user.click(screen.getByRole('checkbox'));
  await user.click(screen.getByRole('button', { name: '회원가입' }));
}

describe('SignupPage', () => {
  beforeEach(() => {
    mockPush.mockClear();
    mockRefresh.mockClear();
  });

  it('가입과 함께 로그인되면 callbackUrl로 이동한다', async () => {
    setCallbackUrl('/sharing');
    mockSupabase.auth.signUp = vi.fn(() =>
      Promise.resolve({
        data: { user: createMockUser(), session: { access_token: 't' } },
        error: null,
      })
    );

    await submitSignup();

    await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/sharing'));
    expect(mockRefresh).toHaveBeenCalled();
  });

  it('세션이 없으면 callbackUrl을 유지한 채 로그인 화면으로 보낸다', async () => {
    setCallbackUrl('/sharing');
    mockSupabase.auth.signUp = vi.fn(() =>
      Promise.resolve({
        data: { user: createMockUser(), session: null },
        error: null,
      })
    );

    await submitSignup();

    await waitFor(() =>
      expect(mockPush).toHaveBeenCalledWith('/signin?callbackUrl=%2Fsharing')
    );
  });

  it('로그인 링크에 callbackUrl을 이어 붙인다', () => {
    setCallbackUrl('/board/3');

    renderWithProviders(<SignupPage />);

    expect(screen.getByRole('link', { name: '로그인' })).toHaveAttribute(
      'href',
      '/signin?callbackUrl=%2Fboard%2F3'
    );
  });
});
