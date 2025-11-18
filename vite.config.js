import { sentryVitePlugin } from '@sentry/vite-plugin';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import analyzer from 'vite-bundle-analyzer';
import path from 'path';

export default defineConfig(({ mode }) => {
  const isWordPress = process.env.WORDPRESS_BUILD === 'true';

  return {
    plugins: [
      react(),
      // Only use Sentry in production
      mode === 'production' && sentryVitePlugin({
        org: 'polotno',
        project: 'polotno-studio',
        disable: !process.env.VITE_SENTRY_DNS,
      }),
      // Only use analyzer in development
      mode === 'development' && analyzer(),
    ].filter(Boolean),

    build: {
      sourcemap: mode === 'production',
      outDir: isWordPress ? 'wordpress-plugin/assets/dist' : 'dist',
      rollupOptions: {
        output: {
          // WordPress-friendly asset naming
          entryFileNames: isWordPress ? 'polotno-studio.js' : 'assets/[name]-[hash].js',
          chunkFileNames: isWordPress ? 'chunks/[name].js' : 'assets/[name]-[hash].js',
          assetFileNames: isWordPress ? 'assets/[name].[ext]' : 'assets/[name]-[hash].[ext]',
        },
      },
      // Optimize for WordPress
      chunkSizeWarningLimit: isWordPress ? 1000 : 500,
      minify: mode === 'production' ? 'terser' : false,
      terserOptions: mode === 'production' ? {
        compress: {
          drop_console: true,
          drop_debugger: true,
        },
      } : undefined,
    },

    server: {
      port: 5173,
      open: !isWordPress,
      proxy: isWordPress ? {
        '/wp-json': {
          target: process.env.VITE_WP_URL || 'http://localhost:8080',
          changeOrigin: true,
        },
        '/wp-admin': {
          target: process.env.VITE_WP_URL || 'http://localhost:8080',
          changeOrigin: true,
        },
      } : undefined,
    },

    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },

    // Optimize dependencies
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'mobx',
        'mobx-react-lite',
        'polotno',
        '@blueprintjs/core',
        '@blueprintjs/icons',
      ],
    },

    // Define global constants
    define: {
      __WORDPRESS__: isWordPress,
    },
  };
});
