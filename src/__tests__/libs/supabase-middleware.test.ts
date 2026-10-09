import { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { updateSession } from '@/libs/supabase/middleware';

vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn(),
}));

function mockUser(user: { id: string } | null) {
  vi.mocked(createServerClient).mockReturnValue({
    auth: {
      getUser: () => Promise.resolve({ data: { user }, error: null }),
    },
  } as unknown as ReturnType<typeof createServerClient>);
}

function request(path: string) {
  return new NextRequest(new URL(path, 'http://localhost:3000'));
}

describe('updateSession', () => {
  it('로그인한 사용자가 /signin에 오면 callbackUrl로 보낸다', async () => {
    mockUser({ id: 'u1' });

    const response = await updateSession(
      request('/signin?callbackUrl=/sharing')
    );

    expect(response.headers.get('location')).toBe(
      'http://localhost:3000/sharing'
    );
  });

  it('로그인한 사용자가 /signup에 오면 외부 callbackUrl은 무시하고 홈으로 보낸다', async () => {
    mockUser({ id: 'u1' });

    const response = await updateSession(
      request('/signup?callbackUrl=//evil.com')
    );

    expect(response.headers.get('location')).toBe('http://localhost:3000/');
  });

  it('로그인하지 않은 사용자는 /signin을 그대로 본다', async () => {
    mockUser(null);

    const response = await updateSession(request('/signin'));

    expect(response.headers.get('location')).toBeNull();
  });
});
