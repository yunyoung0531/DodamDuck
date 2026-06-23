# Supabase 백엔드 설정 가이드

## 프로젝트 정보

- **Project ID**: `lbixfndmgtewifwskbrg`
- **Region**: `ap-northeast-2` (Northeast Asia / Seoul)
- **Project URL**: `https://lbixfndmgtewifwskbrg.supabase.co`

---

## 환경변수 (.env.local)

```bash
# Supabase (클라이언트 + 서버 접근 가능)
NEXT_PUBLIC_SUPABASE_URL=https://lbixfndmgtewifwskbrg.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<Supabase 대시보드 > Settings > API > Legacy anon key>

# 공공데이터 API (서버 전용 — 클라이언트에 노출되지 않음)
ODCLOUD_API_URL=https://api.odcloud.kr
ODCLOUD_API_KEY=<공공데이터 API 키>
```

> `.env.local`은 `.gitignore`에 포함되어 있어 git에 커밋되지 않음.

---

## 테이블 구조

### 1. profiles (사용자 프로필)

`auth.users`와 1:1 연결. 회원가입 시 트리거로 자동 생성됨.

```sql
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL DEFAULT '',
  location TEXT NOT NULL DEFAULT '',
  profile_url TEXT NOT NULL DEFAULT '',
  level INT NOT NULL DEFAULT 1,
  verification_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### 2. sharing_posts (교환/나눔 게시글)

```sql
CREATE TABLE public.sharing_posts (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT NOT NULL DEFAULT '',
  location TEXT NOT NULL DEFAULT '',
  exchange_option TEXT NOT NULL DEFAULT '',
  tags TEXT[] NOT NULL DEFAULT '{}',
  views INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### 3. sharing_comments (교환/나눔 댓글)

```sql
CREATE TABLE public.sharing_comments (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  post_id BIGINT NOT NULL REFERENCES public.sharing_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### 4. board_posts (자유게시판 게시글)

```sql
CREATE TABLE public.board_posts (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT NOT NULL DEFAULT '',
  views INT NOT NULL DEFAULT 0,
  comment_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### 5. board_comments (자유게시판 댓글)

```sql
CREATE TABLE public.board_comments (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  post_id BIGINT NOT NULL REFERENCES public.board_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### 6. chat_rooms (채팅방)

```sql
CREATE TABLE public.chat_rooms (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user1_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  user2_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  post_id BIGINT REFERENCES public.sharing_posts(id) ON DELETE SET NULL,
  last_message TEXT NOT NULL DEFAULT '',
  last_message_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### 7. chat_messages (채팅 메시지)

```sql
CREATE TABLE public.chat_messages (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  room_id BIGINT NOT NULL REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### 8. search_logs (검색 기록)

```sql
CREATE TABLE public.search_logs (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  query TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

---

## RLS (Row Level Security) 정책

모든 테이블에 RLS가 활성화되어 있음.

### 읽기 정책 (누구나)

```sql
CREATE POLICY "Anyone can read profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Anyone can read sharing_posts" ON public.sharing_posts FOR SELECT USING (true);
CREATE POLICY "Anyone can read sharing_comments" ON public.sharing_comments FOR SELECT USING (true);
CREATE POLICY "Anyone can read board_posts" ON public.board_posts FOR SELECT USING (true);
CREATE POLICY "Anyone can read board_comments" ON public.board_comments FOR SELECT USING (true);
CREATE POLICY "Anyone can read search_logs" ON public.search_logs FOR SELECT USING (true);
```

### 쓰기 정책 (인증된 사용자)

```sql
-- profiles
CREATE POLICY "Auth users can insert profiles" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Auth users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- sharing_posts
CREATE POLICY "Auth users can insert sharing_posts" ON public.sharing_posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Auth users can delete own sharing_posts" ON public.sharing_posts FOR DELETE USING (auth.uid() = user_id);

-- sharing_comments
CREATE POLICY "Auth users can insert sharing_comments" ON public.sharing_comments FOR INSERT WITH CHECK (auth.uid() = user_id);

-- board_posts
CREATE POLICY "Auth users can insert board_posts" ON public.board_posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Auth users can delete own board_posts" ON public.board_posts FOR DELETE USING (auth.uid() = user_id);

-- board_comments
CREATE POLICY "Auth users can insert board_comments" ON public.board_comments FOR INSERT WITH CHECK (auth.uid() = user_id);

-- chat_rooms
CREATE POLICY "Auth users can read own chat_rooms" ON public.chat_rooms FOR SELECT USING (auth.uid() = user1_id OR auth.uid() = user2_id);
CREATE POLICY "Auth users can create chat_rooms" ON public.chat_rooms FOR INSERT WITH CHECK (auth.uid() = user1_id OR auth.uid() = user2_id);
CREATE POLICY "Auth users can update chat_rooms" ON public.chat_rooms FOR UPDATE USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- chat_messages
CREATE POLICY "Auth users can read own messages" ON public.chat_messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.chat_rooms WHERE id = room_id AND (user1_id = auth.uid() OR user2_id = auth.uid()))
);
CREATE POLICY "Auth users can send messages" ON public.chat_messages FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- search_logs
CREATE POLICY "Anyone can insert search_logs" ON public.search_logs FOR INSERT WITH CHECK (true);
```

---

## RPC 함수

### 교환/나눔 조회수 증가

```sql
CREATE OR REPLACE FUNCTION public.increment_sharing_views(target_post_id BIGINT)
RETURNS VOID AS $$
  UPDATE public.sharing_posts SET views = views + 1 WHERE id = target_post_id;
$$ LANGUAGE sql;
```

### 게시판 조회수 증가

```sql
CREATE OR REPLACE FUNCTION public.increment_board_views(target_post_id BIGINT)
RETURNS VOID AS $$
  UPDATE public.board_posts SET views = views + 1 WHERE id = target_post_id;
$$ LANGUAGE sql;
```

### 인기 검색어 조회

```sql
CREATE OR REPLACE FUNCTION public.get_popular_searches(limit_count INT DEFAULT 10)
RETURNS TABLE(query TEXT, search_count BIGINT) AS $$
  SELECT query, COUNT(*) AS search_count
  FROM public.search_logs
  GROUP BY query
  ORDER BY search_count DESC
  LIMIT limit_count;
$$ LANGUAGE sql;
```

### 교환/나눔 게시글 검색

```sql
CREATE OR REPLACE FUNCTION public.search_sharing_posts(search_query TEXT)
RETURNS SETOF public.sharing_posts AS $$
  SELECT * FROM public.sharing_posts
  WHERE title ILIKE '%' || search_query || '%'
     OR content ILIKE '%' || search_query || '%'
  ORDER BY created_at DESC;
$$ LANGUAGE sql;
```

---

## Auth 트리거

### 이메일 자동 인증 (Confirm 생략)

이 프로젝트는 가짜 이메일(`username@example.com`)을 사용하므로 이메일 확인을 건너뜀.

```sql
CREATE OR REPLACE FUNCTION public.auto_confirm_user()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE auth.users
  SET email_confirmed_at = now()
  WHERE id = NEW.id AND email_confirmed_at IS NULL;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER auto_confirm_user_trigger
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.auto_confirm_user();
```

### 프로필 자동 생성

회원가입 시 `profiles` 테이블에 자동으로 프로필 레코드 생성.

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, display_name, location)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'location', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();
```

---

## Storage 버킷

| 버킷 이름 | 용도 | 공개 여부 |
|-----------|------|----------|
| `post-images` | 교환/나눔 게시글 이미지 | 공개 (읽기) |
| `board-images` | 자유게시판 게시글 이미지 | 공개 (읽기) |
| `profile-images` | 사용자 프로필 이미지 | 공개 (읽기) |

### Storage 정책

```sql
-- 버킷 생성
INSERT INTO storage.buckets (id, name, public) VALUES ('post-images', 'post-images', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('board-images', 'board-images', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('profile-images', 'profile-images', true);

-- 읽기: 누구나
CREATE POLICY "Anyone can read post-images" ON storage.objects FOR SELECT USING (bucket_id = 'post-images');
CREATE POLICY "Anyone can read board-images" ON storage.objects FOR SELECT USING (bucket_id = 'board-images');
CREATE POLICY "Anyone can read profile-images" ON storage.objects FOR SELECT USING (bucket_id = 'profile-images');

-- 업로드: 인증된 사용자만
CREATE POLICY "Auth users can upload post-images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'post-images' AND auth.role() = 'authenticated');
CREATE POLICY "Auth users can upload board-images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'board-images' AND auth.role() = 'authenticated');
CREATE POLICY "Auth users can upload profile-images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'profile-images' AND auth.role() = 'authenticated');
```

---

## 인증 흐름

1. 사용자가 아이디/비밀번호로 회원가입
2. 내부적으로 `{아이디}@example.com` 형태로 Supabase Auth에 등록
3. `auto_confirm_user` 트리거 → 이메일 인증 자동 완료
4. `handle_new_user` 트리거 → `profiles` 테이블에 프로필 자동 생성
5. 로그인 시 Supabase SDK가 쿠키 기반 세션 관리 (JWT 자동 처리)

---

## 초기 설정 순서 (새 환경에서)

1. Supabase 프로젝트 생성
2. `.env.local`에 `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` 설정
3. SQL Editor에서 테이블 생성 (profiles → sharing_posts → sharing_comments → board_posts → board_comments → chat_rooms → chat_messages → search_logs)
4. RLS 정책 생성
5. RPC 함수 생성
6. Auth 트리거 생성 (auto_confirm + handle_new_user)
7. Storage 버킷 + 정책 생성
8. `pnpm dev`로 개발 서버 시작

---

## 참고사항

- **이미지 업로드**: JPG, PNG, GIF, WebP만 허용 (HEIC는 웹 브라우저 미지원)
- **Next.js 이미지 설정**: `next.config.ts`의 `remotePatterns`에 Supabase 도메인 등록 필요
- **Rate Limit**: Free 플랜 기준 이메일 전송 2회/시간 제한 (auto_confirm 트리거로 우회)
