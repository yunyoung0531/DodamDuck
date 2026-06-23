import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { servFetchLibraryItemsServer } from '@/services/library/library-services';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const page = Number(searchParams.get('page') ?? '1');
  const perPage = Number(searchParams.get('perPage') ?? '30');

  try {
    const items = await servFetchLibraryItemsServer(page, perPage);
    return NextResponse.json({ data: items });
  } catch {
    return NextResponse.json(
      { error: '공공데이터 API 요청 실패' },
      { status: 500 }
    );
  }
}
