'use client';

import Link from 'next/link';
import {
  Text,
  Title,
  Stack,
  Group,
  Avatar,
  Badge,
  Center,
  Loader,
} from '@mantine/core';
import { IconMessageCircle } from '@tabler/icons-react';
import { useChatList } from '@/services/chat/useChat';
import { useUser } from '@/services/auth/useUser';
import { AuthGuard } from '@/components/common/AuthGuard';

export default function ChatPage() {
  return (
    <AuthGuard>
      <ChatContent />
    </AuthGuard>
  );
}

function ChatContent() {
  const { user, profile, isLoading: isUserLoading } = useUser();
  const { data: chatList, isLoading } = useChatList();

  if (isUserLoading || !user || !profile) {
    return (
      <Center className="min-h-[60vh]">
        <Loader size="lg" />
      </Center>
    );
  }

  const rooms = chatList ?? [];

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="flex flex-col gap-6 md:flex-row">
        <div className="w-full md:w-80">
          <Stack align="center" className="mb-6 rounded-md border border-gray-200 bg-white p-4">
            <Avatar
              src={profile.profile_url || undefined}
              size={80}
              radius="xl"
            />
            <Text fw={600}>{profile.display_name}</Text>
            <Badge variant="light">level.{profile.level}</Badge>
          </Stack>

          <Text fw={600} size="sm" className="mb-3">
            채팅 중인 이웃
          </Text>

          {isLoading && (
            <Center className="min-h-[20vh]">
              <Loader size="sm" />
            </Center>
          )}

          <Stack gap="xs">
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
                  <Group
                    className="cursor-pointer rounded-md border border-gray-200 bg-white p-3 transition-colors hover:bg-gray-50"
                    wrap="nowrap"
                  >
                    <Avatar
                      src={partnerProfile.profile_url || undefined}
                      size="md"
                      radius="xl"
                    />
                    <Stack gap={2} className="min-w-0 flex-1">
                      <Text size="sm" fw={600} truncate>
                        {partnerProfile.display_name}
                      </Text>
                      <Text size="xs" c="dimmed" truncate>
                        {chat.last_message}
                      </Text>
                    </Stack>
                  </Group>
                </Link>
              );
            })}

            {!isLoading && rooms.length === 0 && (
              <Text c="dimmed" size="sm" className="text-center">
                채팅 목록이 없습니다.
              </Text>
            )}
          </Stack>
        </div>

        <div className="flex flex-1 flex-col items-center justify-center rounded-md border border-gray-200 bg-white p-10">
          <IconMessageCircle size={80} color="#d6d6d6" />
          <Text c="dimmed" className="mt-4">
            채팅할 상대를 선택해주세요
          </Text>
        </div>
      </div>
    </div>
  );
}
