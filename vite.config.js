import { sentryVitePlugin } from '@sentry/vite-plugin';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import analyzer from 'vite-bundle-analyzer';

export default defineConfig({
  plugins: [
    react(),
    sentryVitePlugin({
      org: 'polotno',
      project: 'polotno-studio',
    }),
    analyzer(),
  ],

  build: {
    sourcemap: true,
  },
});
