import { renderWithProviders, screen } from '../test-utils';
import { createBrowserSupabase } from '@/libs/supabase/client';
import { Navbar } from '@/components/common/Navbar';
import { createMockProfile, createMockUser } from '../mocks/supabase';
import type { MockSupabaseClient } from '../mocks/supabase';


const mockSupabase = createBrowserSupabase() as unknown as MockSupabaseClient;

describe('Navbar', () => {
  it('로고와 도담덕 텍스트를 표시한다', () => {
    renderWithProviders(<Navbar />);

    expect(screen.getByAltText('도담덕 로고')).toBeInTheDocument();
    expect(screen.getByText('도담덕')).toBeInTheDocument();
  });

  it('5개의 네비게이션 링크를 표시한다', () => {
    renderWithProviders(<Navbar />);

    expect(screen.getByText('장난감 교환')).toBeInTheDocument();
    expect(screen.getByText('장난감 도서관')).toBeInTheDocument();
    expect(screen.getByText('게시판')).toBeInTheDocument();
    expect(screen.getByText('내 상점')).toBeInTheDocument();
    expect(screen.getByText('채팅')).toBeInTheDocument();
  });

  it('미인증 상태에서 로그인 버튼을 표시한다', async () => {
    mockSupabase.auth.getUser = vi.fn(() =>
      Promise.resolve({ data: { user: null }, error: null })
    );

    renderWithProviders(<Navbar />);

    const loginButtons = await screen.findAllByText('로그인');
    expect(loginButtons.length).toBeGreaterThan(0);
  });

  it('인증된 상태에서 사용자 이름과 로그아웃 버튼을 표시한다', async () => {
    const mockUser = createMockUser();
    const mockProfile = createMockProfile({ display_name: '도담이' });

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

    renderWithProviders(<Navbar />);

    const greetings = await screen.findAllByText('도담이님 안녕하세요');
    expect(greetings.length).toBeGreaterThan(0);

    const logoutButtons = screen.getAllByText('로그아웃');
    expect(logoutButtons.length).toBeGreaterThan(0);
  });
});
