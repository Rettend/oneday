import { defineConfig } from 'taze'

export default defineConfig({
  exclude: [
    '@tauri-apps/plugin-deep-link',
    '@tauri-apps/plugin-notification',
    '@tauri-apps/plugin-opener'
  ]
})
