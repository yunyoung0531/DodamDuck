import type { LibraryItem, LibraryResponse } from './library.types';

export async function servFetchLibraryItems(
  page = 1,
  perPage = 30
): Promise<LibraryItem[]> {
  const params = new URLSearchParams({
    page: String(page),
    perPage: String(perPage),
  });

  const response = await fetch(`/api/library?${params.toString()}`);
  if (!response.ok) throw new Error('장난감 도서관 데이터를 불러올 수 없습니다');

  const data: LibraryResponse = await response.json();
  return data.data;
}

export async function servFetchLibraryItemsServer(
  page = 1,
  perPage = 30
): Promise<LibraryItem[]> {
  const apiUrl = process.env.ODCLOUD_API_URL;
  const apiKey = process.env.ODCLOUD_API_KEY;
  const datasetPath = process.env.ODCLOUD_LIBRARY_DATASET_PATH;

  if (!apiUrl || !apiKey || !datasetPath) {
    throw new Error('Server configuration error');
  }

  const params = new URLSearchParams({
    page: String(page),
    perPage: String(perPage),
    returnType: 'JSON',
    serviceKey: apiKey,
  });

  const response = await fetch(
    `${apiUrl}${datasetPath}?${params.toString()}`
  );
  if (!response.ok) throw new Error('장난감 도서관 데이터를 불러올 수 없습니다');

  const data: LibraryResponse = await response.json();
  return data.data;
}
