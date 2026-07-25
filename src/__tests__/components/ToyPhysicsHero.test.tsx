import { renderWithProviders, screen } from '../test-utils';
import ToyPhysicsHero from '@/components/landing/ToyPhysicsHero';
import {
  usePrefersReducedMotion,
  useToyPhysics,
} from '@/components/landing/useToyPhysics';

vi.mock('@/components/landing/useToyPhysics', () => ({
  useToyPhysics: vi.fn(),
  usePrefersReducedMotion: vi.fn(() => false),
}));

describe('ToyPhysicsHero', () => {
  beforeEach(() => {
    vi.mocked(usePrefersReducedMotion).mockReturnValue(false);
    vi.mocked(useToyPhysics).mockClear();
  });

  it('히어로 제목과 서브 카피를 표시한다', () => {
    renderWithProviders(<ToyPhysicsHero />);

    expect(
      screen.getByText('어제의 장난감, 오늘의 행복')
    ).toBeInTheDocument();
    expect(
      screen.getByText('여기에서 시작하는 작은 교환,')
    ).toBeInTheDocument();
    expect(screen.getByText('큰 행복으로 연결됩니다.')).toBeInTheDocument();
  });

  it('교환하러 가기 CTA가 /sharing으로 연결된다', () => {
    renderWithProviders(<ToyPhysicsHero />);

    expect(
      screen.getByRole('link', { name: '교환하러 가기' })
    ).toHaveAttribute('href', '/sharing');
  });

  it('물리 시뮬레이션 컨테이너를 렌더링하고 훅을 활성화한다', () => {
    renderWithProviders(<ToyPhysicsHero />);

    expect(screen.getByTestId('toy-physics-canvas')).toBeInTheDocument();
    expect(vi.mocked(useToyPhysics)).toHaveBeenCalledWith(
      expect.anything(),
      true
    );
  });

  it('모션 최소화 설정 시 정적 장난감 폴백을 표시한다', () => {
    vi.mocked(usePrefersReducedMotion).mockReturnValue(true);

    const { container } = renderWithProviders(<ToyPhysicsHero />);

    expect(
      screen.queryByTestId('toy-physics-canvas')
    ).not.toBeInTheDocument();
    expect(container.querySelectorAll('img').length).toBeGreaterThan(0);
    expect(vi.mocked(useToyPhysics)).toHaveBeenCalledWith(
      expect.anything(),
      false
    );
  });
});
