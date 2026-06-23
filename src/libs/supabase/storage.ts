import { createClient } from './client';

type BucketName = 'post-images' | 'board-images' | 'profile-images';

export async function uploadImage(
  bucket: BucketName,
  path: string,
  file: File
): Promise<string> {
  const supabase = createClient();

  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, file, { upsert: true });

  if (error) throw error;

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

export async function deleteImage(
  bucket: BucketName,
  path: string
): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase.storage.from(bucket).remove([path]);
  if (error) throw error;
}
