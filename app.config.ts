import { defineConfig } from '@solidjs/start/config'
import { typedRoutes } from 'start-typed-routes/plugin'
import UnoCSS from 'unocss/vite'

export default defineConfig({
  middleware: './src/middleware.ts',
  server: {
    ssr: false,
    preset: 'cloudflare_module',
  },
  vite: {
    plugins: [
      UnoCSS(),
      typedRoutes(),
    ],
  },
})
