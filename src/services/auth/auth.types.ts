export interface SignInRequest {
  userID: string;
  userPassword: string;
}

export interface SignUpRequest {
  userID: string;
  userPassword: string;
}

export interface Profile {
  id: string;
  username: string;
  display_name: string;
  profile_url: string;
  level: number;
  verification_count: number;
  /** 마지막으로 인증한 동의 행정동 코드. 인증한 적이 없으면 `null` */
  verified_region_code: string | null;
  /** 마지막 인증 시각. 유효 여부는 `getVerificationStatus`로 판단합니다. */
  verified_at: string | null;
  created_at: string;
  updated_at: string;
}

/** 인증한 동의 이름을 `regions`에서 함께 읽은 프로필. `select('*, regions(name)')`의 결과입니다. */
export interface ProfileWithRegion extends Profile {
  regions: { name: string } | null;
}

export const PROFILE_COLUMNS =
  'id, username, display_name, profile_url, level, verification_count, verified_region_code, verified_at, created_at, updated_at' as const;

export interface UpdateProfileRequest {
  display_name: string;
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
