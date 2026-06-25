'use client';

import { Spinner } from '@/components/common/Spinner';
import { cn } from '@/lib/utils';

const heightMap = {
  sm: 'min-h-[20vh]',
  md: 'min-h-[40vh]',
  lg: 'min-h-[60vh]',
  full: 'min-h-[calc(100vh-3.5rem)]',
} as const;

interface LoadingStateProps {
  height?: keyof typeof heightMap;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  className?: string;
}

export function LoadingState({
  height = 'md',
  size = 'lg',
  label,
  className,
}: LoadingStateProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-center',
        heightMap[height],
        className
      )}
    >
      <div className="flex flex-col items-center gap-3">
        <Spinner size={size} />
        {label && (
          <p className="text-sm text-muted-foreground">{label}</p>
        )}
      </div>
    </div>
  );
}
