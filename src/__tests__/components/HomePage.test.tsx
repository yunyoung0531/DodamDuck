import { renderWithProviders, screen } from '../test-utils';
import HomePage from '@/app/page';

describe('HomePage', () => {
  it('도담덕 텍스트를 표시한다', () => {
    renderWithProviders(<HomePage />);

    expect(screen.getByText('도담덕')).toBeInTheDocument();
  });

  it('서비스 설명 텍스트를 표시한다', () => {
    renderWithProviders(<HomePage />);

    expect(
      screen.getByText('유아용품 교환 & 나눔 플랫폼')
    ).toBeInTheDocument();
  });
});
