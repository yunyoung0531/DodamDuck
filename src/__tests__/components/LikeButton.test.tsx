import userEvent from '@testing-library/user-event';
import { renderWithProviders, screen, waitFor } from '../test-utils';
import { createBrowserSupabase } from '@/libs/supabase/client';
import { LikeButton } from '@/components/common/LikeButton';
import { createMockUser, createMockProfile } from '../mocks/supabase';
import type { MockSupabaseClient } from '../mocks/supabase';

const mockPush = vi.fn();

vi.mocked(await import('next/navigation')).useRouter.mockReturnValue({
  push: mockPush,
  back: vi.fn(),
  replace: vi.fn(),
  refresh: vi.fn(),
  prefetch: vi.fn(),
  forward: vi.fn(),
});

const mockSupabase = createBrowserSupabase() as unknown as MockSupabaseClient;

function setupUnauthenticated() {
  mockSupabase.auth = {
    getUser: vi.fn(() =>
      Promise.resolve({ data: { user: null }, error: null })
    ),
    onAuthStateChange: vi.fn(() => ({
      data: { subscription: { unsubscribe: vi.fn() } },
    })),
  } as typeof mockSupabase.auth;
}

function setupAuthenticated() {
  const mockUser = createMockUser();
  const mockProfile = createMockProfile();

  mockSupabase.auth = {
    getUser: vi.fn(() =>
      Promise.resolve({ data: { user: mockUser }, error: null })
    ),
    onAuthStateChange: vi.fn(() => ({
      data: { subscription: { unsubscribe: vi.fn() } },
    })),
  } as typeof mockSupabase.auth;

  mockSupabase.from = vi.fn(() => ({
    select: vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        single: vi.fn(() =>
          Promise.resolve({ data: mockProfile, error: null })
        ),
        then: vi.fn((cb: (val: { data: { post_id: number }[]; error: null }) => void) =>
          cb({ data: [], error: null })
        ),
      }),
    }),
  })) as ReturnType<typeof vi.fn>;

  mockSupabase.rpc = vi.fn(() =>
    Promise.resolve({ data: true, error: null })
  ) as ReturnType<typeof vi.fn>;
}

describe('LikeButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('하트 아이콘과 좋아요 카운트를 표시한다', () => {
    setupUnauthenticated();

    renderWithProviders(
      <LikeButton postId={1} likeCount={5} />
    );

    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '좋아요' })).toBeInTheDocument();
  });

  it('좋아요 카운트가 0일 때도 표시한다', () => {
    setupUnauthenticated();

    renderWithProviders(
      <LikeButton postId={1} likeCount={0} />
    );

    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('비인증 사용자가 클릭하면 /signin으로 이동한다', async () => {
    setupUnauthenticated();

    const user = userEvent.setup();
    renderWithProviders(
      <LikeButton postId={1} likeCount={3} />
    );

    await user.click(screen.getByRole('button', { name: '좋아요' }));

    expect(mockPush).toHaveBeenCalledWith('/signin');
  });

  it('인증된 사용자가 클릭하면 /signin으로 이동하지 않는다', async () => {
    setupAuthenticated();

    const user = userEvent.setup();
    renderWithProviders(
      <LikeButton postId={42} likeCount={3} />
    );

    await waitFor(() => {
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /좋아요/ }));

    expect(mockPush).not.toHaveBeenCalledWith('/signin');
  });

  it('stopPropagation으로 부모 클릭 이벤트를 차단한다', async () => {
    setupUnauthenticated();

    const parentClick = vi.fn();
    const user = userEvent.setup();

    renderWithProviders(
      <div onClick={parentClick}>
        <LikeButton postId={1} likeCount={0} />
      </div>
    );

    await user.click(screen.getByRole('button', { name: '좋아요' }));

    expect(parentClick).not.toHaveBeenCalled();
  });
});
