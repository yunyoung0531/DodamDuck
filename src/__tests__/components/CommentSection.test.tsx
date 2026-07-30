import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../test-utils';
import { CommentSection } from '@/components/common/CommentSection';

beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn();
});

const mockComments = [
  {
    id: 1,
    user_id: 'user-1',
    content: '교환 원합니다',
    created_at: new Date().toISOString(),
    profiles: { display_name: '유저1' },
  },
  {
    id: 2,
    user_id: 'user-2',
    content: '좋은 장난감이네요',
    created_at: new Date().toISOString(),
    profiles: { display_name: '유저2' },
  },
];

describe('CommentSection', () => {
  it('댓글 목록을 렌더링한다', () => {
    renderWithProviders(
      <CommentSection
        comments={mockComments}
        isLoggedIn={false}
        onSubmit={vi.fn()}
        isSubmitting={false}
      />
    );

    expect(screen.getByText('교환 원합니다')).toBeInTheDocument();
    expect(screen.getByText('좋은 장난감이네요')).toBeInTheDocument();
    expect(screen.getByText('유저1')).toBeInTheDocument();
    expect(screen.getByText('유저2')).toBeInTheDocument();
  });

  it('댓글이 없으면 빈 상태 메시지를 표시한다', () => {
    renderWithProviders(
      <CommentSection
        comments={[]}
        isLoggedIn={false}
        onSubmit={vi.fn()}
        isSubmitting={false}
      />
    );

    expect(screen.getByText('아직 댓글이 없습니다.')).toBeInTheDocument();
  });

  it('로그인 상태에서 입력 폼을 표시한다', () => {
    renderWithProviders(
      <CommentSection
        comments={[]}
        isLoggedIn={true}
        onSubmit={vi.fn()}
        isSubmitting={false}
      />
    );

    expect(
      screen.getByPlaceholderText('댓글을 입력해주세요.')
    ).toBeInTheDocument();
  });

  it('비로그인 상태에서 입력 폼을 표시하지 않는다', () => {
    renderWithProviders(
      <CommentSection
        comments={[]}
        isLoggedIn={false}
        onSubmit={vi.fn()}
        isSubmitting={false}
      />
    );

    expect(
      screen.queryByPlaceholderText('댓글을 입력해주세요.')
    ).not.toBeInTheDocument();
  });

  it('댓글 입력 후 제출 시 onSubmit이 호출된다', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    renderWithProviders(
      <CommentSection
        comments={[]}
        isLoggedIn={true}
        onSubmit={onSubmit}
        isSubmitting={false}
      />
    );

    const input = screen.getByPlaceholderText('댓글을 입력해주세요.');
    await user.type(input, '새 댓글입니다');
    await user.keyboard('{Enter}');

    expect(onSubmit).toHaveBeenCalledWith('새 댓글입니다');
  });

  it('빈 댓글은 제출되지 않는다', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    renderWithProviders(
      <CommentSection
        comments={[]}
        isLoggedIn={true}
        onSubmit={onSubmit}
        isSubmitting={false}
      />
    );

    const input = screen.getByPlaceholderText('댓글을 입력해주세요.');
    await user.click(input);
    await user.keyboard('{Enter}');

    expect(onSubmit).not.toHaveBeenCalled();
  });
});
