import { createClient } from '@/libs/supabase/client';
import type { SignInRequest, SignUpRequest, CheckUsernameResponse } from './auth.types';

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
