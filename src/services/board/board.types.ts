import type { Database } from '@/types/supabase';

export type BoardPostRow = Database['public']['Tables']['board_posts']['Row'];

export interface BoardPost extends BoardPostRow {
  profiles: {
    username: string;
    display_name: string;
    profile_url: string;
  };
}

export interface BoardComment {
  id: number;
  post_id: number;
  content: string;
  created_at: string;
  profiles: {
    username: string;
    display_name: string;
  };
}

export interface BoardDetailResponse {
  post: BoardPost;
  comments: BoardComment[];
}

export interface CreateBoardPostRequest {
  title: string;
  content: string;
  image: File;
}

export interface AddBoardCommentRequest {
  postId: number;
  content: string;
}
