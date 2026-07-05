'use client';

import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
      <Button
        size="icon-lg"
        className="h-14 w-14 rounded-full"
        nativeButton={false}
        render={<Link href={href} />}
      >
        <Plus size={24} />
        {label && <span className="sr-only">{label}</span>}
      </Button>
    </div>
  );
}
