'use client';

import { Plus } from 'lucide-react';
import { LinkButton } from '@/components/common/LinkButton';
import { cn } from '@/lib/utils';

interface FloatingActionButtonProps {
  href: string;
  label?: string;
  className?: string;
}

export function FloatingActionButton({
  href,
  label,
  className,
}: FloatingActionButtonProps) {
  return (
    <div className={cn('fixed bottom-10 right-10 z-50', className)}>
      <LinkButton
        href={href}
        size="icon-lg"
        className="h-14 w-14 rounded-full"
      >
        <Plus size={24} />
        {label && <span className="sr-only">{label}</span>}
      </LinkButton>
    </div>
  );
}
