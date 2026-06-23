import type { Database } from '@/types/supabase';

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
