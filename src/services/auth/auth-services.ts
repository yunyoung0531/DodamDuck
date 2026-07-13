import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';
import { createClient } from '@/libs/supabase/client';
import { uploadImage, extractStoragePath, deleteImage } from '@/libs/supabase/storage';
import type {
  SignInRequest,
  SignUpRequest,
  CheckUsernameResponse,
  CurrentProfile,
  Profile,
  UpdateProfileRequest,
} from './auth.types';
import { PROFILE_COLUMNS } from './auth.types';

const EMAIL_DOMAIN = 'example.com';

function toEmail(username: string): string {
  return `${username}@${EMAIL_DOMAIN}`;
}

export async function servSignIn(request: SignInRequest) {
  const supabase = createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email: toEmail(request.userID),
    password: request.userPassword,
  });

  if (error) throw error;
  return data;
}

export async function servSignUp(request: SignUpRequest) {
  const supabase = createClient();

  const { data, error } = await supabase.auth.signUp({
    email: toEmail(request.userID),
    password: request.userPassword,
    options: {
      data: {
        username: request.userID,
        display_name: request.userID,
        location: request.location,
      },
    },
  });

  if (error) throw error;
  return data;
}

export async function servSignOut() {
  const supabase = createClient();
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function servCheckUsername(
  username: string
): Promise<CheckUsernameResponse> {
  const supabase = createClient();

  const { data } = await supabase
    .from('profiles')
    .select('id')
    .eq('username', username)
    .maybeSingle();

  return { isAvailable: !data };
}

export async function servFetchCurrentProfile(
  client?: SupabaseClient<Database>
): Promise<CurrentProfile | null> {
  const supabase = client ?? createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile, error } = await supabase
    .from('profiles')
    .select(PROFILE_COLUMNS)
    .eq('id', user.id)
    .single<Profile>();

  if (error) return null;

  if (!profile) return null;

  return {
    user: { id: user.id, email: user.email },
    profile,
  };
}

export async function servUpdateProfile(
  request: Pick<UpdateProfileRequest, 'display_name' | 'location'>
): Promise<void> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('인증이 필요합니다');

  const { error } = await supabase
    .from('profiles')
    .update({
      display_name: request.display_name,
      location: request.location,
    })
    .eq('id', user.id);

  if (error) throw error;
}

export async function servUpdateProfileImage(file: File): Promise<string> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('인증이 필요합니다');

  const { data: currentProfile } = await supabase
    .from('profiles')
    .select('profile_url')
    .eq('id', user.id)
    .single<{ profile_url: string }>();

  const ext = file.type.split('/')[1] === 'jpeg' ? 'jpg' : file.type.split('/')[1];
  const imagePath = `${user.id}/${Date.now()}.${ext}`;
  const imageUrl = await uploadImage('profile-images', imagePath, file);

  const { error } = await supabase
    .from('profiles')
    .update({ profile_url: imageUrl })
    .eq('id', user.id);

  if (error) throw error;

  if (currentProfile?.profile_url) {
    const oldPath = extractStoragePath(currentProfile.profile_url, 'profile-images');
    if (oldPath) {
      deleteImage('profile-images', oldPath).catch(() => {});
    }
  }

  return imageUrl;
}
