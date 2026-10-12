import Image from 'next/image';
import { ArrowRight, House } from 'lucide-react';
import { LinkButton } from '@/components/common/LinkButton';

/**
 * @description 없는 경로와 `notFound()` 호출 시 보여주는 404 화면
 *
 * @remarks
 * 루트 레이아웃의 헤더가 그대로 렌더되므로, 화면 전체를 `fixed`로 덮어 헤더를 가립니다.
 * @internal
 * @name NotFound
 */
export default function NotFound() {
  return (
    <section className="fixed inset-0 z-50 overflow-y-auto bg-dodam-light">
      <div className="flex min-h-full flex-col items-center justify-center gap-10 px-6 py-16 md:flex-row md:gap-16">
        <NotFoundIllustration />

        <div className="flex flex-col items-center gap-6 text-center md:items-start md:text-left">
          <div className="flex flex-col gap-4">
            <p
              aria-hidden
              className="font-heading text-8xl leading-none text-dodam-yellow md:text-9xl"
            >
              404
            </p>
            <h1 className="font-heading text-2xl md:text-4xl">
              페이지를 찾을 수 없습니다
            </h1>
            <p className="text-muted-foreground md:text-lg">
              주소가 바뀌었거나 삭제된 페이지예요.
              <br />
              입력하신 주소를 다시 한번 확인해주세요.
            </p>
          </div>

          <NotFoundLinks />
        </div>
      </div>
    </section>
  );
}

/** 물음표 말풍선을 단 도담덕 일러스트. 장식이라 스크린 리더에서 숨깁니다. */
function NotFoundIllustration() {
  return (
    <Image
      src="/images/도담덕_404.png"
      alt=""
      width={1020}
      height={1020}
      preload
      className="size-64 shrink-0 md:size-80"
    />
  );
}

/** 홈과 장난감 교환으로 가는 버튼 */
function NotFoundLinks() {
  return (
    <div className="flex flex-wrap justify-center gap-2 md:justify-start">
      <LinkButton href="/" className="h-11 gap-2 px-5 text-base">
        <House />
        홈으로 가기
      </LinkButton>
      <LinkButton
        href="/sharing"
        variant="outline"
        className="h-11 gap-2 bg-white px-5 text-base"
      >
        장난감 교환 둘러보기
        <ArrowRight />
      </LinkButton>
    </div>
  );
}
