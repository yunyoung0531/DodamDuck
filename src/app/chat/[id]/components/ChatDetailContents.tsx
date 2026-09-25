'use client';

import { useRef, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MessageList } from '@/components/chat/MessageList';
import { MessageComposer } from '@/components/chat/MessageComposer';
import { useChatList, useChatMessages } from '@/services/chat/useChat';
import type { User } from '@supabase/supabase-js';
import type { Profile } from '@/services/auth/auth.types';
import type { ChatRoom } from '@/services/chat/chat.types';

export interface ChatDetailContentsProps {
  /** 서버에서 확인한 현재 사용자. 페이지가 인증을 마친 뒤에만 렌더됩니다. */
  user: User;
  /** 현재 사용자 프로필. 왼쪽 카드에 보여줍니다. */
  profile: Profile;
}

/**
 * @description 채팅 상세 화면. 방 목록, 대화 내용, 입력창을 함께 보여줍니다.
 *
 * @remarks
 * 방 id는 `useParams`로 URL에서 읽습니다. 메시지가 늘어나면 목록을 맨 아래로 내립니다.
 * @see docs/implementation-notes/chat.md 스크롤이 메시지 개수에만 반응하는 이유
 * @internal
 * @name ChatDetailContents
 * @tag div
 */
export default function ChatDetailContents({ user, profile }: ChatDetailContentsProps) {
  const { id } = useParams<{ id: string }>();
  const roomId = Number(id);
  const viewport = useRef<HTMLDivElement>(null);

  const { data: chatList } = useChatList();
  const { data: messages } = useChatMessages(roomId);

  const rooms = chatList ?? [];

  const currentRoom = rooms.find((room) => room.id === roomId);
  const partnerProfile = currentRoom ? getPartnerProfile(currentRoom, user.id) : null;

  const messageCount = messages?.length ?? 0;

  useEffect(() => {
    if (viewport.current) {
      viewport.current.scrollTo({
        top: viewport.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messageCount]);

  return (
    <div className="flex justify-center px-4 py-10">
      <div className="w-full max-w-4xl">
      <div className="flex flex-col gap-6 md:flex-row">
        <div className="flex w-full flex-col gap-6 md:w-80">
          <div className="flex flex-col items-center gap-3 rounded-md border border-gray-200 bg-white p-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={profile.profile_url || undefined} />
              <AvatarFallback>{profile.display_name?.[0] ?? '?'}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col items-center gap-1">
              <p className="font-semibold">{profile.display_name}</p>
              <Badge variant="secondary">
                level.{profile.level}
              </Badge>
            </div>
          </div>

          <p className="text-sm font-semibold">채팅 중인 이웃</p>

          <div className="flex flex-col gap-2">
            {rooms.map((chat) => {
              const pProfile = getPartnerProfile(chat, user.id);
              const isActive = chat.id === roomId;

              return (
                <Link
                  key={chat.id}
                  href={`/chat/${chat.id}`}
                  className="no-underline"
                >
                  <div
                    className={`flex cursor-pointer items-center gap-3 rounded-md border p-3 transition-colors ${
                      isActive
                        ? 'border-dodam-yellow bg-dodam-light'
                        : 'border-gray-200 bg-white hover:bg-gray-50'
                    }`}
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={pProfile.profile_url || undefined} />
                      <AvatarFallback>
                        {pProfile.display_name?.[0] ?? '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">
                        {pProfile.display_name}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {chat.last_message}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="flex h-[70vh] flex-1 flex-col rounded-md border border-gray-200 bg-white md:h-[calc(100vh-8.5rem)]">
          <div className="flex shrink-0 items-center gap-3 border-b border-gray-200 p-4">
            <Avatar className="h-10 w-10">
              <AvatarImage src={partnerProfile?.profile_url || undefined} />
              <AvatarFallback>
                {partnerProfile?.display_name?.[0] ?? '?'}
              </AvatarFallback>
            </Avatar>
            <p className="font-semibold">{partnerProfile?.display_name ?? ''}</p>
          </div>

          <div
            ref={viewport}
            className="scrollbar-brand min-h-0 flex-1 overflow-y-auto p-4"
          >
            <MessageList
              messages={messages ?? []}
              roomId={roomId}
              currentUserId={user.id}
              partnerName={partnerProfile?.display_name ?? ''}
              partnerProfileUrl={partnerProfile?.profile_url ?? null}
            />
          </div>

          <MessageComposer roomId={roomId} />

        </div>
      </div>
      </div>
    </div>
  );
}

/** 두 사람 중 내가 아닌 쪽의 프로필을 고릅니다. */
function getPartnerProfile(room: ChatRoom, currentUserId: string) {
  return room.user1_id === currentUserId
    ? room.user2_profile
    : room.user1_profile;
}
