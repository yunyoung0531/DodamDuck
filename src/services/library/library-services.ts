import {
  IconCube,
  IconHome,
  IconBabyCarriage,
  IconMusic,
  IconCar,
  IconHandFinger,
  IconPuzzle,
} from '@tabler/icons-react';
import type { TablerIcon } from '@tabler/icons-react';

import type { LibraryItem, LibraryResponse, ToyCategory } from './library.types';

interface CategoryConfig {
  icon: TablerIcon;
  color: string;
  gradient: string;
}

const CATEGORY_CONFIG: Record<ToyCategory, CategoryConfig> = {
  '블록': {
    icon: IconCube,
    color: 'blue',
    gradient: 'linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)',
  },
  '역할/소꿉': {
    icon: IconHome,
    color: 'pink',
    gradient: 'linear-gradient(135deg, #fd79a8 0%, #e84393 100%)',
  },
  '육아용품': {
    icon: IconBabyCarriage,
    color: 'green',
    gradient: 'linear-gradient(135deg, #55efc4 0%, #00b894 100%)',
  },
  '음률': {
    icon: IconMusic,
    color: 'violet',
    gradient: 'linear-gradient(135deg, #a29bfe 0%, #6c5ce7 100%)',
  },
  '자동차/모형': {
    icon: IconCar,
    color: 'orange',
    gradient: 'linear-gradient(135deg, #ffeaa7 0%, #fdcb6e 100%)',
  },
  '조작/탐색': {
    icon: IconHandFinger,
    color: 'teal',
    gradient: 'linear-gradient(135deg, #81ecec 0%, #00cec9 100%)',
  },
  '퍼즐/게임': {
    icon: IconPuzzle,
    color: 'yellow',
    gradient: 'linear-gradient(135deg, #ffeaa7 0%, #f9ca24 100%)',
  },
};

const DEFAULT_CONFIG: CategoryConfig = {
  icon: IconCube,
  color: 'gray',
  gradient: 'linear-gradient(135deg, #b2bec3 0%, #636e72 100%)',
};

export function getCategoryConfig(category: string): CategoryConfig {
  return CATEGORY_CONFIG[category as ToyCategory] ?? DEFAULT_CONFIG;
}

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
