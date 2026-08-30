import type { SupabaseClient } from '@supabase/supabase-js';
import { createBrowserSupabase } from '@/libs/supabase/client';
import type { Database } from '@/types/supabase';
import type { SharingPost } from '@/services/sharing/sharing.types';

export async function servFetchUserLikedPostIds(
  client?: SupabaseClient<Database>
): Promise<number[]> {
  const supabase = client ?? createBrowserSupabase();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('sharing_likes')
    .select('post_id')
    .eq('user_id', user.id);

  if (error) throw error;
  return (data ?? []).map((row) => row.post_id);
}

export async function servToggleLike(postId: number): Promise<boolean> {
  const supabase = createBrowserSupabase();

  const { data, error } = await supabase.rpc('toggle_like', {
    target_table: 'sharing',
    target_post_id: postId,
  });

  if (error) throw error;
  return data as boolean;
}

export async function servFetchUserLikedSharingPosts(
  client?: SupabaseClient<Database>
): Promise<SharingPost[]> {
  const supabase = client ?? createBrowserSupabase();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: likes, error: likesError } = await supabase
    .from('sharing_likes')
    .select('post_id')
    .eq('user_id', user.id);

  if (likesError) throw likesError;

  const postIds = (likes ?? []).map((row) => row.post_id);
  if (postIds.length === 0) return [];

  const { data: posts, error: postsError } = await supabase
    .from('sharing_posts')
    .select('*, profiles(username, display_name, profile_url)')
    .in('id', postIds)
    .order('created_at', { ascending: false });

  if (postsError) throw postsError;
  return posts as SharingPost[];
}
