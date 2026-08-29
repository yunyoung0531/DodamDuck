'use client';

import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { ComponentProps } from 'react';
import type { VariantProps } from 'class-variance-authority';

interface LinkButtonProps
  extends ComponentProps<typeof Link>,
    VariantProps<typeof buttonVariants> {}

/**
 * 버튼처럼 보이지만 실제로는 이동하는 링크.
 *
 * `<Button render={<Link />}>`를 쓰면 Base UI가 `role="button"`을 덮어써서
 * 스크린 리더가 "이동"이 아니라 "실행"으로 읽는다. 링크는 링크로 남기고
 * 버튼 스타일만 입힌다.
 */
export function LinkButton({
  variant,
  size,
  className,
  ...props
}: LinkButtonProps) {
  return (
    <Link
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}
