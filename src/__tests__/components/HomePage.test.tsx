import { renderWithProviders, screen } from '../test-utils';
import HomePage from '@/app/page';

vi.mock('@/components/landing/useToyPhysics', () => ({
  useToyPhysics: vi.fn(),
  usePrefersReducedMotion: vi.fn(() => false),
}));

describe('HomePage', () => {
  it('히어로 제목을 표시한다', () => {
    renderWithProviders(<HomePage />);

    expect(screen.getByText('어제의 장난감, 오늘의 행복')).toBeInTheDocument();
  });

  it('서비스 설명 텍스트를 표시한다', () => {
    renderWithProviders(<HomePage />);

    expect(
      screen.getByText('여기에서 시작하는 작은 교환,')
    ).toBeInTheDocument();
    expect(
      screen.getByText('큰 행복으로 연결됩니다.')
    ).toBeInTheDocument();
  });
});
