'use client';

import { useState, useRef, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Send, MessageCircle } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { LoadingButton } from '@/components/common/LoadingButton';
import { EmptyState } from '@/components/common/EmptyState';
import { useChatList, useChatMessages, useSendMessage } from '@/services/chat/useChat';
import type { User } from '@supabase/supabase-js';
import type { Profile } from '@/services/auth/auth.types';

interface ChatDetailContentsProps {
  user: User;
  profile: Profile;
}

export default function ChatDetailContents({ user, profile }: ChatDetailContentsProps) {
  const { id } = useParams<{ id: string }>();
  const roomId = Number(id);
  const [message, setMessage] = useState('');
  const viewport = useRef<HTMLDivElement>(null);

  const { data: chatList } = useChatList();
  const { data: messages } = useChatMessages(roomId);
  const sendMessage = useSendMessage();

  const rooms = chatList ?? [];

  const currentRoom = rooms.find((r) => r.id === roomId);
  const isUser1 = currentRoom?.user1_id === user.id;
  const partnerProfile = currentRoom
    ? isUser1
      ? currentRoom.user2_profile
      : currentRoom.user1_profile
    : null;

  useEffect(() => {
    if (viewport.current) {
      viewport.current.scrollTo({
        top: viewport.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);

  function handleSend() {
    if (!message.trim() || roomId <= 0) return;
    sendMessage.mutate(
      { roomId, message },
      { onSuccess: () => setMessage('') }
    );
  }

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
              const chatIsUser1 = chat.user1_id === user.id;
              const pProfile = chatIsUser1
                ? chat.user2_profile
                : chat.user1_profile;
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

        <div className="flex flex-1 flex-col rounded-md border border-gray-200 bg-white">
          <div className="flex items-center gap-3 border-b border-gray-200 p-4">
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
            className="scrollbar-brand h-100 flex-1 overflow-y-auto p-4"
          >
            <div className="flex flex-col gap-3">
              {messages?.map((msg) => {
                const isMe = msg.sender_id === user.id;
                return (
                  <div
                    key={msg.id}
                    className={`flex gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}
                  >
                    {!isMe && (
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>?</AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={`max-w-[70%] px-4 py-2 ${
                        isMe
                          ? 'chat-bubble-me bg-dodam-yellow text-white'
                          : 'chat-bubble-partner bg-gray-100 text-gray-800'
                      }`}
                    >
                      <p className="text-sm">{msg.message}</p>
                    </div>
                  </div>
                );
              })}
              {(!messages || messages.length === 0) && (
                <EmptyState
                  icon={MessageCircle}
                  iconSize={40}
                  message="대화를 시작해보세요"
                  className="py-10"
                />
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 border-t border-gray-200 p-3">
            <Input
              placeholder="메시지를 입력하세요"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="flex-1"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSend();
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
        </div>
      </div>
      </div>
    </div>
  );
}
