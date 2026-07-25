'use client';

import { useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';

import { Button } from '@/components/ui/button';

import { TOY_ASSETS } from './toy-config';
import { usePrefersReducedMotion, useToyPhysics } from './useToyPhysics';

export default function ToyPhysicsHero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  useToyPhysics(containerRef, !prefersReducedMotion);

  return (
    <section className="snap-section relative overflow-hidden bg-dodam-light">
      {prefersReducedMotion ? (
        <StaticToyPile />
      ) : (
        <div
          ref={containerRef}
          data-testid="toy-physics-canvas"
          aria-hidden="true"
          className="absolute inset-0"
        />
      )}

      <div className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center gap-8 px-4 pt-[12vh] text-center">
        <h1 className="font-heading text-[clamp(1.75rem,1rem+3.2vw,3.4375rem)]">
          어제의 장난감, 오늘의 행복
        </h1>
        <div className="flex flex-col gap-2.5">
          <h5 className="text-landing-sub">여기에서 시작하는 작은 교환,</h5>
          <h5 className="text-landing-sub">큰 행복으로 연결됩니다.</h5>
        </div>
        <Button
          size="lg"
          className="pointer-events-auto px-6"
          render={<Link href="/sharing" />}
        >
          교환하러 가기
        </Button>
      </div>
    </section>
  );
}

/** 라운드별 결정적 스케일 (하이드레이션 불일치 방지) */
const ROUND_SCALES = [1, 0.85, 0.75] as const;

/** prefers-reduced-motion 사용자를 위한 정적 폴백: 바닥에 쌓인 장난감 */
function StaticToyPile() {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-x-0 bottom-0 flex h-2/3 flex-wrap content-end items-end justify-center gap-1 overflow-hidden px-2 pb-4"
    >
      {ROUND_SCALES.map((scale, round) =>
        TOY_ASSETS.map((toy) => (
          <Image
            key={`${toy.id}-${round}`}
            src={toy.src}
            alt=""
            width={Math.round(toy.radius * 2 * scale)}
            height={Math.round(toy.radius * 2 * scale)}
          />
        ))
      )}
    </div>
  );
}
