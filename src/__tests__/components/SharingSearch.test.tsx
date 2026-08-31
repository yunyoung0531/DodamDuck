import { createBrowserSupabase } from '@/libs/supabase/client';
import { act, renderWithProviders, screen, fireEvent } from '../test-utils';
import SharingContents from '@/app/sharing/components/SharingContents';
import type { MockSupabaseClient } from '../mocks/supabase';

const mockSupabase = createBrowserSupabase() as unknown as MockSupabaseClient;

/** 컴포넌트가 쓰는 debounce 지연시간. 이 값을 기준으로 타이머를 밀어준다. */
const DEBOUNCE_MS = 300;

const ALL_POSTS = [
  { id: 1, title: '전체목록 장난감', category: '장난감', tags: [] },
  { id: 2, title: '전체목록 자전거', category: '자동차', tags: [] },
];
// 전체 목록과 겹치지 않는 제목이어야 어느 쪽이 렌더됐는지 구분할 수 있다.
const SEARCH_HITS = [
  { id: 3, title: '검색결과 레고', category: '장난감', tags: [] },
];

/** 검색 RPC에 전달된 검색어를 순서대로 기록한다. */
let searchCalls: string[] = [];
/** 목록 조회가 돌려줄 게시글. 빈 상태 테스트에서 비운다. */
let listResult: typeof ALL_POSTS = ALL_POSTS;
/** 검색이 돌려줄 게시글. 빈 상태 테스트에서 비운다. */
let searchResult: typeof SEARCH_HITS = SEARCH_HITS;

function setupSupabaseMocks() {
  searchCalls = [];
  listResult = ALL_POSTS;
  searchResult = SEARCH_HITS;

  mockSupabase.rpc = vi.fn((name: string, args?: Record<string, unknown>) => {
    if (name === 'get_popular_searches') {
      return Promise.resolve({
        data: [{ query: '레고', search_count: 3 }],
        error: null,
      });
    }
    if (name === 'search_sharing_posts') {
      searchCalls.push(String(args?.search_query));
      return Promise.resolve({
        data: searchResult.map((post) => ({ id: post.id })),
        error: null,
      });
    }
    return Promise.resolve({ data: null, error: null });
  });

  // .in()이 호출된 체인은 검색 결과 재조회, 아니면 전체 목록 조회다.
  mockSupabase.from = vi.fn(() => {
    let isSearchLookup = false;
    const chain = {
      select: vi.fn(() => chain),
      eq: vi.fn(() => chain),
      in: vi.fn(() => {
        isSearchLookup = true;
        return chain;
      }),
      order: vi.fn(() =>
        Promise.resolve({
          data: isSearchLookup ? searchResult : listResult,
          error: null,
        })
      ),
    };
    return chain;
  });
}

/**
 * 대기 중인 promise를 흘려보낸다. 타이머는 건드리지 않는다.
 * 검색 1회는 RPC → 재조회 → 상태 반영으로 이어지므로 여러 단계를 흘려야 한다.
 */
async function flushPromises() {
  await act(async () => {
    for (let i = 0; i < 20; i += 1) {
      // TanStack Query는 상태 반영을 지연 0의 타이머로 예약한다.
      // 시계를 앞당기지 않으면서 그 예약만 실행시킨다.
      vi.advanceTimersByTime(0);
      await Promise.resolve();
    }
  });
}

/** 지정한 시간만큼 타이머를 밀고 이어지는 promise를 흘려보낸다. */
async function advance(ms: number) {
  await act(async () => {
    vi.advanceTimersByTime(ms);
    for (let i = 0; i < 20; i += 1) {
      // TanStack Query는 상태 반영을 지연 0의 타이머로 예약한다.
      // 시계를 앞당기지 않으면서 그 예약만 실행시킨다.
      vi.advanceTimersByTime(0);
      await Promise.resolve();
    }
  });
}

async function renderSearchPage() {
  renderWithProviders(<SharingContents />);
  await flushPromises();
  return screen.getByPlaceholderText('어떤 제품을 찾으세요?');
}

describe('SharingContents 실시간 검색', () => {
  beforeEach(() => {
    // 진짜 타이머 + waitFor 조합은 지연시간을 검증하지 못한다.
    // (0ms든 300ms든 waitFor가 기다려주므로 전부 통과해버린다)
    vi.useFakeTimers();
    setupSupabaseMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('지연시간이 지나기 전에는 검색하지 않는다', async () => {
    // Arrange
    const input = await renderSearchPage();

    // Act
    fireEvent.change(input, { target: { value: '레고' } });
    await advance(DEBOUNCE_MS - 1);

    // Assert — 1ms 모자라면 아직 실행되지 않아야 한다
    expect(searchCalls).toEqual([]);
  });

  it('지연시간이 지나면 검색한다', async () => {
    // Arrange
    const input = await renderSearchPage();

    // Act
    fireEvent.change(input, { target: { value: '레고' } });
    await advance(DEBOUNCE_MS);
    // 검색은 RPC 조회 후 프로필을 붙이려 한 번 더 조회하므로 결과 반영을 더 기다린다.
    await flushPromises();

    // Assert
    expect(searchCalls).toEqual(['레고']);
    expect(screen.getByText('검색결과 레고')).toBeInTheDocument();
    expect(screen.queryByText('전체목록 자전거')).not.toBeInTheDocument();
  });

  it('연속 입력 중에는 검색하지 않고 마지막 값으로 한 번만 검색한다', async () => {
    // Arrange
    const input = await renderSearchPage();

    // Act — 지연시간보다 짧은 간격으로 세 번 입력
    for (const value of ['레고', '레고블', '레고블록']) {
      fireEvent.change(input, { target: { value } });
      await advance(DEBOUNCE_MS - 100);
    }

    // Assert — 아직 한 번도 실행되지 않았다
    expect(searchCalls).toEqual([]);

    // Act — 입력을 멈추고 지연시간 경과
    await advance(DEBOUNCE_MS);

    // Assert — 마지막 값으로 한 번만
    expect(searchCalls).toEqual(['레고블록']);
  });

  it('최소 글자 수 미달이면 지연시간이 지나도 검색하지 않는다', async () => {
    // Arrange
    const input = await renderSearchPage();

    // Act
    fireEvent.change(input, { target: { value: '레' } });
    await advance(DEBOUNCE_MS * 3);

    // Assert — 검색 없이 전체 목록 유지
    expect(searchCalls).toEqual([]);
    expect(screen.getByText('전체목록 자전거')).toBeInTheDocument();
  });

  // 실제 한글 IME는 마지막 음절의 compositionend가 스페이스/엔터 전까지 발생하지 않는다.
  // 조합 완료를 기다리는 구현은 마지막 글자를 영영 검색하지 못했다.
  it('한글 입력 시 조합이 끝나지 않아도 검색한다', async () => {
    // Arrange
    const input = await renderSearchPage();

    // Act — "레"까지는 조합이 끝나지만 마지막 "고"는 조합 중으로 남는다
    fireEvent.compositionStart(input);
    fireEvent.change(input, { target: { value: 'ㄹ' } });
    fireEvent.change(input, { target: { value: '레' } });
    fireEvent.compositionEnd(input, { target: { value: '레' } });

    fireEvent.compositionStart(input);
    fireEvent.change(input, { target: { value: '레ㄱ' } });
    fireEvent.change(input, { target: { value: '레고' } });
    // compositionEnd 없음 — 실제 브라우저와 동일한 상황

    await advance(DEBOUNCE_MS);

    // Assert
    expect(searchCalls).toEqual(['레고']);
  });

  it('검색어를 지우면 지연 없이 즉시 전체 목록으로 돌아온다', async () => {
    // Arrange
    const input = await renderSearchPage();
    fireEvent.change(input, { target: { value: '레고' } });
    await advance(DEBOUNCE_MS);
    expect(screen.queryByText('전체목록 자전거')).not.toBeInTheDocument();

    // Act — 타이머를 전혀 밀지 않는다
    fireEvent.change(input, { target: { value: '' } });
    await flushPromises();

    // Assert
    expect(screen.getByText('전체목록 자전거')).toBeInTheDocument();
  });

  // span에 onClick만 달면 키보드·스크린 리더 사용자가 누를 수 없다.
  it('인기 검색어는 키보드로 누를 수 있는 버튼이다', async () => {
    // Arrange & Act
    await renderSearchPage();

    // Assert
    expect(screen.getByRole('button', { name: '#레고' })).toBeInTheDocument();
  });

  it('인기 검색어를 클릭하면 지연 없이 즉시 검색한다', async () => {
    // Arrange
    await renderSearchPage();
    const badge = screen.getByText('#레고');

    // Act — 타이머를 전혀 밀지 않는다
    fireEvent.click(badge);
    await flushPromises();

    // Assert
    expect(searchCalls).toEqual(['레고']);
  });

  it('검색 결과가 없으면 검색어를 지우는 버튼을 보여준다', async () => {
    // Arrange
    searchResult = [];
    const input = await renderSearchPage();

    // Act
    fireEvent.change(input, { target: { value: '곰' } });
    fireEvent.change(input, { target: { value: '곰돌' } });
    await advance(DEBOUNCE_MS);
    await flushPromises();

    // Assert — 왜 0건인지 알려주고 되돌릴 방법을 준다
    expect(screen.getByText('"곰돌"에 대한 결과가 없습니다')).toBeInTheDocument();

    // Act — 지우기 버튼으로 복귀
    fireEvent.click(screen.getByRole('button', { name: '검색어 지우기' }));
    await flushPromises();

    // Assert
    expect(screen.getByText('전체목록 자전거')).toBeInTheDocument();
    expect((input as HTMLInputElement).value).toBe('');
  });

  it('검색어와 카테고리가 모두 걸린 경우 어느 쪽을 풀지 고르게 한다', async () => {
    // Arrange
    searchResult = [];
    const input = await renderSearchPage();

    // Act — 카테고리 선택 후 검색
    fireEvent.click(screen.getByRole('button', { name: '블록·퍼즐' }));
    await flushPromises();
    fireEvent.change(input, { target: { value: '곰돌' } });
    await advance(DEBOUNCE_MS);
    await flushPromises();

    // Assert — 두 조건을 모두 언급하고 각각 해제하는 버튼을 준다
    expect(
      screen.getByText('"곰돌" 검색 결과가 블록·퍼즐 카테고리에 없습니다')
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: '전체 카테고리에서 찾기' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: '검색어 지우기' })
    ).toBeInTheDocument();
  });

  it('카테고리만 걸려 0건이면 해당 카테고리가 비었다고 알려준다', async () => {
    // Arrange
    listResult = [];
    await renderSearchPage();

    // Act
    fireEvent.click(screen.getByRole('button', { name: '블록·퍼즐' }));
    await flushPromises();

    // Assert
    expect(
      screen.getByText('블록·퍼즐 카테고리에 아직 등록된 물건이 없습니다')
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: '전체 보기' })
    ).toBeInTheDocument();
  });

  it('조건이 없는데 0건이면 등록된 물건이 없다고 알려준다', async () => {
    // Arrange
    listResult = [];

    // Act
    await renderSearchPage();

    // Assert — 조건 해제 버튼이 아니라 글쓰기를 제안한다
    expect(
      screen.getByText('아직 등록된 물건이 없습니다')
    ).toBeInTheDocument();
    expect(screen.getByText('첫 번째 나눔을 시작해보세요')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: '검색어 지우기' })
    ).not.toBeInTheDocument();
  });

  it('엔터로 제출하면 지연 없이 즉시 검색한다', async () => {
    // Arrange
    const input = await renderSearchPage();

    // Act — 입력 후 타이머를 밀지 않고 제출
    fireEvent.change(input, { target: { value: '레고' } });
    fireEvent.submit(input.closest('form') as HTMLFormElement);
    await flushPromises();

    // Assert
    expect(searchCalls).toEqual(['레고']);
  });
});
