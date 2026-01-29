import { action, query } from '@solidjs/router'
import { and, asc, desc, eq } from 'drizzle-orm'
import { db } from '~/server/db'
import { Conversations, Messages } from '~/server/db/schema'
import { requireUserId } from '~/server/session'
import { uuidV7Base58 } from '~/utils/ids'

export const createConversation = action(async (data: { title?: string, providerId: string, modelId: string }) => {
  'use server'
  const userId = await requireUserId()

  const id = uuidV7Base58()
  await db.insert(Conversations).values({
    id,
    userId,
    title: data.title ?? 'New Chat',
    modelProviderId: data.providerId,
    modelId: data.modelId,
    createdAt: new Date(),
    updatedAt: new Date(),
  })

  return id
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

  return await db.query.Conversations.findMany({
    where: eq(Conversations.userId, userId),
    orderBy: desc(Conversations.updatedAt),
  })
}, 'chat:listConversations')
