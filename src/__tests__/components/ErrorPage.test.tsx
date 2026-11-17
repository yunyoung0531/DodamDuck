import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import ErrorPage from '@/app/error';
import { DEFAULT_ERROR_MESSAGE } from '@/libs/error-message';

describe('ErrorPage', () => {
  it('에러 원문 대신 기본 문구를 보여준다', () => {
    render(
      <ErrorPage
        error={new Error('Cannot read properties of undefined')}
        unstable_retry={vi.fn()}
      />
    );

    expect(screen.getByRole('alert')).toHaveTextContent(DEFAULT_ERROR_MESSAGE);
    expect(screen.queryByText(/Cannot read/)).not.toBeInTheDocument();
  });

  it('다시 시도를 누르면 unstable_retry를 호출한다', async () => {
    const user = userEvent.setup();
    const retry = vi.fn();
    render(<ErrorPage error={new Error('boom')} unstable_retry={retry} />);

    await user.click(screen.getByRole('button', { name: '다시 시도' }));

    expect(retry).toHaveBeenCalledTimes(1);
  });
});
