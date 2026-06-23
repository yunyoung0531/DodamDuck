import { redirect } from 'next/navigation';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import getQueryClient from '@/libs/query/query-client';
import { createClient } from '@/libs/supabase/server';
import { chatQueries } from '@/services/chat/queries';
import { servFetchChatList } from '@/services/chat/chat-services';
import type { Profile } from '@/services/auth/auth.types';
import ChatContents from './components/ChatContents';

export default async function ChatPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?callbackUrl=/chat');
  }

  const [queryClient, { data: profile }] = await Promise.all([
    Promise.resolve(getQueryClient()),
    supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single<Profile>(),
  ]);

  await queryClient.prefetchQuery({
    ...chatQueries.list(),
    queryFn: () => servFetchChatList(supabase),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ChatContents user={user} profile={profile!} />
    </HydrationBoundary>
  );
}
