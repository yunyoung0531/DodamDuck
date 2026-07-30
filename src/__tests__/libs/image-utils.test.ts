import {
  detectMimeType,
  convertHeicToJpeg,
  SUPPORTED_MIMES,
  MAX_FILE_SIZE,
} from '@/libs/image-utils';

describe('SUPPORTED_MIMES', () => {
  it('5종의 이미지 MIME 타입을 지원한다', () => {
    expect(SUPPORTED_MIMES.size).toBe(5);
    expect(SUPPORTED_MIMES.has('image/jpeg')).toBe(true);
    expect(SUPPORTED_MIMES.has('image/png')).toBe(true);
    expect(SUPPORTED_MIMES.has('image/gif')).toBe(true);
    expect(SUPPORTED_MIMES.has('image/webp')).toBe(true);
    expect(SUPPORTED_MIMES.has('image/heic')).toBe(true);
  });
});

describe('MAX_FILE_SIZE', () => {
  it('5MB로 설정되어 있다', () => {
    expect(MAX_FILE_SIZE).toBe(5 * 1024 * 1024);
  });
});

describe('detectMimeType', () => {
  it('JPEG 매직바이트를 감지한다', () => {
    const buffer = new Uint8Array([0xff, 0xd8, 0xff, 0xe0]).buffer;
    expect(detectMimeType(buffer)).toBe('image/jpeg');
  });

  it('PNG 매직바이트를 감지한다', () => {
    const buffer = new Uint8Array([0x89, 0x50, 0x4e, 0x47]).buffer;
    expect(detectMimeType(buffer)).toBe('image/png');
  });

  it('GIF 매직바이트를 감지한다', () => {
    const buffer = new Uint8Array([0x47, 0x49, 0x46, 0x38]).buffer;
    expect(detectMimeType(buffer)).toBe('image/gif');
  });

  it('WebP 매직바이트를 감지한다', () => {
    const buffer = new Uint8Array([
      0x52, 0x49, 0x46, 0x46, 0x00, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50,
    ]).buffer;
    expect(detectMimeType(buffer)).toBe('image/webp');
  });

  it('HEIC ftyp 박스를 감지한다', () => {
    const buffer = new Uint8Array([
      0x00, 0x00, 0x00, 0x00, 0x66, 0x74, 0x79, 0x70,
    ]).buffer;
    expect(detectMimeType(buffer)).toBe('image/heic');
  });

  it('알 수 없는 포맷은 null을 반환한다', () => {
    const buffer = new Uint8Array([0x00, 0x00, 0x00, 0x00]).buffer;
    expect(detectMimeType(buffer)).toBeNull();
  });

  it('빈 버퍼는 null을 반환한다', () => {
    const buffer = new Uint8Array([]).buffer;
    expect(detectMimeType(buffer)).toBeNull();
  });
});

vi.mock('heic2any', () => ({
  default: vi.fn(() =>
    Promise.resolve(new Blob(['converted'], { type: 'image/jpeg' }))
  ),
}));

describe('convertHeicToJpeg', () => {
  it('HEIC 파일을 JPEG로 변환한다', async () => {
    const heicFile = new File(['heic-data'], 'photo.heic', {
      type: 'image/heic',
    });

    const result = await convertHeicToJpeg(heicFile);

    expect(result.name).toBe('photo.jpg');
    expect(result.type).toBe('image/jpeg');
  });
});
