import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { sentryVitePlugin } from '@sentry/vite-plugin';
import { visualizer } from 'rollup-plugin-visualizer';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  build: {
    sourcemap: true, // Source map generation must be turned on
    rollupOptions: {
      output: {
        manualChunks: {
          sentry: ['@sentry/react'],
          socketio: ['socket.io-client'],
        },
      },
      plugins: [
        htmlPlugin(loadEnv(mode, '.')),
        sentryVitePlugin({
          authToken: process.env.SENTRY_AUTH_TOKEN,
          org: 'greatmyproducts',
          project: 'online-reversi-frontend',
        }),
        visualizer(),
      ],
    },
  },
  plugins: [react()],
}));

/**
 * Replace env variables in index.html
 * @see https://github.com/vitejs/vite/issues/3105#issuecomment-939703781
 * @example `%VITE_MY_ENV%`
 * @see https://vitejs.dev/guide/api-plugin.html#transformindexhtml
 */
function htmlPlugin(env: ReturnType<typeof loadEnv>) {
  return {
    name: 'html-transform',
    transformIndexHtml: {
      enforce: 'pre' as const,
      transform: (html: string): string =>
        html.replace(/%(.*?)%/g, (match, p1) => env[p1] ?? match),
    },
  };
}
