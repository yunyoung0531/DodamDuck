'use client';

import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';

export interface DeletePostButtonProps {
  /** 확인을 누르면 호출됩니다. */
  onConfirm: () => void;
  /** 삭제 요청이 진행 중인지. 확인 버튼이 잠깁니다. */
  isLoading: boolean;
}

/**
 * @description 게시글을 지우는 휴지통 버튼입니다. 누르면 확인 다이얼로그를 띄웁니다.
 *
 * @remarks
 * 작성자에게만 보여야 하므로 호출부가 조건부로 렌더합니다.
 * @public
 * @name DeletePostButton
 * @tag button
 */
export function DeletePostButton({
  onConfirm,
  isLoading,
}: DeletePostButtonProps) {
  return (
    <ConfirmDialog
      trigger={
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="게시글 삭제"
          className="text-destructive hover:text-destructive/80"
        >
          <Trash2 size={18} />
        </Button>
      }
      title="게시글 삭제"
      description="이 게시글을 삭제하시겠습니까? 삭제된 게시글은 복구할 수 없습니다."
      onConfirm={onConfirm}
      isLoading={isLoading}
    />
  );
}
