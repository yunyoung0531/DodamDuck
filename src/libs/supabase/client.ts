import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/types/supabase';

/**
 * 브라우저용 Supabase 클라이언트. **동기**이므로 `await` 없이 쓴다.
 *
 * 서버용은 `createServerSupabase()`이며 비동기다. 두 함수를 같은 이름으로 두면
 * 호출부에서 `await` 필요 여부를 경로로만 구분해야 해 이름을 나눴다.
 */
export function createBrowserSupabase() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
