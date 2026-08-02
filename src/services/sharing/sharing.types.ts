import type { Database } from '@/types/supabase';

export const SHARING_CATEGORY = {
  ALL: '전체',
  ROLEPLAY: '역할놀이·인형',
  BLOCKS: '블록·퍼즐',
  RIDE: '승용·야외',
  BOOK: '도서·교구',
  CLOTHES: '의류·잡화',
  ETC: '기타',
} as const;

export type SharingCategory =
  (typeof SHARING_CATEGORY)[keyof typeof SHARING_CATEGORY];

/**
 * DB CHECK 제약에 있는 값만 (ALL 제외).
 * ALL은 필터 해제를 뜻하는 UI 전용 값이라 저장 대상이 아니다.
 * zod 스키마·칩 목록·AI 스키마 모두 이 배열에서 파생시킨다.
 */
export const SHARING_CATEGORY_VALUES = [
  SHARING_CATEGORY.ROLEPLAY,
  SHARING_CATEGORY.BLOCKS,
  SHARING_CATEGORY.RIDE,
  SHARING_CATEGORY.BOOK,
  SHARING_CATEGORY.CLOTHES,
  SHARING_CATEGORY.ETC,
] as const;

export type SharingPostCategory = (typeof SHARING_CATEGORY_VALUES)[number];

export type SharingPostRow =
  Database['public']['Tables']['sharing_posts']['Row'];

export interface SharingPost extends SharingPostRow {
  profiles: {
    username: string;
    display_name: string;
    profile_url: string;
  };
}

export interface SharingComment {
  id: number;
  post_id: number;
  user_id: string;
  content: string;
  created_at: string;
  profiles: {
    username: string;
    display_name: string;
  };
}

export interface SharingDetailResponse {
  post: SharingPost;
  comments: SharingComment[];
}

export interface CreateSharingPostRequest {
  title: string;
  content: string;
  location: string;
  exchangeOption: '교환' | '나눔';
  category: SharingPostCategory;
  tags: string[];
  image: File;
}

export interface AddSharingCommentRequest {
  postId: number;
  content: string;
}

export interface PopularSearch {
  query: string;
  search_count: number;
}
