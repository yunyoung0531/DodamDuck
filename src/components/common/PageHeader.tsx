import { cn } from '@/lib/utils';

interface PageHeaderProps {
  subtitle?: string;
  title: string;
  className?: string;
}

export function PageHeader({ subtitle, title, className }: PageHeaderProps) {
  return (
    <div className={cn('flex flex-col items-center gap-1', className)}>
      {subtitle && (
        <p className="text-lg text-muted-foreground">{subtitle}</p>
      )}
      <h1 className="font-heading text-3xl font-bold">{title}</h1>
    </div>
  );
}
