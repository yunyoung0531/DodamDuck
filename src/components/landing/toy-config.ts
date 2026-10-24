export interface ToyAsset {
  id: string;
  src: string;
  /** 데스크톱 기준 표시 반지름(px) */
  radius: number;
}

export const TOY_ASSETS: readonly ToyAsset[] = [
  { id: 'teddy-bear', src: '/images/toys/teddy-bear.svg', radius: 110 },
  { id: 'duck', src: '/images/toys/duck.svg', radius: 100 },
  { id: 'sauropod', src: '/images/toys/sauropod.svg', radius: 95 },
  { id: 'soccer-ball', src: '/images/toys/soccer-ball.svg', radius: 95 },
  { id: 'basketball', src: '/images/toys/basketball.svg', radius: 100 },
  { id: 'racing-car', src: '/images/toys/racing-car.svg', radius: 90 },
  { id: 'robot', src: '/images/toys/robot.svg', radius: 105 },
  { id: 'game-die', src: '/images/toys/game-die.svg', radius: 80 },
  { id: 'puzzle-piece', src: '/images/toys/puzzle-piece.svg', radius: 75 },
  { id: 'kite', src: '/images/toys/kite.svg', radius: 95 },
  { id: 'guitar', src: '/images/toys/guitar.svg', radius: 85 },
  { id: 'balloon', src: '/images/toys/balloon.svg', radius: 85 },
] as const;

export const PHYSICS = {
  GRAVITY_Y: 1,
  /** 통통 튕기는 느낌의 핵심 (0~1) */
  RESTITUTION: 0.7,
  FRICTION: 0.1,
  FRICTION_AIR: 0.01,
  DENSITY: 0.001,
  /** 충돌 바디 반지름 = 표시 반지름 × 비율 (이미지 여백 보정) */
  BODY_RADIUS_RATIO: 0.88,
  WALL_THICKNESS: 200,
} as const;

export const SPAWN = {
  START_DELAY_MS: 300,
  INTERVAL_MS: 90,
  DESKTOP_COUNT: 30,
  MOBILE_COUNT: 10,
  MOBILE_BREAKPOINT: 768,
  MOBILE_SCALE: 0.7,
  RESPAWN_CHECK_MS: 3000,
  /** 이 여유 범위를 벗어나면 유실로 판단 */
  OUT_MARGIN: 400,
} as const;
