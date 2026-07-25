import { existsSync } from 'node:fs';
import { join } from 'node:path';

import { PHYSICS, SPAWN, TOY_ASSETS } from '@/components/landing/toy-config';

describe('TOY_ASSETS', () => {
  it('id가 중복되지 않는다', () => {
    const ids = TOY_ASSETS.map((toy) => toy.id);

    expect(new Set(ids).size).toBe(ids.length);
  });

  it('모든 에셋 파일이 public 디렉토리에 존재한다', () => {
    for (const toy of TOY_ASSETS) {
      const filePath = join(process.cwd(), 'public', toy.src);

      expect(existsSync(filePath), `${toy.src} 파일이 없습니다`).toBe(true);
    }
  });

  it('반지름이 양수이다', () => {
    for (const toy of TOY_ASSETS) {
      expect(toy.radius).toBeGreaterThan(0);
    }
  });
});

describe('PHYSICS / SPAWN 상수', () => {
  it('반발계수는 0과 1 사이이다', () => {
    expect(PHYSICS.RESTITUTION).toBeGreaterThan(0);
    expect(PHYSICS.RESTITUTION).toBeLessThanOrEqual(1);
  });

  it('모바일 스폰 수는 데스크톱보다 적다', () => {
    expect(SPAWN.MOBILE_COUNT).toBeLessThan(SPAWN.DESKTOP_COUNT);
  });
});
