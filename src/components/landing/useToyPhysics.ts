import { useEffect, useSyncExternalStore, type RefObject } from 'react';

import Matter from 'matter-js';

import { PHYSICS, SPAWN, TOY_ASSETS, type ToyAsset } from './toy-config';

interface LoadedToy extends ToyAsset {
  textureWidth: number;
}

interface Walls {
  floor: Matter.Body;
  left: Matter.Body;
  right: Matter.Body;
}

/** matter.js Mouse가 내부적으로 보관하는 DOM 이벤트 핸들러 (타입 미공개) */
interface MouseInternalHandlers {
  mousemove: EventListener;
  mousedown: EventListener;
  mouseup: EventListener;
  mousewheel: EventListener;
}

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

function subscribeReducedMotion(callback: () => void) {
  const mediaQuery = window.matchMedia(REDUCED_MOTION_QUERY);
  mediaQuery.addEventListener('change', callback);
  return () => mediaQuery.removeEventListener('change', callback);
}

export function usePrefersReducedMotion() {
  return useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia(REDUCED_MOTION_QUERY).matches,
    () => false
  );
}

function createWalls(width: number, height: number): Walls {
  const thickness = PHYSICS.WALL_THICKNESS;
  const options = { isStatic: true, render: { visible: false } };

  return {
    floor: Matter.Bodies.rectangle(
      width / 2,
      height + thickness / 2,
      width * 3,
      thickness,
      options
    ),
    left: Matter.Bodies.rectangle(
      -thickness / 2,
      height / 2,
      thickness,
      height * 4,
      options
    ),
    right: Matter.Bodies.rectangle(
      width + thickness / 2,
      height / 2,
      thickness,
      height * 4,
      options
    ),
  };
}

function repositionWalls(walls: Walls, width: number, height: number) {
  const thickness = PHYSICS.WALL_THICKNESS;
  Matter.Body.setPosition(walls.floor, {
    x: width / 2,
    y: height + thickness / 2,
  });
  Matter.Body.setPosition(walls.left, {
    x: -thickness / 2,
    y: height / 2,
  });
  Matter.Body.setPosition(walls.right, {
    x: width + thickness / 2,
    y: height / 2,
  });
}

/** SVG를 target 크기로 래스터화하여 data URL 반환 */
function rasterizeSvg(image: HTMLImageElement, size: number): string {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';
  ctx.drawImage(image, 0, 0, size, size);
  return canvas.toDataURL();
}

function loadToyImages(assets: readonly ToyAsset[]): Promise<LoadedToy[]> {
  return Promise.all(
    assets.map(
      (asset) =>
        new Promise<LoadedToy>((resolve) => {
          const image = new window.Image();
          image.onload = () => {
            const targetSize = asset.radius * 2;
            const isSvg = asset.src.endsWith('.svg');

            if (isSvg && image.naturalWidth < targetSize) {
              const dataUrl = rasterizeSvg(image, targetSize);
              resolve({
                ...asset,
                src: dataUrl || asset.src,
                textureWidth: dataUrl ? targetSize : image.naturalWidth,
              });
            } else {
              resolve({ ...asset, textureWidth: image.naturalWidth });
            }
          };
          image.onerror = () => resolve({ ...asset, textureWidth: 0 });
          image.src = asset.src;
        })
    )
  ).then((loaded) => loaded.filter((toy) => toy.textureWidth > 0));
}

function createToyBody(toy: LoadedToy, x: number, y: number, scale: number) {
  const radius = toy.radius * scale;
  const spriteScale = (radius * 2) / toy.textureWidth;

  return Matter.Bodies.circle(x, y, radius * PHYSICS.BODY_RADIUS_RATIO, {
    restitution: PHYSICS.RESTITUTION,
    friction: PHYSICS.FRICTION,
    frictionAir: PHYSICS.FRICTION_AIR,
    density: PHYSICS.DENSITY,
    angle: Math.random() * Math.PI * 2,
    render: {
      sprite: { texture: toy.src, xScale: spriteScale, yScale: spriteScale },
    },
  });
}

function scheduleToySpawns(params: {
  world: Matter.World;
  toys: LoadedToy[];
  getWidth: () => number;
  scale: number;
  count: number;
  timeouts: number[];
}) {
  const { world, toys, getWidth, scale, count, timeouts } = params;

  for (let i = 0; i < count; i += 1) {
    const toy = toys[i % toys.length];
    if (!toy) continue;

    const timeoutId = window.setTimeout(() => {
      const width = getWidth();
      const x = width * 0.1 + Math.random() * width * 0.8;
      const y = -100 - Math.random() * 300;
      const body = createToyBody(toy, x, y, scale);
      Matter.Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.15);
      Matter.Composite.add(world, body);
    }, SPAWN.START_DELAY_MS + i * SPAWN.INTERVAL_MS);

    timeouts.push(timeoutId);
  }
}

function attachMouse(engine: Matter.Engine, render: Matter.Render) {
  const mouse = Matter.Mouse.create(render.canvas);
  const mouseConstraint = Matter.MouseConstraint.create(engine, {
    mouse,
    constraint: { stiffness: 0.2, render: { visible: false } },
  });

  // matter.js가 등록한 wheel/터치 리스너 제거 → 페이지 스크롤 보존, 모바일은 스크롤 우선
  const handlers = mouse as unknown as Matter.Mouse & MouseInternalHandlers;
  mouse.element.removeEventListener('wheel', handlers.mousewheel);
  mouse.element.removeEventListener('touchstart', handlers.mousedown);
  mouse.element.removeEventListener('touchmove', handlers.mousemove);
  mouse.element.removeEventListener('touchend', handlers.mouseup);

  render.mouse = mouse;
  return mouseConstraint;
}

/** 드래그로 화면 밖 멀리 던져진 바디를 상단에서 재스폰 */
function startRespawner(
  engine: Matter.Engine,
  getBounds: () => { width: number; height: number }
) {
  return window.setInterval(() => {
    const { width, height } = getBounds();

    for (const body of engine.world.bodies) {
      if (body.isStatic) continue;
      const isOut =
        body.position.y > height + SPAWN.OUT_MARGIN ||
        body.position.x < -SPAWN.OUT_MARGIN ||
        body.position.x > width + SPAWN.OUT_MARGIN;
      if (!isOut) continue;

      Matter.Body.setPosition(body, {
        x: width * 0.1 + Math.random() * width * 0.8,
        y: -150,
      });
      Matter.Body.setVelocity(body, { x: 0, y: 0 });
    }
  }, SPAWN.RESPAWN_CHECK_MS);
}

/** 리사이즈 대응 + 탭 비활성/뷰포트 이탈 시 시뮬레이션 일시정지 */
function observeEnvironment(params: {
  container: HTMLDivElement;
  render: Matter.Render;
  runner: Matter.Runner;
  walls: Walls;
  onResize: (width: number, height: number) => void;
}) {
  const { container, render, runner, walls, onResize } = params;
  let isVisible = true;
  let isIntersecting = true;

  const syncRunner = () => {
    runner.enabled = isVisible && isIntersecting;
  };

  const resizeObserver = new ResizeObserver(() => {
    const width = container.clientWidth;
    const height = container.clientHeight;
    Matter.Render.setSize(render, width, height);
    repositionWalls(walls, width, height);
    onResize(width, height);
  });
  resizeObserver.observe(container);

  const handleVisibility = () => {
    isVisible = !document.hidden;
    syncRunner();
  };
  document.addEventListener('visibilitychange', handleVisibility);

  const intersectionObserver = new IntersectionObserver(
    ([entry]) => {
      if (!entry) return;
      isIntersecting = entry.isIntersecting;
      syncRunner();
    },
    { threshold: 0.05 }
  );
  intersectionObserver.observe(container);

  return () => {
    resizeObserver.disconnect();
    intersectionObserver.disconnect();
    document.removeEventListener('visibilitychange', handleVisibility);
  };
}

interface Scene {
  engine: Matter.Engine;
  render: Matter.Render;
  runner: Matter.Runner;
  walls: Walls;
}

function createScene(
  container: HTMLDivElement,
  width: number,
  height: number
): Scene {
  const engine = Matter.Engine.create({ enableSleeping: true });
  engine.gravity.y = PHYSICS.GRAVITY_Y;

  const render = Matter.Render.create({
    element: container,
    engine,
    options: {
      width,
      height,
      wireframes: false,
      background: 'transparent',
      pixelRatio: window.devicePixelRatio,
      // sleeping 바디를 반투명으로 그리는 기본 동작 비활성화 (흐려짐 방지)
      showSleeping: false,
    },
  });
  render.canvas.classList.add('touch-pan-y');

  const walls = createWalls(width, height);
  Matter.Composite.add(engine.world, [walls.floor, walls.left, walls.right]);
  Matter.Composite.add(engine.world, attachMouse(engine, render));

  const runner = Matter.Runner.create();
  Matter.Runner.run(runner, engine);
  Matter.Render.run(render);

  return { engine, render, runner, walls };
}

function destroyScene({ engine, render, runner }: Scene) {
  Matter.Render.stop(render);
  Matter.Runner.stop(runner);
  Matter.Composite.clear(engine.world, false);
  Matter.Engine.clear(engine);
  render.canvas.remove();
  render.textures = {};
}

export function useToyPhysics(
  containerRef: RefObject<HTMLDivElement | null>,
  enabled: boolean
) {
  useEffect(() => {
    const container = containerRef.current;
    if (!enabled || !container) return;

    let width = container.clientWidth;
    let height = container.clientHeight;

    const scene = createScene(container, width, height);

    const timeouts: number[] = [];
    let cancelled = false;
    loadToyImages(TOY_ASSETS).then((toys) => {
      if (cancelled || toys.length === 0) return;
      const isMobile = width < SPAWN.MOBILE_BREAKPOINT;
      scheduleToySpawns({
        world: scene.engine.world,
        toys,
        getWidth: () => width,
        scale: isMobile ? SPAWN.MOBILE_SCALE : 1,
        count: isMobile ? SPAWN.MOBILE_COUNT : SPAWN.DESKTOP_COUNT,
        timeouts,
      });
    });

    const respawnerId = startRespawner(scene.engine, () => ({
      width,
      height,
    }));
    const disconnectObservers = observeEnvironment({
      container,
      render: scene.render,
      runner: scene.runner,
      walls: scene.walls,
      onResize: (nextWidth, nextHeight) => {
        width = nextWidth;
        height = nextHeight;
      },
    });

    return () => {
      cancelled = true;
      timeouts.forEach((id) => window.clearTimeout(id));
      window.clearInterval(respawnerId);
      disconnectObservers();
      destroyScene(scene);
    };
  }, [containerRef, enabled]);
}
