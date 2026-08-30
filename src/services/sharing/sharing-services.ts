import type { SupabaseClient } from '@supabase/supabase-js';
import { createBrowserSupabase } from '@/libs/supabase/client';
import { uploadImage } from '@/libs/supabase/storage';
import type { Database } from '@/types/supabase';
import type {
  SharingPost,
  SharingDetailResponse,
  CreateSharingPostRequest,
  AddSharingCommentRequest,
  SharingComment,
  PopularSearch,
  SharingPostCategory,
} from './sharing.types';

export async function servFetchSharingPosts(
  category?: SharingPostCategory,
  client?: SupabaseClient<Database>
): Promise<SharingPost[]> {
  const supabase = client ?? createBrowserSupabase();

  let query = supabase
    .from('sharing_posts')
    .select('*, profiles(username, display_name, profile_url)');

  if (category) {
    query = query.eq('category', category);
  }

  const { data, error } = await query.order('created_at', {
    ascending: false,
  });

  if (error) throw error;
  return data as SharingPost[];
}

export async function servFetchSharingDetail(
  postId: number,
  client?: SupabaseClient<Database>
): Promise<SharingDetailResponse> {
  const supabase = client ?? createBrowserSupabase();

  const { data: post, error: postError } = await supabase
    .from('sharing_posts')
    .select('*, profiles(username, display_name, profile_url)')
    .eq('id', postId)
    .single();

  if (postError) throw postError;

  const { data: comments, error: commentsError } = await supabase
    .from('sharing_comments')
    .select('id, post_id, user_id, content, created_at, profiles(username, display_name)')
    .eq('post_id', postId)
    .order('created_at', { ascending: true });

  if (commentsError) throw commentsError;

  return {
    post: post as SharingPost,
    comments: comments as SharingComment[],
  };
}

export async function servCreateSharingPost(
  request: CreateSharingPostRequest
): Promise<SharingPost> {
  const supabase = createBrowserSupabase();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('인증이 필요합니다');

  const parts = request.image.name.split('.');
  const ext = parts.length > 1 ? parts.pop() : 'jpg';
  const imagePath = `${user.id}/${Date.now()}.${ext}`;
  const imageUrl = await uploadImage('post-images', imagePath, request.image);

  const { data, error } = await supabase
    .from('sharing_posts')
    .insert({
      user_id: user.id,
      title: request.title,
      content: request.content,
      image_url: imageUrl,
      location: request.location,
      exchange_option: request.exchangeOption,
      category: request.category,
      tags: request.tags,
    })
    .select('*, profiles(username, display_name, profile_url)')
    .single();

  if (error) throw error;
  return data as SharingPost;
}

export async function servDeleteSharingPost(postId: number): Promise<void> {
  const supabase = createBrowserSupabase();

  const { error } = await supabase
    .from('sharing_posts')
    .delete()
    .eq('id', postId);

  if (error) throw error;
}

export async function servIncrementSharingViewCount(
  postId: number
): Promise<void> {
  const supabase = createBrowserSupabase();
  const { error } = await supabase.rpc('increment_sharing_views', {
    target_post_id: postId,
  });
  if (error) throw error;
}

export async function servAddSharingComment(
  request: AddSharingCommentRequest
): Promise<void> {
  const supabase = createBrowserSupabase();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('인증이 필요합니다');

  const { error } = await supabase.from('sharing_comments').insert({
    post_id: request.postId,
    user_id: user.id,
    content: request.content,
  });

  if (error) throw error;
}

export async function servDeleteSharingComment(
  commentId: number
): Promise<void> {
  const supabase = createBrowserSupabase();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('인증이 필요합니다');

  const { error, count } = await supabase
    .from('sharing_comments')
    .delete({ count: 'exact' })
    .eq('id', commentId)
    .eq('user_id', user.id);

  if (error) throw error;
  if (!count) throw new Error('삭제 권한이 없거나 존재하지 않는 댓글입니다.');
}

export async function servSearchSharingPosts(
  query: string,
  client?: SupabaseClient<Database>
): Promise<SharingPost[]> {
  const supabase = client ?? createBrowserSupabase();

  const { data, error } = await supabase.rpc('search_sharing_posts', {
    search_query: query,
  });

  if (error) throw error;

  const ids = (data ?? []).map(
    (row: { id: number }) => row.id
  );

  if (ids.length === 0) return [];

  const { data: posts, error: postsError } = await supabase
    .from('sharing_posts')
    .select('*, profiles(username, display_name, profile_url)')
    .in('id', ids)
    .order('created_at', { ascending: false });

  if (postsError) throw postsError;
  return posts as SharingPost[];
}

export async function servFetchPopularSearches(
  client?: SupabaseClient<Database>
): Promise<PopularSearch[]> {
  const supabase = client ?? createBrowserSupabase();

  const { data, error } = await supabase.rpc('get_popular_searches', {
    limit_count: 5,
  });

  if (error) throw error;
  return data ?? [];
}
