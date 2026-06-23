import { http, HttpResponse } from 'msw';
import { server } from '../mocks/server';
import {
  servFetchLibraryItems,
  getCategoryConfig,
} from '@/services/library/library-services';
import { createMockLibraryItem } from '../mocks/factories';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL;

describe('servFetchLibraryItems', () => {
  it('장난감 도서관 목록을 반환한다', async () => {
    const mockItems = {
      data: [
        createMockLibraryItem({ 순번: 1, 장난감명: '레고 블록' }),
        createMockLibraryItem({ 순번: 2, 장난감명: '공룡 피규어', 대여료: '500' }),
      ],
    };

    server.use(
      http.get(`${APP_URL}/api/library`, () =>
        HttpResponse.json(mockItems)
      )
    );

    const result = await servFetchLibraryItems(1, 30);

    expect(result).toHaveLength(2);
    expect(result[0]!.장난감명).toBe('레고 블록');
    expect(result[1]!.대여료).toBe('500');
  });
});

describe('getCategoryConfig', () => {
  it('알려진 카테고리에 대해 해당 설정을 반환한다', () => {
    const config = getCategoryConfig('블록');

    expect(config.color).toBe('blue');
    expect(config.gradient).toContain('linear-gradient');
  });

  it('역할/소꿉 카테고리에 pink 색상을 반환한다', () => {
    const config = getCategoryConfig('역할/소꿉');

    expect(config.color).toBe('pink');
  });

  it('알 수 없는 카테고리에 기본 설정을 반환한다', () => {
    const config = getCategoryConfig('알수없는카테고리');

    expect(config.color).toBe('gray');
    expect(config.gradient).toContain('linear-gradient');
  });
});
