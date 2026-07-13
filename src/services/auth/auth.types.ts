export interface SignInRequest {
  userID: string;
  userPassword: string;
}

export interface SignUpRequest {
  userID: string;
  userPassword: string;
  location: string;
}

export interface Profile {
  id: string;
  username: string;
  display_name: string;
  location: string;
  profile_url: string;
  level: number;
  verification_count: number;
  created_at: string;
  updated_at: string;
}

export const PROFILE_COLUMNS =
  'id, username, display_name, location, profile_url, level, verification_count, created_at, updated_at' as const;

export interface UpdateProfileRequest {
  display_name: string;
  location: string;
  profileImage?: File;
}

export interface CheckUsernameResponse {
  isAvailable: boolean;
}

export interface CurrentProfile {
  user: {
    id: string;
    email: string | undefined;
  };
  profile: Profile;
}
