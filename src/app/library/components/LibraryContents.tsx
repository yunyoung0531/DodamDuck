'use client';

import { Phone } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { LoadingState } from '@/components/common/LoadingState';
import { PageHeader } from '@/components/common/PageHeader';
import { useLibraryItems } from '@/services/library/useLibrary';
import { getCategoryConfig } from '@/constants/toy-categories';
import type { LibraryItem } from '@/services/library/library.types';

function ToyCard({ item }: { item: LibraryItem }) {
  const config = getCategoryConfig(item['영 역']);
  const Icon = config.icon;

  return (
    <div className="overflow-hidden rounded-lg border bg-card transition-all hover:-translate-y-1 hover:shadow-lg">
      <div
        className="flex h-35 items-center justify-center [background:var(--card-gradient)]"
        style={{ '--card-gradient': config.gradient } as React.CSSProperties}
      >
        <Icon size={56} color="white" strokeWidth={1.5} />
      </div>

      <div className="flex flex-col gap-2 p-4">
        <p className="truncate text-base font-semibold">{item.장난감명}</p>

        <Badge variant="secondary" className="w-fit">
          {item['영 역']}
        </Badge>

        <div className="flex flex-col gap-1">
          <p className="text-sm text-muted-foreground">
            사용연령: {item.사용연령}
          </p>
          <p className="text-sm text-muted-foreground">
            대여료: {item.대여료}
          </p>
          {item.제조사 && (
            <p className="text-sm text-muted-foreground">
              제조사: {item.제조사}
            </p>
          )}
        </div>

        {item.관리기관전화번호 ? (
          <a
            href={`tel:${item.관리기관전화번호}`}
            className={cn(
              buttonVariants({ variant: 'outline', size: 'sm' }),
              'w-full'
            )}
          >
            <Phone size={16} />
            대여 문의
          </a>
        ) : (
          <Button variant="outline" size="sm" className="w-full" disabled>
            대여 문의
          </Button>
        )}
      </div>
    </div>
  );
}

export default function LibraryContents() {
  const { data: items, isLoading, error } = useLibraryItems();

  return (
    <div className="flex justify-center px-4 py-10">
      <div className="flex w-full max-w-6xl flex-col gap-10">
      <PageHeader
        subtitle="원하는 장난감을 빌릴 수 있는"
        title="장난감 도서관"
      />

      {isLoading && <LoadingState />}

      {error && (
        <div className="flex justify-center">
        <Alert variant="destructive" className="max-w-md">
          <AlertDescription>
            장난감 목록을 불러오는 데 실패했습니다.
          </AlertDescription>
        </Alert>
        </div>
      )}

      {items && (
        <div className="grid grid-cols-1 gap-6 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4">
          {items.map((item) => (
            <ToyCard key={item.순번} item={item} />
          ))}
        </div>
      )}
      </div>
    </div>
  );
}
