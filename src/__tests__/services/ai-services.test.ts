import { http, HttpResponse } from 'msw';
import { server } from '../mocks/server';
import {
  parseErrorField,
  servGeneratePostFromImage,
} from '@/services/ai/ai-services';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL;
const REQUEST = { imageBase64: 'AAAA', mimeType: 'image/jpeg' };

describe('parseErrorField', () => {
  it('JSON 본문의 error 문자열을 돌려준다', () => {
    expect(parseErrorField('{"error":"오늘 생성 한도를 넘었습니다."}')).toBe(
      '오늘 생성 한도를 넘었습니다.'
    );
  });

  it.each(['<html>502 Bad Gateway</html>', '', 'null', '{"error":42}', '{}'])(
    'error 문자열을 꺼낼 수 없으면(%s) null을 돌려준다',
    (text) => {
      expect(parseErrorField(text)).toBeNull();
    }
  );
});

describe('servGeneratePostFromImage', () => {
  it('실패 응답의 error 필드를 메시지로 던진다', async () => {
    server.use(
      http.post(`${APP_URL}/api/ai/generate-post`, () =>
        HttpResponse.json(
          { error: '오늘 생성 한도를 넘었습니다.' },
          { status: 429 }
        )
      )
    );

    await expect(servGeneratePostFromImage(REQUEST)).rejects.toThrow(
      '오늘 생성 한도를 넘었습니다.'
    );
  });

  it('실패 응답이 JSON이 아니면 기본 메시지를 던진다', async () => {
    server.use(
      http.post(
        `${APP_URL}/api/ai/generate-post`,
        () => new HttpResponse('<html>502 Bad Gateway</html>', { status: 502 })
      )
    );

    await expect(servGeneratePostFromImage(REQUEST)).rejects.toThrow(
      '게시글 생성에 실패했습니다'
    );
  });
});
