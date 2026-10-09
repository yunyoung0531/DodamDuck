'use client';

import { Plus } from 'lucide-react';
import type { ReactNode } from 'react';
import { LinkButton } from '@/components/common/LinkButton';
import { cn } from '@/lib/utils';

interface FloatingActionButtonProps {
  href: string;
  label?: string;
  className?: string;
}

interface FloatingActionSlotProps {
  children: ReactNode;
  className?: string;
}

/**
 * @description 화면 오른쪽 아래에 고정하는 자리입니다.
 *
 * @remarks
 * 링크가 아닌 버튼을 띄울 때 `fabButtonProps`와 함께 씁니다. 위치와 모양을 `FloatingActionButton`과 맞추기 위해서입니다.
 */
export function FloatingActionSlot({
  children,
  className,
}: FloatingActionSlotProps) {
  return (
    <div className={cn('fixed right-10 bottom-10 z-50', className)}>
      {children}
    </div>
  );
}

/** 떠 있는 버튼의 크기, 모양, 아이콘. `Button`이나 `LinkButton`에 그대로 펼쳐 넣습니다. */
export function fabButtonProps(label?: string) {
  return {
    size: 'icon-lg',
    className: 'h-14 w-14 rounded-full',
    children: (
      <>
        <Plus size={24} />
        {label && <span className="sr-only">{label}</span>}
      </>
    ),
  } as const;
}

export function FloatingActionButton({
  href,
  label,
  className,
}: FloatingActionButtonProps) {
  return (
    <FloatingActionSlot className={className}>
      <LinkButton href={href} {...fabButtonProps(label)} />
    </FloatingActionSlot>
  );
}
