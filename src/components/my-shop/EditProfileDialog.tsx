'use client';

import { useState } from 'react';
import { Pencil } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { EditProfileForm } from '@/components/my-shop/EditProfileForm';
import type { Profile } from '@/services/auth/auth.types';

export interface EditProfileDialogProps {
  /** 폼의 초기값이 되는 현재 프로필 */
  profile: Profile;
}

/**
 * @description 프로필을 수정하는 다이얼로그입니다.
 *
 * @remarks
 * 닫히면 Base UI가 포털을 통째로 걷어내므로(`keepMounted` 기본값 false) 폼도 함께
 * 언마운트됩니다. 닫았다 열면 입력과 미리보기가 초기 상태로 돌아갑니다.
 * @internal
 * @name EditProfileDialog
 * @tag button
 */
export function EditProfileDialog({ profile }: EditProfileDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" size="sm" />}>
        <Pencil className="size-4" />
        내 정보 수정
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>내 정보 수정</DialogTitle>
          <DialogDescription>
            프로필 사진, 닉네임, 위치를 수정할 수 있습니다.
          </DialogDescription>
        </DialogHeader>

        <EditProfileForm profile={profile} onDone={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
