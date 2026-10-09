import userEvent from '@testing-library/user-event';
import { renderWithProviders, screen } from '../test-utils';
import { NeighborhoodRequiredNotice } from '@/app/sharing/new/components/NeighborhoodRequiredNotice';

const mockPush = vi.fn();

vi.mocked(await import('next/navigation')).useRouter.mockReturnValue({
  push: mockPush,
  back: vi.fn(),
  replace: vi.fn(),
  refresh: vi.fn(),
  prefetch: vi.fn(),
  forward: vi.fn(),
});

afterEach(() => {
  mockPush.mockClear();
});

describe('NeighborhoodRequiredNotice', () => {
  it('들어오자마자 이전과 동네 인증 버튼이 있는 안내 모달을 띄운다', () => {
    renderWithProviders(<NeighborhoodRequiredNotice />);

    expect(
      screen.getByRole('dialog', { name: '동네 인증이 필요합니다' })
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '이전' })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: '동네 인증' })
    ).toBeInTheDocument();
  });

  it('이전을 누르면 교환/나눔 목록으로 간다', async () => {
    const user = userEvent.setup();
    renderWithProviders(<NeighborhoodRequiredNotice />);

    await user.click(screen.getByRole('button', { name: '이전' }));

    expect(mockPush).toHaveBeenCalledWith('/sharing');
  });

  it('동네 인증을 누르면 모달 안에서 인증 패널로 바뀐다', async () => {
    const user = userEvent.setup();
    renderWithProviders(<NeighborhoodRequiredNotice />);

    await user.click(screen.getByRole('button', { name: '동네 인증' }));

    expect(
      await screen.findByRole('button', { name: '현재 위치로 동네 찾기' })
    ).toBeInTheDocument();
  });
});
