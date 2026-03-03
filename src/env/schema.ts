import { z } from 'zod'

export const serverScheme = z.object({
  TURSO_DB_URL: z.string(),
  TURSO_AUTH_TOKEN: z.string(),
  AUTH_SECRET: z.string(),
  GITHUB_CLIENT_ID: z.string(),
  GITHUB_CLIENT_SECRET: z.string(),
  DISCORD_CLIENT_ID: z.string(),
  DISCORD_CLIENT_SECRET: z.string(),
  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),
})

export const clientScheme = z.object({
  VITE_AUTH_BASE_URL: z.preprocess(
    value => typeof value === 'string' && value.trim() === '' ? undefined : value,
    z.string().url().optional(),
  ),
})

export function parseEnv<T extends z.ZodTypeAny>(
  schema: T,
  env: Record<string, string | undefined>,
  context: string,
): z.infer<T> {
  const result = schema.safeParse(env)

  if (!result.success) {
    console.error(z.prettifyError(result.error))
    throw new Error(`Invalid ${context} environment variables`)
  }

  return result.data
}
