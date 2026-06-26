'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowLeftRight,
  BookOpen,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  return (
    <div className="snap-container">
      <section className="snap-section flex flex-col items-center justify-center bg-dodam-light">
        <Image
          src="/images/도담덕로고.png"
          alt="도담덕 캐릭터"
          width={200}
          height={200}
          priority
        />
        <h1 className="mt-6 text-center font-heading text-5xl font-bold">
          어제의 장난감, 오늘의 행복
        </h1>
        <p className="mt-4 text-center text-xl text-muted-foreground">
          여기에서 시작하는 작은 교환, 큰 행복으로 연결됩니다.
        </p>
        <p className="mt-1 text-center text-lg text-muted-foreground">
          유아용품 교환 &amp; 나눔 플랫폼
        </p>
        <Button size="lg" className="mt-8" nativeButton={false} render={<Link href="/sharing" />}>
          교환/나눔 둘러보기
        </Button>
      </section>

      <AnimatedSection className="snap-section flex flex-col items-center justify-center bg-white py-20">
        <h2 className="text-center font-heading text-3xl font-bold">
          하나의 장난감, 무수한 웃음
        </h2>
        <p className="mt-4 text-center text-lg text-muted-foreground">
          교환의 기쁨을 경험하세요.
        </p>
        <div className="mt-10 flex flex-col gap-6 px-4 sm:flex-row sm:gap-8">
          <FeatureCard
            icon={<ArrowLeftRight size={32} className="text-dodam-yellow" />}
            title="장난감 교환"
            description="사용하지 않는 장난감을 필요한 사람에게"
            href="/sharing"
          />
          <FeatureCard
            icon={<BookOpen size={32} className="text-dodam-yellow" />}
            title="장난감 도서관"
            description="광주광역시 공공 장난감 대여 서비스"
            href="/library"
          />
          <FeatureCard
            icon={<Users size={32} className="text-dodam-yellow" />}
            title="정보 나눔"
            description="육아 정보를 함께 공유하는 커뮤니티"
            href="/board"
          />
        </div>
      </AnimatedSection>

      <section className="snap-section flex flex-col items-center justify-center bg-dodam-light py-16">
        <p className="text-center text-muted-foreground">
          우리나라 최초 장난감 교환 플랫폼
        </p>
        <h2 className="mt-2 text-center font-heading text-5xl font-bold text-dodam-yellow">
          도담덕
        </h2>
        <p className="mt-4 text-center text-muted-foreground">
          나누면 더 커지는 행복, 장난감 교환으로 시작하세요.
        </p>
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

function FeatureCard({
  icon,
  title,
  description,
  href,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
}) {
  return (
    <Link href={href} className="no-underline">
      <div className="flex h-52 w-64 flex-col items-center justify-center rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
        {icon}
        <p className="mt-3 text-lg font-bold">{title}</p>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          {description}
        </p>
      </div>
    </Link>
  );
}
