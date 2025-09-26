import { defineConfig } from '@solidjs/start/config'
import UnoCSS from 'unocss/vite'

export default defineConfig({
  ssr: false,
  vite: {
    plugins: [UnoCSS()],
    optimizeDeps: {
      exclude: ['sqlocal'],
    },
    worker: {
      format: 'es',
    },
  },
  server: {
    preset: 'static',
    routeRules: {
      '/**': { headers: { 'Cross-Origin-Embedder-Policy': 'require-corp', 'Cross-Origin-Opener-Policy': 'same-origin' } },
    },
  },
})
