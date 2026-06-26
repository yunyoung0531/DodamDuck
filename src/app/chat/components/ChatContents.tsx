'use client';

import Link from 'next/link';
import { MessageCircle } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { LoadingState } from '@/components/common/LoadingState';
import { EmptyState } from '@/components/common/EmptyState';
import { useChatList } from '@/services/chat/useChat';
import type { User } from '@supabase/supabase-js';
import type { Profile } from '@/services/auth/auth.types';

interface ChatContentsProps {
  user: User;
  profile: Profile;
}

export default function ChatContents({ user, profile }: ChatContentsProps) {
  const { data: chatList, isLoading } = useChatList();

  const rooms = chatList ?? [];

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

          {isLoading && <LoadingState height="sm" size="sm" />}

          <div className="flex flex-col gap-2">
            {rooms.map((chat) => {
              const isUser1 = chat.user1_id === user.id;
              const partnerProfile = isUser1
                ? chat.user2_profile
                : chat.user1_profile;

              return (
                <Link
                  key={chat.id}
                  href={`/chat/${chat.id}`}
                  className="no-underline"
                >
                  <div className="flex cursor-pointer items-center gap-3 rounded-md border border-gray-200 bg-white p-3 transition-colors hover:bg-gray-50">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={partnerProfile.profile_url || undefined} />
                      <AvatarFallback>
                        {partnerProfile.display_name?.[0] ?? '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">
                        {partnerProfile.display_name}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {chat.last_message}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}

            {!isLoading && rooms.length === 0 && (
              <EmptyState
                icon={MessageCircle}
                message="채팅 목록이 없습니다."
                className="py-6"
              />
            )}
          </div>
        </div>

        <div className="flex flex-1 flex-col items-center justify-center gap-4 rounded-md border border-gray-200 bg-white p-10">
          <MessageCircle size={80} className="text-gray-300" />
          <p className="text-muted-foreground">
            채팅할 상대를 선택해주세요
          </p>
        </div>
      </div>
      </div>
    </div>
  );
}
