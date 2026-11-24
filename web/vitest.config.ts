import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['test/**/*.test.ts'],
  },
  resolve: {
    alias: {
      'react-native': new URL('./shims/react-native.ts', import.meta.url).pathname,
      '@react-native-async-storage/async-storage': new URL('./shims/async-storage.ts', import.meta.url).pathname,
    },
  },
});
