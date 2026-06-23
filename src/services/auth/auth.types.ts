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

export interface CheckUsernameResponse {
  isAvailable: boolean;
}
