'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button, Text, Title } from '@mantine/core';
import {
  IconArrowsExchange,
  IconBooks,
  IconUsers,
} from '@tabler/icons-react';

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
        <Title order={1} className="mt-6 text-center text-5xl">
          어제의 장난감, 오늘의 행복
        </Title>
        <Text size="xl" c="dimmed" className="mt-4 text-center">
          여기에서 시작하는 작은 교환, 큰 행복으로 연결됩니다.
        </Text>
        <Text size="lg" c="dimmed" className="mt-1 text-center">
          유아용품 교환 &amp; 나눔 플랫폼
        </Text>
        <Button
          component={Link}
          href="/sharing"
          size="lg"
          className="mt-8"
        >
          교환/나눔 둘러보기
        </Button>
      </section>

      <AnimatedSection className="snap-section flex flex-col items-center justify-center bg-white py-20">
        <Title order={2} className="text-center text-3xl">
          하나의 장난감, 무수한 웃음
        </Title>
        <Text size="lg" c="dimmed" className="mt-4 text-center">
          교환의 기쁨을 경험하세요.
        </Text>
        <div className="mt-10 flex flex-col gap-6 px-4 sm:flex-row sm:gap-8">
          <FeatureCard
            icon={<IconArrowsExchange size={32} className="text-dodam-yellow" />}
            title="장난감 교환"
            description="사용하지 않는 장난감을 필요한 사람에게"
            href="/sharing"
          />
          <FeatureCard
            icon={<IconBooks size={32} className="text-dodam-yellow" />}
            title="장난감 도서관"
            description="광주광역시 공공 장난감 대여 서비스"
            href="/library"
          />
          <FeatureCard
            icon={<IconUsers size={32} className="text-dodam-yellow" />}
            title="정보 나눔"
            description="육아 정보를 함께 공유하는 커뮤니티"
            href="/board"
          />
        </div>
      </AnimatedSection>

      <section className="snap-section flex flex-col items-center justify-center bg-dodam-light py-16">
        <Text c="dimmed" className="text-center">
          우리나라 최초 장난감 교환 플랫폼
        </Text>
        <Title
          order={2}
          className="mt-2 text-center text-5xl font-bold text-dodam-yellow"
        >
          도담덕
        </Title>
        <Text c="dimmed" className="mt-4 text-center">
          나누면 더 커지는 행복, 장난감 교환으로 시작하세요.
        </Text>
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
        <Text fw={700} size="lg" className="mt-3">
          {title}
        </Text>
        <Text c="dimmed" size="sm" className="mt-2 text-center">
          {description}
        </Text>
      </div>
    </Link>
  );
}
