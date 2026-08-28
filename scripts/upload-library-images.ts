import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import * as path from 'node:path';

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const UNSPLASH_KEY = process.env.UNSPLASH_ACCESS_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set');
}
if (!UNSPLASH_KEY) {
  throw new Error('UNSPLASH_ACCESS_KEY must be set in .env.local');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const BUCKET = 'library-images';

const CATEGORY_SEARCH: Record<string, string> = {
  'blocks': 'colorful building blocks toy children',
  'roleplay': 'dollhouse pretend play toy kids',
  'baby': 'baby soft plush toy teddy bear',
  'music': 'kids musical instrument xylophone toy',
  'car': 'toy car model children play',
  'explore': 'kids educational science toy',
  'puzzle': 'jigsaw puzzle board game kids',
  'default': 'yellow rubber duck toy bath',
};

function print(message: string) {
  process.stdout.write(`${message}\n`);
}

interface UnsplashPhoto {
  urls: { regular: string; small: string };
  user: { name: string; links: { html: string } };
}

async function searchUnsplash(query: string): Promise<UnsplashPhoto | null> {
  const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=1&orientation=squarish`;

  const res = await fetch(url, {
    headers: { Authorization: `Client-ID ${UNSPLASH_KEY}` },
  });

  if (!res.ok) {
    process.stderr.write(`Unsplash API error: ${res.status} ${res.statusText}\n`);
    return null;
  }

  const json = await res.json();
  return json.results?.[0] ?? null;
}

async function downloadImage(imageUrl: string): Promise<Buffer> {
  const res = await fetch(imageUrl);
  if (!res.ok) throw new Error(`Failed to download: ${res.status}`);
  const arrayBuffer = await res.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

async function main() {
  const { error: bucketError } = await supabase.storage.from(BUCKET).list('', { limit: 1 });
  if (bucketError) {
    throw new Error(`Bucket "${BUCKET}" not accessible: ${bucketError.message}`);
  }
  print(`Bucket "${BUCKET}" ready\n`);

  for (const [key, query] of Object.entries(CATEGORY_SEARCH)) {
    const filename = `${key}.jpg`;
    print(`Searching: "${query}" ...`);

    const photo = await searchUnsplash(query);
    if (!photo) {
      process.stderr.write(`  No result for "${query}", skipping\n`);
      continue;
    }

    print(`  Found photo by ${photo.user.name}`);

    const imageBuffer = await downloadImage(photo.urls.small);
    print(`  Downloaded (${Math.round(imageBuffer.length / 1024)}KB)`);

    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(filename, imageBuffer, { upsert: true, contentType: 'image/jpeg' });

    if (error) {
      process.stderr.write(`  Upload failed: ${error.message}\n`);
      continue;
    }

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(filename);
    print(`  Uploaded -> ${data.publicUrl}\n`);
  }

  print('Done!');
}

main().catch((err: unknown) => {
  process.stderr.write(`${String(err)}\n`);
  process.exit(1);
});
