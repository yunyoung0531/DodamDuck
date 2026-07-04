'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';

export default function HomePage() {
  return (
    <div className="snap-container">
      <section className="snap-section flex flex-col lg:flex-row items-center justify-center bg-dodam-light">
        <Image
          src="/images/도담덕캐릭터.png"
          alt="도담덕 캐릭터"
          width={250}
          height={250}
          className="main-dodamduck-img hidden lg:block"
        />
        <div className="text-center">
          <h1 className="font-heading text-[clamp(1.75rem,1rem+3.2vw,3.4375rem)]">
            어제의 장난감, 오늘의 행복
          </h1>
          <div className="flex flex-col gap-2.5 pt-7">
            <h5 className="text-landing-sub text-center lg:pr-8">여기에서 시작하는 작은 교환,</h5>
            <h5 className="text-landing-sub text-center lg:pl-8">큰 행복으로 연결됩니다.</h5>
          </div>
        </div>
      </section>

      <AnimatedSection className="snap-section main2-container bg-dodam-light">
        <div className="hidden lg:block pl-[16.875rem]">
          <Image
            src="/images/도담덕캐릭터.png"
            alt="도담덕 캐릭터"
            width={250}
            height={250}
            className="main-dodamduck-img"
          />
        </div>
        <div className="text-center lg:pl-5">
          <div>
            <h2 className="text-[clamp(1.75rem,1rem+2.8vw,3.125rem)] font-heading">하나의 장난감,</h2>
            <h2 className="text-[clamp(1.75rem,1rem+2.8vw,3.125rem)] font-heading">무수한 웃음</h2>
          </div>
          <div className="pt-2.5">
            <h5 className="text-landing-sub">교환의 기쁨을 경험하세요.</h5>
          </div>
        </div>
        <Image
          src="/images/안드로이드_메인.png"
          alt="안드로이드 메인"
          width={170}
          height={340}
          className="android-phone-tilted-left main2-android-main hidden lg:block"
        />
        <Image
          src="/images/안드로이드_홈.png"
          alt="안드로이드 홈"
          width={170}
          height={340}
          className="android-phone-tilted-right main-android-home hidden lg:block"
        />
      </AnimatedSection>

      <AnimatedSection className="snap-section main1-container app-main3 bg-dodam-light">
        <div className="hidden lg:block pl-[10rem]">
          <Image
            src="/images/도담덕캐릭터.png"
            alt="도담덕 캐릭터"
            width={250}
            height={250}
            className="main-dodamduck-img"
          />
        </div>
        <div className="z-[3] flex flex-col gap-1">
          <h2 className="text-[clamp(1.5rem,0.8rem+2.8vw,3rem)] font-heading text-center lg:text-right lg:pr-16">나누면 더 커지는 행복,</h2>
          <h2 className="text-[clamp(1.5rem,0.8rem+2.8vw,3rem)] font-heading text-center lg:text-left lg:pl-5">
            장난감 교환으로 시작하세요.
          </h2>
        </div>
        <Image
          src="/images/안드로이드_메인.png"
          alt="안드로이드 메인"
          width={170}
          height={340}
          className="android-phone-tilted-left main3-android-main hidden lg:block"
        />
        <Image
          src="/images/안드로이드_도서관.png"
          alt="안드로이드 도서관"
          width={170}
          height={340}
          className="android-phone-tilted-right main-android-library hidden lg:block"
        />
      </AnimatedSection>

      <section className="snap-section main1-container app-main4 bg-dodam-light">
        <div className="main4-large-container">
          <p className="main4-txt">우리나라 최초 장난감 교환 플랫폼</p>
          <h2 className="main4-dodamduck-txt">도담덕</h2>
          <Image
            src="/images/안드로이드_손.png"
            alt="안드로이드 손"
            width={233}
            height={233}
            className="main4-hand-img hidden lg:block"
          />
          <Image
            src="/images/도담덕캐릭터.png"
            alt="도담덕 캐릭터"
            width={150}
            height={150}
            className="main4-dodamduck-img hidden lg:block"
          />
        </div>
      </section>
    </div>
  );
}

function AnimatedSection({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          el.classList.add('visible');
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} className={`slide-in ${className ?? ''}`}>
      {children}
    </section>
  );
}
