import { redirect } from 'next/navigation';
import { createServerSupabase } from '@/libs/supabase/server';
import SharingNewContents from './components/SharingNewContents';
import { NeighborhoodRequiredNotice } from './components/NeighborhoodRequiredNotice';

export default async function SharingNewPage() {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/signin?callbackUrl=/sharing/new');
  }

  const { data: isVerified } = await supabase.rpc('is_neighborhood_verified', {
    target_user_id: user.id,
  });

  if (!isVerified) {
    return <NeighborhoodRequiredNotice />;
  }

  return <SharingNewContents />;
}
