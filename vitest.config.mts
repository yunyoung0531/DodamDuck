import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { readFileSync } from 'fs';
import { resolve } from 'path';

function loadDotEnv() {
  const envVars: Record<string, string> = {};
  try {
    const content = readFileSync(resolve(process.cwd(), '.env.local'), 'utf-8');
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIndex = trimmed.indexOf('=');
      if (eqIndex === -1) continue;
      const key = trimmed.slice(0, eqIndex);
      const value = trimmed.slice(eqIndex + 1);
      envVars[key] = value;
    }
  } catch {
    // .env.local may not exist in CI
  }
  return envVars;
}

const env = loadDotEnv();

export default defineConfig({
  plugins: [react()],
  resolve: {
    tsconfigPaths: true,
  },
  define: {
    'process.env.NEXT_PUBLIC_SUPABASE_URL': JSON.stringify(
      env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://test.supabase.co'
    ),
    'process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY': JSON.stringify(
      env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'test-anon-key'
    ),
    'process.env.NEXT_PUBLIC_APP_URL': JSON.stringify(
      'http://localhost:3000'
    ),
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/vitest.setup.tsx'],
    css: false,
    exclude: ['node_modules', 'dodamduck_fe', '.next'],
  },
});
