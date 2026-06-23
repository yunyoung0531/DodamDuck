import type { SupabaseClient } from '@supabase/supabase-js';
import { createClient } from '@/libs/supabase/client';
import { uploadImage } from '@/libs/supabase/storage';
import type { Database } from '@/types/supabase';
import type {
  BoardPost,
  BoardDetailResponse,
  CreateBoardPostRequest,
  AddBoardCommentRequest,
  BoardComment,
} from './board.types';

export async function servFetchBoardPosts(
  client?: SupabaseClient<Database>
): Promise<BoardPost[]> {
  const supabase = client ?? createClient();

  const { data, error } = await supabase
    .from('board_posts')
    .select('*, profiles(username, display_name, profile_url)')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as BoardPost[];
}

export async function servFetchBoardDetail(
  postId: number,
  client?: SupabaseClient<Database>
): Promise<BoardDetailResponse> {
  const supabase = client ?? createClient();

  const { data: post, error: postError } = await supabase
    .from('board_posts')
    .select('*, profiles(username, display_name, profile_url)')
    .eq('id', postId)
    .single();

  if (postError) throw postError;

  const { data: comments, error: commentsError } = await supabase
    .from('board_comments')
    .select('*, profiles(username, display_name)')
    .eq('post_id', postId)
    .order('created_at', { ascending: true });

  if (commentsError) throw commentsError;

  return {
    post: post as BoardPost,
    comments: comments as BoardComment[],
  };
}

export async function servCreateBoardPost(
  request: CreateBoardPostRequest
): Promise<BoardPost> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('인증이 필요합니다');

  const imagePath = `${user.id}/${Date.now()}-${request.image.name}`;
  const imageUrl = await uploadImage('board-images', imagePath, request.image);

  const { data, error } = await supabase
    .from('board_posts')
    .insert({
      user_id: user.id,
      title: request.title,
      content: request.content,
      image_url: imageUrl,
    })
    .select('*, profiles(username, display_name, profile_url)')
    .single();

  if (error) throw error;
  return data as BoardPost;
}

export async function servDeleteBoardPost(postId: number): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase
    .from('board_posts')
    .delete()
    .eq('id', postId);

  if (error) throw error;
}

export async function servIncrementBoardViewCount(
  postId: number
): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.rpc('increment_board_views', {
    target_post_id: postId,
  });
  if (error) throw error;
}

export async function servAddBoardComment(
  request: AddBoardCommentRequest
): Promise<void> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('인증이 필요합니다');

  const { error } = await supabase.from('board_comments').insert({
    post_id: request.postId,
    user_id: user.id,
    content: request.content,
  });

  if (error) throw error;
}
