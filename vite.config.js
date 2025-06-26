import { sentryVitePlugin } from '@sentry/vite-plugin';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import analyzer from 'vite-bundle-analyzer';
import path from 'path';
// https://vite.dev/config/
export default defineConfig({
  // resolve: {
  //   alias: {
  //     // '@blueprintjs/icons': path.resolve('./emptyIconPaths.js'),
  //     '@blueprintjs/icons/lib/esm/generated': path.resolve(
  //       './emptyIconPaths.js'
  //     ),
  //   },
  // },
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
