import { join } from 'node:path';
import { loadEnvConfig } from '@next/env';
import type { NextConfig } from 'next';

// Local only: reuse the native app's git-ignored ../.env.local (the Unsplash key) for the
// server routes. Nothing from it is exposed to the browser (only NEXT_PUBLIC_* would be).
if (!process.env.VERCEL) loadEnvConfig(join(__dirname, '..'), process.env.NODE_ENV !== 'production');

// The shared code in web/shared (copied from ../src by scripts/prepare-assets.mjs) imports a
// few React Native / Expo modules; on the web they resolve to the small stand-ins in shims/.
const SHIMS = {
  'react-native': './shims/react-native.ts',
  'expo-sqlite': './shims/expo-sqlite.ts',
  'expo-notifications': './shims/expo-notifications.ts',
  '@react-native-async-storage/async-storage': './shims/async-storage.ts',
};

const config: NextConfig = {
  reactStrictMode: true,
  turbopack: { root: __dirname, resolveAlias: SHIMS },
  outputFileTracingRoot: __dirname,
  async headers() {
    return [
      {
        source: '/sw.js',
        headers: [
          { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' },
          { key: 'Service-Worker-Allowed', value: '/' },
        ],
      },
    ];
  },
};

export default config;
