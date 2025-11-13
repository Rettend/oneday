import { defineConfig } from '@solidjs/start/config'
import { typedRoutes } from 'start-typed-routes/plugin'
import UnoCSS from 'unocss/vite'

export default defineConfig({
  ssr: false,
  vite: {
    plugins: [
      UnoCSS(),
      typedRoutes(),
    ],
    optimizeDeps: {
      exclude: ['sqlocal'],
    },
    worker: {
      format: 'es',
    },
  },
  server: {
    routeRules: {
      '/**': { headers: { 'Cross-Origin-Embedder-Policy': 'require-corp', 'Cross-Origin-Opener-Policy': 'same-origin' } },
    },
  },
})
