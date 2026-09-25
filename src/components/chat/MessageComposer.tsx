'use client';

import { useState } from 'react';
import { Send } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { LoadingButton } from '@/components/common/LoadingButton';
import { useSendMessage } from '@/services/chat/useChat';

export interface MessageComposerProps {
  roomId: number;
}

/**
 * @description 메시지를 입력하고 보내는 입력창입니다.
 *
 * @remarks
 * 입력 중인 글자를 이 컴포넌트가 소유합니다. 부모에 두면 한 글자마다 메시지 목록까지
 * 리렌더됩니다. 전송에 성공하면 입력창을 비웁니다.
 * @see docs/implementation-notes/chat.md 한글 IME에서 Enter를 거르는 이유
 * @internal
 * @name MessageComposer
 * @tag div
 */
export function MessageComposer({ roomId }: MessageComposerProps) {
  const [message, setMessage] = useState('');
  const sendMessage = useSendMessage();

  function handleSend() {
    if (!message.trim() || roomId <= 0 || sendMessage.isPending) return;
    sendMessage.mutate({ roomId, message }, { onSuccess: () => setMessage('') });
  }

  return (
    <div className="flex shrink-0 items-center gap-2 border-t border-gray-200 p-3">
      <Input
        placeholder="메시지를 입력하세요"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="flex-1"
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
            handleSend();
          }
        }}
      />
      <LoadingButton
        size="icon"
        onClick={handleSend}
        loading={sendMessage.isPending}
      >
        <Send size={16} />
      </LoadingButton>
    </div>
  );
}
