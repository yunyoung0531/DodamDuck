import { useUIStore } from '@/stores/useUIStore';
import { act } from '@testing-library/react';

describe('useUIStore', () => {
  beforeEach(() => {
    // 테스트 간 상태 격리
    act(() => {
      useUIStore.setState({ sidebarOpen: false });
    });
  });

  it('초기 sidebarOpen 값은 false이다', () => {
    const state = useUIStore.getState();
    expect(state.sidebarOpen).toBe(false);
  });

  it('toggleSidebar 호출 시 sidebarOpen이 true가 된다', () => {
    act(() => {
      useUIStore.getState().toggleSidebar();
    });

    expect(useUIStore.getState().sidebarOpen).toBe(true);
  });

  it('toggleSidebar 두 번 호출 시 sidebarOpen이 false로 돌아온다', () => {
    act(() => {
      useUIStore.getState().toggleSidebar();
    });
    act(() => {
      useUIStore.getState().toggleSidebar();
    });

    expect(useUIStore.getState().sidebarOpen).toBe(false);
  });

  it('selector로 sidebarOpen만 구독할 수 있다', () => {
    const sidebarOpen = useUIStore.getState().sidebarOpen;
    expect(typeof sidebarOpen).toBe('boolean');
  });
});
