import { redirect } from 'next/navigation';
import { createServerSupabase } from '@/libs/supabase/server';
import SharingNewContents from './components/SharingNewContents';

export default async function SharingNewPage() {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/signin?callbackUrl=/sharing/new');
  }

  return <SharingNewContents />;
}
