import { type NextRequest } from 'next/server';
import { updateSession } from '@/libs/supabase/middleware';

export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: ['/my-shop', '/chat/:path*', '/sharing/new', '/board/new'],
};
