import { sentryVitePlugin } from '@sentry/vite-plugin';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/studio/',
  plugins: [
    react(),
    sentryVitePlugin({
      org: 'polotno',
      project: 'polotno-studio',
    }),
    // analyzer(),
  ],

  server: {
    host: true,
    hmr: {
      clientPort: 443,
      protocol: 'wss'
    }
  },

  build: {
    outDir: 'dist/studio',
    sourcemap: true,
  },
});
