import { sentryVitePlugin } from "@sentry/vite-plugin";
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), sentryVitePlugin({
    org: "polotno",
    project: "polotno-studio"
  })],

  server: {
    host: true,
    hmr: {
      clientPort: 443,
      protocol: 'wss'
    }
  },

  build: {
    sourcemap: true
  }
})