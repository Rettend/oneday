import { action, query } from '@solidjs/router'
import { and, eq } from 'drizzle-orm'
import { z } from 'zod'
import { encryptApiKey } from '../crypto/apiKeys'
import { db } from '../db'
import { ApiKeys } from '../db/schema'
import { requireUserId } from '../session'

const listApiKeysId = 'apikeys:list'
const upsertApiKeyId = 'apikeys:upsert'

export const listApiKeys = query(async () => {
  'use server'

  const userId = await requireUserId()
  const rows = await db
    .select({
      provider: ApiKeys.provider,
    })
    .from(ApiKeys)
    .where(eq(ApiKeys.userId, userId))

  return rows.map(row => row.provider)
}, listApiKeysId)

const upsertSchema = z.object({
  provider: z.string(),
  apiKey: z.string().optional(),
})

export const upsertApiKey = action(async (raw: z.infer<typeof upsertSchema>) => {
  'use server'

  const input = upsertSchema.parse(raw)
  const userId = await requireUserId()

  if (!input.apiKey) {
    await db
      .delete(ApiKeys)
      .where(
        and(
          eq(ApiKeys.userId, userId),
          eq(ApiKeys.provider, input.provider),
        ),
      )
    return { ok: true, hasKey: false }
  }

  const encryptedKey = await encryptApiKey(input.apiKey)

  await db
    .insert(ApiKeys)
    .values({
      userId,
      provider: input.provider,
      encryptedKey,
    })
    .onConflictDoUpdate({
      target: [ApiKeys.userId, ApiKeys.provider],
      set: {
        encryptedKey,
        updatedAt: new Date(),
      },
    })

  return { ok: true, hasKey: true }
}, upsertApiKeyId)
