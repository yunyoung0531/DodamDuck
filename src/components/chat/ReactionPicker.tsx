'use client';

import { useState } from 'react';
import { SmilePlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { CHAT_REACTION_EMOJIS } from '@/services/chat/chat.types';

export interface ReactionPickerProps {
  myEmojis: string[];
  onSelect: (emoji: string, isMine: boolean) => void;
}

/**
 * @description 말풍선에 리액션을 다는 이모지 피커입니다.
 *
 * @remarks
 * 트리거 버튼은 부모의 `group` 호버나 포커스에서만 드러납니다. 부모에 `group` 클래스가
 * 없으면 버튼이 보이지 않습니다.
 * @see docs/implementation-notes/chat.md 버튼을 숨기지 않고 투명하게만 두는 이유
 * @internal
 * @name ReactionPicker
 * @tag button
 */
export function ReactionPicker({ myEmojis, onSelect }: ReactionPickerProps) {
  const [open, setOpen] = useState(false);

  function handleSelect(emoji: string) {
    onSelect(emoji, myEmojis.includes(emoji));
    setOpen(false);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="리액션 달기"
            className="h-6 w-6 text-muted-foreground opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100 data-popup-open:opacity-100"
          >
            <SmilePlus size={14} />
          </Button>
        }
      />
      <PopoverContent className="w-auto flex-row gap-1 p-1">
        {CHAT_REACTION_EMOJIS.map((emoji) => (
          <Button
            key={emoji}
            type="button"
            variant="ghost"
            size="icon"
            aria-label={emoji}
            aria-pressed={myEmojis.includes(emoji)}
            onClick={() => handleSelect(emoji)}
            className={`h-9 w-9 text-lg ${
              myEmojis.includes(emoji) ? 'bg-dodam-light' : ''
            }`}
          >
            <span aria-hidden="true">{emoji}</span>
          </Button>
        ))}
      </PopoverContent>
    </Popover>
  );
}
