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
    .upload(path, file, { upsert: true, contentType: file.type });

  if (error) throw error;

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

export function extractStoragePath(
  publicUrl: string,
  bucket: BucketName
): string | null {
  const marker = `/object/public/${bucket}/`;
  const index = publicUrl.indexOf(marker);
  if (index === -1) return null;
  return publicUrl.slice(index + marker.length);
}

export async function deleteImage(
  bucket: BucketName,
  path: string
): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase.storage.from(bucket).remove([path]);
  if (error) throw error;
}
