import { http, HttpResponse } from 'msw';
import { server } from '../mocks/server';
import { renderHookWithProviders, waitFor } from '../test-utils';
import { useLibraryItems } from '@/services/library/useLibrary';
import { createMockLibraryItem } from '../mocks/factories';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL;

describe('useLibraryItems', () => {
  it('장난감 도서관 목록을 가져온다', async () => {
    const mockItems = {
      data: [
        createMockLibraryItem({ 장난감명: '레고 블록' }),
        createMockLibraryItem({ 장난감명: '공룡 피규어', 대여료: '500' }),
      ],
    };

    server.use(
      http.get(`${APP_URL}/api/library`, () =>
        HttpResponse.json(mockItems)
      )
    );

    const { result } = renderHookWithProviders(() => useLibraryItems(1, 30));

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toHaveLength(2);
    expect(result.current.data![0]!.장난감명).toBe('레고 블록');
  });

  it('기본 파라미터로 호출할 수 있다', async () => {
    server.use(
      http.get(`${APP_URL}/api/library`, () =>
        HttpResponse.json({ data: [createMockLibraryItem()] })
      )
    );

    const { result } = renderHookWithProviders(() => useLibraryItems());

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toHaveLength(1);
  });
});
