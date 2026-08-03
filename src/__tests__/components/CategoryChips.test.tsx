import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CategoryChips } from '@/components/sharing/CategoryChips';
import { SHARING_CATEGORY } from '@/services/sharing/sharing.types';

describe('CategoryChips', () => {
  it('칩 클릭 시 onChange가 해당 카테고리로 호출된다', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(<CategoryChips value={undefined} onChange={onChange} />);

    await user.click(
      screen.getByRole('button', { name: SHARING_CATEGORY.BLOCKS })
    );

    expect(onChange).toHaveBeenCalledWith(SHARING_CATEGORY.BLOCKS);
  });

  it('includeAll이면 전체 칩이 앞에 붙는다', () => {
    render(
      <CategoryChips
        value={SHARING_CATEGORY.ALL}
        onChange={vi.fn()}
        includeAll
      />
    );

    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(7);
    expect(buttons[0]).toHaveTextContent(SHARING_CATEGORY.ALL);
  });

  it('선택된 칩만 aria-pressed가 true다', () => {
    render(
      <CategoryChips value={SHARING_CATEGORY.RIDE} onChange={vi.fn()} />
    );

    expect(
      screen.getByRole('button', { name: SHARING_CATEGORY.RIDE })
    ).toHaveAttribute('aria-pressed', 'true');
    expect(
      screen.getByRole('button', { name: SHARING_CATEGORY.BOOK })
    ).toHaveAttribute('aria-pressed', 'false');
  });
});
