import { defineConfig } from '@solidjs/start/config'
import { typedRoutes } from 'start-typed-routes/plugin'
import UnoCSS from 'unocss/vite'

export default defineConfig({
  ssr: false,
  server: {
    preset: 'cloudflare-module',
  },
  middleware: 'src/middleware.ts',
  vite: {
    plugins: [
      UnoCSS(),
      typedRoutes(),
    ],
    optimizeDeps: {
      exclude: ['@rttnd/gau'],
    },
  },
})
