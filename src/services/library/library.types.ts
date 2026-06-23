export const TOY_CATEGORIES = [
  '블록',
  '역할/소꿉',
  '육아용품',
  '음률',
  '자동차/모형',
  '조작/탐색',
  '퍼즐/게임',
] as const;

export type ToyCategory = (typeof TOY_CATEGORIES)[number];

export interface LibraryItem {
  순번: number;
  장난감명: string;
  '영 역': string;
  사용연령: string;
  대여료: string;
  제조사: string;
  관리기관명: string;
  관리기관전화번호: string;
  소재지도로명주소: string;
  소재지지번주소: string;
}

export interface LibraryResponse {
  data: LibraryItem[];
}

export interface LibraryQueryParams {
  page?: number;
  perPage?: number;
}
