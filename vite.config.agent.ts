import { cloudflare } from '@cloudflare/vite-plugin'
import { resolve } from 'node:path'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    cloudflare({
      configPath: './wrangler.agent.toml',
    }),
  ],
  server: {
    port: 8787,
  },
  resolve: {
    alias: {
      '~': resolve(__dirname, './src'),
    },
  },
})
