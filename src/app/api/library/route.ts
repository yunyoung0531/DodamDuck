import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const ODCLOUD_API_URL = process.env.ODCLOUD_API_URL;
const ODCLOUD_API_KEY = process.env.ODCLOUD_API_KEY;
const LIBRARY_DATASET_PATH =
  '/api/15044146/v1/uddi:7894ac31-fe17-420a-834a-824c42470e0e_201905301141';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const page = searchParams.get('page') ?? '1';
  const perPage = searchParams.get('perPage') ?? '30';

  if (!ODCLOUD_API_URL || !ODCLOUD_API_KEY) {
    return NextResponse.json(
      { error: 'Server configuration error' },
      { status: 500 }
    );
  }

  const params = new URLSearchParams({
    page,
    perPage,
    returnType: 'JSON',
    serviceKey: ODCLOUD_API_KEY,
  });

  const response = await fetch(
    `${ODCLOUD_API_URL}${LIBRARY_DATASET_PATH}?${params.toString()}`
  );

  if (!response.ok) {
    return NextResponse.json(
      { error: '공공데이터 API 요청 실패' },
      { status: response.status }
    );
  }

  const data: unknown = await response.json();
  return NextResponse.json(data);
}
