import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import { ErrorState } from '@/components/common/ErrorState';
import { DEFAULT_ERROR_MESSAGE } from '@/libs/error-message';

describe('ErrorState', () => {
  it('넘긴 문구를 alert로 보여준다', () => {
    render(<ErrorState message="요청한 데이터를 찾을 수 없습니다." />);

    expect(screen.getByRole('alert')).toHaveTextContent(
      '요청한 데이터를 찾을 수 없습니다.'
    );
  });

  it('문구가 없으면 기본 문구를 보여준다', () => {
    render(<ErrorState />);

    expect(screen.getByText(DEFAULT_ERROR_MESSAGE)).toBeInTheDocument();
  });

  it('onRetry가 있으면 재시도 버튼을 보여주고 누르면 호출한다', async () => {
    const user = userEvent.setup();
    const handleRetry = vi.fn();
    render(<ErrorState onRetry={handleRetry} />);

    await user.click(screen.getByRole('button', { name: '다시 시도' }));

    expect(handleRetry).toHaveBeenCalledTimes(1);
  });

  it('onRetry가 없으면 재시도 버튼을 보여주지 않는다', () => {
    render(<ErrorState />);

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
