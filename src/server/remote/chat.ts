import { action, query } from '@solidjs/router'
import { and, asc, desc, eq } from 'drizzle-orm'
import { z } from 'zod'
import { db } from '~/server/db'
import { Conversations, Messages, Users } from '~/server/db/schema'
import { requireUserId } from '~/server/session'
import { uuidV7Base58 } from '~/utils/ids'

const FALLBACK_PROVIDER_ID = 'openai'
const FALLBACK_MODEL_ID = 'gpt-4o-mini'

function getTodayIsoDate() {
  return new Date().toISOString().slice(0, 10)
}

function dailyConversationId(dateIso: string) {
  return `daily-${dateIso}`
}

async function getUserModelDefaults(userId: string) {
  const user = await db.query.Users.findFirst({
    where: eq(Users.id, userId),
    columns: {
      defaultModelProviderId: true,
      defaultModelId: true,
    },
  })

  return {
    providerId: user?.defaultModelProviderId ?? FALLBACK_PROVIDER_ID,
    modelId: user?.defaultModelId ?? FALLBACK_MODEL_ID,
  }
}

async function ensureDailyConversation(userId: string, dateIso: string) {
  const id = dailyConversationId(dateIso)

  const existing = await db.query.Conversations.findFirst({
    where: and(eq(Conversations.id, id), eq(Conversations.userId, userId)),
  })

  if (existing)
    return existing

  const defaults = await getUserModelDefaults(userId)

  await db.insert(Conversations).values({
    id,
    userId,
    title: `Daily contract ${dateIso}`,
    modelProviderId: defaults.providerId,
    modelId: defaults.modelId,
    createdAt: new Date(),
    updatedAt: new Date(),
  })

  const inserted = await db.query.Conversations.findFirst({
    where: and(eq(Conversations.id, id), eq(Conversations.userId, userId)),
  })

  if (!inserted)
    throw new Error('Failed to create daily conversation.')

  return inserted
}

const createConversationSchema = z.object({
  title: z.string().trim().min(1).optional(),
  providerId: z.string().trim().min(1).optional(),
  modelId: z.string().trim().min(1).optional(),
})

export const createConversation = action(async (raw: z.infer<typeof createConversationSchema>) => {
  'use server'

  const data = createConversationSchema.parse(raw)
  const userId = await requireUserId()
  const defaults = await getUserModelDefaults(userId)

  const id = uuidV7Base58()
  await db.insert(Conversations).values({
    id,
    userId,
    title: data.title ?? 'New Chat',
    modelProviderId: data.providerId ?? defaults.providerId,
    modelId: data.modelId ?? defaults.modelId,
    createdAt: new Date(),
    updatedAt: new Date(),
  })

  return id
})

const ensureConversationSchema = z.object({
  id: z.string().trim().min(1),
  title: z.string().trim().min(1).optional(),
  providerId: z.string().trim().min(1).optional(),
  modelId: z.string().trim().min(1).optional(),
})

export const ensureConversation = action(async (raw: z.infer<typeof ensureConversationSchema>) => {
  'use server'

  const input = ensureConversationSchema.parse(raw)
  const userId = await requireUserId()

  const existing = await db.query.Conversations.findFirst({
    where: and(eq(Conversations.id, input.id), eq(Conversations.userId, userId)),
  })

  if (existing)
    return existing.id

  const defaults = await getUserModelDefaults(userId)

  await db.insert(Conversations).values({
    id: input.id,
    userId,
    title: input.title ?? 'New Chat',
    modelProviderId: input.providerId ?? defaults.providerId,
    modelId: input.modelId ?? defaults.modelId,
    createdAt: new Date(),
    updatedAt: new Date(),
  })

  return input.id
})

export const getConversation = query(async (conversationId: string) => {
  'use server'
  const userId = await requireUserId()

  const conversation = await db.query.Conversations.findFirst({
    where: and(eq(Conversations.id, conversationId), eq(Conversations.userId, userId)),
    with: {
      messages: {
        orderBy: asc(Messages.createdAt),
      },
    },
  })

  return conversation
}, 'chat:getConversation')

export const listConversations = query(async () => {
  'use server'
  const userId = await requireUserId()

  await ensureDailyConversation(userId, getTodayIsoDate())

  return await db.query.Conversations.findMany({
    where: eq(Conversations.userId, userId),
    orderBy: desc(Conversations.updatedAt),
  })
}, 'chat:listConversations')

const deleteConversationSchema = z.object({
  conversationId: z.string().trim().min(1),
})

export const deleteConversation = action(async (raw: z.infer<typeof deleteConversationSchema>) => {
  'use server'

  const input = deleteConversationSchema.parse(raw)
  const userId = await requireUserId()

  await db
    .delete(Conversations)
    .where(and(eq(Conversations.id, input.conversationId), eq(Conversations.userId, userId)))

  return { ok: true }
}, 'chat:deleteConversation')

const updateConversationModelSchema = z.object({
  conversationId: z.string().trim().min(1),
  providerId: z.string().trim().min(1),
  modelId: z.string().trim().min(1),
})

export const updateConversationModel = action(async (raw: z.infer<typeof updateConversationModelSchema>) => {
  'use server'

  const input = updateConversationModelSchema.parse(raw)
  const userId = await requireUserId()

  await db
    .update(Conversations)
    .set({
      modelProviderId: input.providerId,
      modelId: input.modelId,
      updatedAt: new Date(),
    })
    .where(and(eq(Conversations.id, input.conversationId), eq(Conversations.userId, userId)))

  return { ok: true }
}, 'chat:updateConversationModel')

export const getModelPreference = query(async () => {
  'use server'

  const userId = await requireUserId()
  return getUserModelDefaults(userId)
}, 'chat:modelPreference')

const updateModelPreferenceSchema = z.object({
  providerId: z.string().trim().min(1),
  modelId: z.string().trim().min(1),
})

export const updateModelPreference = action(async (raw: z.infer<typeof updateModelPreferenceSchema>) => {
  'use server'

  const input = updateModelPreferenceSchema.parse(raw)
  const userId = await requireUserId()

  await db
    .update(Users)
    .set({
      defaultModelProviderId: input.providerId,
      defaultModelId: input.modelId,
      updatedAt: new Date(),
    })
    .where(eq(Users.id, userId))

  return {
    providerId: input.providerId,
    modelId: input.modelId,
  }
}, 'chat:updateModelPreference')

export const getDailyConversation = query(async (date?: string) => {
  'use server'

  const userId = await requireUserId()
  const dateIso = date ?? getTodayIsoDate()
  return ensureDailyConversation(userId, dateIso)
}, 'chat:getDailyConversation')
