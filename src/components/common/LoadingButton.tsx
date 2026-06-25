'use client';

import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/common/Spinner';
import { cn } from '@/lib/utils';
import type { ComponentProps } from 'react';

interface LoadingButtonProps extends ComponentProps<typeof Button> {
  loading?: boolean;
}

export function LoadingButton({
  loading,
  disabled,
  children,
  className,
  ...props
}: LoadingButtonProps) {
  return (
    <Button
      disabled={loading || disabled}
      className={cn(className)}
      {...props}
    >
      {loading && <Spinner size="sm" className="text-current" />}
      {children}
    </Button>
  );
}
