import { cn } from '@/lib/utils';

interface FormFieldErrorProps {
  message?: string;
  className?: string;
}

export function FormFieldError({ message, className }: FormFieldErrorProps) {
  if (!message) return null;

  return (
    <p className={cn('text-sm text-destructive', className)}>{message}</p>
  );
}
