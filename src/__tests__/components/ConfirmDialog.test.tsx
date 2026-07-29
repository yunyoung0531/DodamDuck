import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../test-utils';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { Button } from '@/components/ui/button';

describe('ConfirmDialog', () => {
  it('트리거를 렌더링한다', () => {
    renderWithProviders(
      <ConfirmDialog
        trigger={<Button>삭제</Button>}
        title="삭제 확인"
        description="정말 삭제하시겠습니까?"
        onConfirm={vi.fn()}
      />
    );

    expect(screen.getByText('삭제')).toBeInTheDocument();
  });

  it('트리거 클릭 시 다이얼로그가 열린다', async () => {
    const user = userEvent.setup();

    renderWithProviders(
      <ConfirmDialog
        trigger={<Button>삭제</Button>}
        title="삭제 확인"
        description="정말 삭제하시겠습니까?"
        onConfirm={vi.fn()}
      />
    );

    await user.click(screen.getByText('삭제'));

    expect(screen.getByText('삭제 확인')).toBeInTheDocument();
    expect(screen.getByText('정말 삭제하시겠습니까?')).toBeInTheDocument();
  });

  it('확인 버튼 클릭 시 onConfirm이 호출된다', async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();

    renderWithProviders(
      <ConfirmDialog
        trigger={<Button>삭제</Button>}
        title="삭제 확인"
        description="정말 삭제하시겠습니까?"
        onConfirm={onConfirm}
      />
    );

    await user.click(screen.getByText('삭제'));

    const confirmButtons = screen.getAllByText('삭제');
    const dialogConfirmButton = confirmButtons.find(
      (btn) => btn.closest('[data-slot="dialog-content"]')
    );
    if (dialogConfirmButton) {
      await user.click(dialogConfirmButton);
    }

    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('커스텀 confirmLabel을 표시한다', async () => {
    const user = userEvent.setup();

    renderWithProviders(
      <ConfirmDialog
        trigger={<Button>실행</Button>}
        title="확인"
        description="실행하시겠습니까?"
        confirmLabel="확인합니다"
        onConfirm={vi.fn()}
      />
    );

    await user.click(screen.getByText('실행'));

    expect(screen.getByText('확인합니다')).toBeInTheDocument();
  });

  it('취소 버튼을 표시한다', async () => {
    const user = userEvent.setup();

    renderWithProviders(
      <ConfirmDialog
        trigger={<Button>삭제</Button>}
        title="삭제 확인"
        description="정말 삭제하시겠습니까?"
        onConfirm={vi.fn()}
      />
    );

    await user.click(screen.getByText('삭제'));

    expect(screen.getByText('취소')).toBeInTheDocument();
  });
});
