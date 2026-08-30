import { redirect } from 'next/navigation';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import getQueryClient from '@/libs/query/query-client';
import { createServerSupabase } from '@/libs/supabase/server';
import { chatQueries } from '@/services/chat/queries';
import { servFetchChatList, servFetchMessages } from '@/services/chat/chat-services';
import type { Profile } from '@/services/auth/auth.types';
import ChatDetailContents from './components/ChatDetailContents';

interface ChatDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ChatDetailPage({
  params,
}: ChatDetailPageProps) {
  const { id } = await params;
  const roomId = Number(id);
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/signin?callbackUrl=/chat/${id}`);
  }

  const queryClient = getQueryClient();

  const [, { data: profile }] = await Promise.all([
    Promise.all([
      queryClient.prefetchQuery({
        ...chatQueries.list(),
        queryFn: () => servFetchChatList(supabase),
      }),
      queryClient.prefetchQuery({
        ...chatQueries.messages(roomId),
        queryFn: () => servFetchMessages(roomId, supabase),
      }),
    ]),
    supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single<Profile>(),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ChatDetailContents user={user} profile={profile!} />
    </HydrationBoundary>
  );
}
