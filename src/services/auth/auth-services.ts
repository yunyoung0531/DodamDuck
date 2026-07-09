import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';
import { createClient } from '@/libs/supabase/client';
import type {
  SignInRequest,
  SignUpRequest,
  CheckUsernameResponse,
  CurrentProfile,
  Profile,
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
