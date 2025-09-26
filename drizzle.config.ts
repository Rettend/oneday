import process from 'node:process'
import { defineConfig } from 'drizzle-kit'
import { parseEnv, serverScheme } from './src/env/schema'

const env = parseEnv(serverScheme, process.env, 'drizzle')

export default defineConfig({
  schema: './src/server/db/schema.ts',
  out: './drizzle/migrations',
  dialect: 'turso',
  dbCredentials: {
    url: env.TURSO_DB_URL,
  },
  verbose: true,
  strict: true,
  casing: 'snake_case',
})
