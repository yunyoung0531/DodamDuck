import { redirect } from 'next/navigation';
import { createServerSupabase } from '@/libs/supabase/server';
import BoardNewContents from './components/BoardNewContents';

export default async function BoardNewPage() {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/signin?callbackUrl=/board/new');
  }

  return <BoardNewContents />;
}
