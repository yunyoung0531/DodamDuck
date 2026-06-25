'use client';

import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const sizeMap = {
  sm: 'size-4',
  md: 'size-6',
  lg: 'size-10',
} as const;

interface SpinnerProps {
  size?: keyof typeof sizeMap;
  className?: string;
}

export function Spinner({ size = 'md', className }: SpinnerProps) {
  return (
    <Loader2
      className={cn('animate-spin text-dodam-500', sizeMap[size], className)}
    />
  );
}
