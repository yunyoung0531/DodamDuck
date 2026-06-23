'use client';

import { useState, useRef, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Text,
  Stack,
  Group,
  Avatar,
  Badge,
  TextInput,
  ActionIcon,
  Center,
  Loader,
  ScrollArea,
} from '@mantine/core';
import { IconSend, IconMessageCircle } from '@tabler/icons-react';
import { useChatList, useChatMessages, useSendMessage } from '@/services/chat/useChat';
import { useUser } from '@/services/auth/useUser';
import { AuthGuard } from '@/components/common/AuthGuard';

export default function ChatDetailPage() {
  return (
    <AuthGuard>
      <ChatDetailContent />
    </AuthGuard>
  );
}

function ChatDetailContent() {
  const { id } = useParams<{ id: string }>();
  const roomId = Number(id);
  const { user, profile, isLoading: isUserLoading } = useUser();
  const [message, setMessage] = useState('');
  const viewport = useRef<HTMLDivElement>(null);

  const { data: chatList } = useChatList();
  const { data: messages } = useChatMessages(roomId);
  const sendMessage = useSendMessage();

  const rooms = chatList ?? [];

  const currentRoom = rooms.find((r) => r.id === roomId);
  const isUser1 = currentRoom?.user1_id === user?.id;
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
    if (!message.trim() || !user || roomId <= 0) return;
    sendMessage.mutate(
      { roomId, message },
      { onSuccess: () => setMessage('') }
    );
  }

  if (isUserLoading || !user || !profile) {
    return (
      <Center className="min-h-[60vh]">
        <Loader size="lg" />
      </Center>
    );
  }

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

          <Stack gap="xs">
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
                  <Group
                    className={`cursor-pointer rounded-md border p-3 transition-colors ${
                      isActive
                        ? 'border-dodam-yellow bg-dodam-light'
                        : 'border-gray-200 bg-white hover:bg-gray-50'
                    }`}
                    wrap="nowrap"
                  >
                    <Avatar
                      src={pProfile.profile_url || undefined}
                      size="md"
                      radius="xl"
                    />
                    <Stack gap={2} className="min-w-0 flex-1">
                      <Text size="sm" fw={600} truncate>
                        {pProfile.display_name}
                      </Text>
                      <Text size="xs" c="dimmed" truncate>
                        {chat.last_message}
                      </Text>
                    </Stack>
                  </Group>
                </Link>
              );
            })}
          </Stack>
        </div>

        <div className="flex flex-1 flex-col rounded-md border border-gray-200 bg-white">
          <Group className="border-b border-gray-200 p-4">
            <Avatar
              src={partnerProfile?.profile_url || undefined}
              size="md"
              radius="xl"
            />
            <Text fw={600}>{partnerProfile?.display_name ?? ''}</Text>
          </Group>

          <ScrollArea
            viewportRef={viewport}
            className="scrollbar-brand flex-1 p-4"
            h={400}
          >
            <Stack gap="sm">
              {messages?.map((msg) => {
                const isMe = msg.sender_id === user.id;
                return (
                  <div
                    key={msg.id}
                    className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                  >
                    {!isMe && <Avatar size="sm" radius="xl" className="mr-2" />}
                    <div
                      className={`max-w-[70%] px-4 py-2 ${
                        isMe
                          ? 'chat-bubble-me bg-dodam-yellow text-white'
                          : 'chat-bubble-partner bg-gray-100 text-gray-800'
                      }`}
                    >
                      <Text size="sm">{msg.message}</Text>
                    </div>
                  </div>
                );
              })}
              {(!messages || messages.length === 0) && (
                <Center className="py-10">
                  <Stack align="center" gap="xs">
                    <IconMessageCircle size={40} color="#d6d6d6" />
                    <Text c="dimmed" size="sm">
                      대화를 시작해보세요
                    </Text>
                  </Stack>
                </Center>
              )}
            </Stack>
          </ScrollArea>

          <Group className="border-t border-gray-200 p-3" wrap="nowrap">
            <TextInput
              placeholder="메시지를 입력하세요"
              value={message}
              onChange={(e) => setMessage(e.currentTarget.value)}
              className="flex-1"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSend();
              }}
            />
            <ActionIcon
              onClick={handleSend}
              loading={sendMessage.isPending}
              variant="filled"
            >
              <IconSend size={16} />
            </ActionIcon>
          </Group>
        </div>
      </div>
    </div>
  );
}
