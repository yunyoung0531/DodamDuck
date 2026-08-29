import { renderWithProviders, screen } from '../test-utils';
import { LinkButton } from '@/components/common/LinkButton';

describe('LinkButton', () => {
  // Base UI Button을 render prop으로 Link로 바꾸면 role="button"이 덮어써진다.
  // 스크린 리더가 "이동"을 "실행"으로 읽게 되므로 링크 시맨틱을 지켜야 한다.
  it('버튼처럼 보여도 링크로 노출된다', () => {
    // Arrange & Act
    renderWithProviders(
      <LinkButton href="/sharing">교환하러 가기</LinkButton>
    );

    // Assert
    const link = screen.getByRole('link', { name: '교환하러 가기' });
    expect(link).toHaveAttribute('href', '/sharing');
    expect(link).not.toHaveAttribute('role');
  });

  it('variant·size·className을 버튼 스타일로 적용한다', () => {
    // Arrange & Act
    renderWithProviders(
      <LinkButton href="/signin" variant="outline" size="sm" className="w-full">
        로그인
      </LinkButton>
    );

    // Assert
    const link = screen.getByRole('link', { name: '로그인' });
    expect(link.className).toContain('w-full');
    expect(link.className).toContain('border-border');
  });
});
