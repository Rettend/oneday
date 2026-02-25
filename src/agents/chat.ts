import type { StreamTextOnFinishCallback, ToolSet } from 'ai'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { createGroq } from '@ai-sdk/groq'
import { createOpenAI } from '@ai-sdk/openai'
import { createClient } from '@libsql/client'
import { AIChatAgent } from '@rttnd/ai-chat'
import { convertToModelMessages, createUIMessageStream, createUIMessageStreamResponse, streamText, tool } from 'ai'
import { and, asc, desc, eq, gte, lt } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/libsql'
import { createWorkersAI } from 'workers-ai-provider'
import { z } from 'zod'
import { decryptWithSecret } from '~/server/crypto/utils'
import { ActivityLogs, ApiKeys, CategoryRules, ContractBlocks, Contracts, Conversations, Goals, Users } from '~/server/db/schema'
import * as dbSchema from '~/server/db/schema'

const DEFAULT_PROVIDER_ID = 'openai'
const DEFAULT_MODEL_ID = 'gpt-4o-mini'
const FALLBACK_CF_MODEL = '@cf/meta/llama-2-7b-chat-int8'
const POLL_INTERVAL_SECONDS = 5

function getTodayIsoDate() {
  return new Date().toISOString().slice(0, 10)
}

function getDayBounds(dateIso: string) {
  const start = new Date(`${dateIso}T00:00:00.000Z`)
  const end = new Date(start)
  end.setUTCDate(end.getUTCDate() + 1)
  return { start, end }
}

function formatMinutes(minutes: number) {
  if (!Number.isFinite(minutes) || minutes <= 0)
    return '0m'

  if (minutes < 60)
    return `${Math.round(minutes)}m`

  const hours = Math.floor(minutes / 60)
  const remainder = Math.round(minutes % 60)
  return remainder === 0 ? `${hours}h` : `${hours}h ${remainder}m`
}

function normalizeCategory(value: string | null | undefined) {
  return (value ?? 'uncategorized').trim().toLowerCase()
}

function toMinutesFromLogCount(count: number) {
  if (count <= 0)
    return 0
  return Math.max(1, Math.round((count * POLL_INTERVAL_SECONDS) / 60))
}

function parseMetadata(raw: string) {
  try {
    const parsed = JSON.parse(raw)
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed))
      return parsed as Record<string, unknown>
  }
  catch {
  }

  return {}
}

function extractLatestUserText(messages: Array<{ role?: string, parts?: Array<{ type?: string, text?: string }> }>) {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const message = messages[index]
    if (message.role !== 'user')
      continue

    const text = (message.parts ?? [])
      .filter(part => part.type === 'text' && typeof part.text === 'string')
      .map(part => part.text?.trim() ?? '')
      .filter(Boolean)
      .join(' ')

    if (text)
      return text
  }

  return null
}

export class ChatAgent extends AIChatAgent<Env> {
  private getDb() {
    const client = createClient({
      url: this.env.TURSO_DB_URL,
      authToken: this.env.TURSO_AUTH_TOKEN,
    })

    return drizzle(client, {
      schema: dbSchema,
      casing: 'snake_case',
    })
  }

  private async getConversationContext(conversationId: string) {
    const db = this.getDb()

    const conversation = await db.query.Conversations.findFirst({
      where: eq(Conversations.id, conversationId),
    })

    if (!conversation)
      return null

    const user = await db.query.Users.findFirst({
      where: eq(Users.id, conversation.userId),
      columns: {
        id: true,
        defaultModelProviderId: true,
        defaultModelId: true,
      },
    })

    if (!user)
      return null

    const userId = user.id
    const providerId = conversation.modelProviderId
      ?? user.defaultModelProviderId
      ?? DEFAULT_PROVIDER_ID
    const modelId = conversation.modelId
      ?? user.defaultModelId
      ?? DEFAULT_MODEL_ID

    return {
      db,
      conversation,
      userId,
      providerId,
      modelId,
    }
  }

  private async resolveModel(
    providerId: string,
    modelId: string,
    userId: string,
  ) {
    const db = this.getDb()
    const keyRow = await db.query.ApiKeys.findFirst({
      where: and(eq(ApiKeys.userId, userId), eq(ApiKeys.provider, providerId)),
    })

    const decryptedKey = keyRow
      ? await decryptWithSecret(this.env.AUTH_SECRET, keyRow.encryptedKey)
      : null

    const workersai = createWorkersAI({ binding: this.env.AI })

    if (!decryptedKey)
      return workersai(FALLBACK_CF_MODEL)

    if (providerId === 'openai') {
      const openai = createOpenAI({ apiKey: decryptedKey })
      return openai(modelId)
    }

    if (providerId === 'groq') {
      const groq = createGroq({ apiKey: decryptedKey })
      return groq(modelId)
    }

    if (providerId === 'google') {
      const google = createGoogleGenerativeAI({ apiKey: decryptedKey })
      return google(modelId)
    }

    return workersai(FALLBACK_CF_MODEL)
  }

  private async getActivityByCategory(userId: string, dateIso: string) {
    const db = this.getDb()
    const { start, end } = getDayBounds(dateIso)
    const rows = await db.query.ActivityLogs.findMany({
      where: and(
        eq(ActivityLogs.userId, userId),
        gte(ActivityLogs.timestamp, start),
        lt(ActivityLogs.timestamp, end),
      ),
      orderBy: asc(ActivityLogs.timestamp),
    })

    const counts = new Map<string, number>()
    for (const row of rows) {
      const key = normalizeCategory(row.category)
      counts.set(key, (counts.get(key) ?? 0) + 1)
    }

    return [...counts.entries()]
      .map(([category, count]) => ({
        category,
        minutes: toMinutesFromLogCount(count),
      }))
      .sort((a, b) => b.minutes - a.minutes)
  }

  private async getContractSnapshot(userId: string, dateIso: string) {
    const db = this.getDb()

    const contract = await db.query.Contracts.findFirst({
      where: and(eq(Contracts.userId, userId), eq(Contracts.date, dateIso)),
    })

    if (!contract)
      return null

    const contractBlocks = await db.query.ContractBlocks.findMany({
      where: eq(ContractBlocks.contractId, contract.id),
      orderBy: asc(ContractBlocks.order),
    })

    const byCategory = await this.getActivityByCategory(userId, dateIso)
    const categoryMap = new Map(byCategory.map(item => [item.category, item.minutes]))

    const blocks = contractBlocks.map((block) => {
      const tracked = categoryMap.get(normalizeCategory(block.category)) ?? 0
      const completedMinutes = Math.max(block.completedMinutes, tracked)
      const remainingMinutes = Math.max(0, block.targetMinutes - completedMinutes)

      return {
        id: block.id,
        label: block.label,
        category: block.category,
        targetMinutes: block.targetMinutes,
        completedMinutes,
        remainingMinutes,
        done: remainingMinutes === 0,
      }
    })

    return {
      id: contract.id,
      date: contract.date,
      status: contract.status,
      blocks,
    }
  }

  private async buildSystemContext(userId: string) {
    const today = getTodayIsoDate()
    const db = this.getDb()

    const [activityByCategory, contract, goals] = await Promise.all([
      this.getActivityByCategory(userId, today),
      this.getContractSnapshot(userId, today),
      db.query.Goals.findMany({
        where: eq(Goals.userId, userId),
        orderBy: desc(Goals.updatedAt),
      }),
    ])

    const weekday = new Date().toLocaleDateString([], { weekday: 'long' })
    const activityText = activityByCategory.length
      ? activityByCategory.map(item => `${item.category}: ${formatMinutes(item.minutes)}`).join(', ')
      : 'no tracked activity yet'

    const contractText = contract
      ? contract.blocks.length
        ? contract.blocks.map(block => `${block.label}: ${formatMinutes(block.remainingMinutes)} left`).join(', ')
        : 'contract exists with no blocks'
      : 'no contract set for today'

    const goalsText = goals.length
      ? goals
          .slice(0, 6)
          .map(goal => `${goal.name} (${goal.type}) ${JSON.stringify(parseMetadata(goal.metadata))}`)
          .join('; ')
      : 'no active goals'

    return [
      'You are Oneday, a planning and accountability assistant.',
      `Today is ${weekday} (${today}).`,
      `Contract status: ${contractText}.`,
      `Activity summary: ${activityText}.`,
      `Active goals: ${goalsText}.`,
      'Use tools whenever they help provide accurate, concrete answers.',
      'When a tool call succeeds, explain outcomes briefly and clearly.',
    ].join('\n')
  }

  private buildTools(userId: string) {
    return {
      create_contract: tool({
        description: 'Create or replace today\'s contract with ordered blocks.',
        inputSchema: z.object({
          date: z.string().optional(),
          status: z.enum(['draft', 'active', 'complete']).default('active'),
          blocks: z.array(z.object({
            label: z.string().min(1),
            category: z.string().min(1),
            targetMinutes: z.number().int().min(0),
          })).default([]),
        }),
        execute: async (input) => {
          const db = this.getDb()
          const date = input.date ?? getTodayIsoDate()

          await db.transaction(async (tx) => {
            const existing = await tx.query.Contracts.findFirst({
              where: and(eq(Contracts.userId, userId), eq(Contracts.date, date)),
            })

            const contractId = existing?.id ?? crypto.randomUUID()

            if (existing) {
              await tx
                .update(Contracts)
                .set({
                  status: input.status,
                  updatedAt: new Date(),
                })
                .where(eq(Contracts.id, contractId))

              await tx.delete(ContractBlocks).where(eq(ContractBlocks.contractId, contractId))
            }
            else {
              await tx.insert(Contracts).values({
                id: contractId,
                userId,
                date,
                status: input.status,
                createdAt: new Date(),
                updatedAt: new Date(),
              })
            }

            if (input.blocks.length > 0) {
              await tx.insert(ContractBlocks).values(input.blocks.map((block, index) => ({
                id: crypto.randomUUID(),
                contractId,
                label: block.label,
                category: block.category,
                targetMinutes: block.targetMinutes,
                completedMinutes: 0,
                order: index,
                createdAt: new Date(),
              })))
            }
          })

          return {
            ok: true,
            date,
            blocks: input.blocks.length,
          }
        },
      }),
      update_contract: tool({
        description: 'Update today\'s contract, optionally replacing blocks and status.',
        inputSchema: z.object({
          date: z.string().optional(),
          status: z.enum(['draft', 'active', 'complete']).optional(),
          blocks: z.array(z.object({
            label: z.string().min(1),
            category: z.string().min(1),
            targetMinutes: z.number().int().min(0),
            completedMinutes: z.number().int().min(0).default(0),
          })).optional(),
        }),
        execute: async (input) => {
          const db = this.getDb()
          const date = input.date ?? getTodayIsoDate()

          const contract = await db.query.Contracts.findFirst({
            where: and(eq(Contracts.userId, userId), eq(Contracts.date, date)),
          })

          if (!contract) {
            return {
              ok: false,
              reason: 'Contract not found for date',
              date,
            }
          }

          await db.transaction(async (tx) => {
            await tx
              .update(Contracts)
              .set({
                status: input.status ?? contract.status,
                updatedAt: new Date(),
              })
              .where(eq(Contracts.id, contract.id))

            if (input.blocks) {
              await tx.delete(ContractBlocks).where(eq(ContractBlocks.contractId, contract.id))
              if (input.blocks.length > 0) {
                await tx.insert(ContractBlocks).values(input.blocks.map((block, index) => ({
                  id: crypto.randomUUID(),
                  contractId: contract.id,
                  label: block.label,
                  category: block.category,
                  targetMinutes: block.targetMinutes,
                  completedMinutes: block.completedMinutes,
                  order: index,
                  createdAt: new Date(),
                })))
              }
            }
          })

          return { ok: true, date }
        },
      }),
      complete_block: tool({
        description: 'Mark a contract block as complete by setting completed minutes to target.',
        inputSchema: z.object({
          blockId: z.string().min(1),
        }),
        execute: async ({ blockId }) => {
          const db = this.getDb()

          const block = await db
            .select({
              id: ContractBlocks.id,
              targetMinutes: ContractBlocks.targetMinutes,
              contractId: ContractBlocks.contractId,
            })
            .from(ContractBlocks)
            .innerJoin(Contracts, eq(ContractBlocks.contractId, Contracts.id))
            .where(and(eq(ContractBlocks.id, blockId), eq(Contracts.userId, userId)))
            .limit(1)

          const current = block[0]
          if (!current)
            return { ok: false, reason: 'Block not found' }

          await db
            .update(ContractBlocks)
            .set({
              completedMinutes: current.targetMinutes,
            })
            .where(eq(ContractBlocks.id, current.id))

          await db
            .update(Contracts)
            .set({ updatedAt: new Date() })
            .where(eq(Contracts.id, current.contractId))

          return { ok: true, blockId }
        },
      }),
      create_goal: tool({
        description: 'Create a new goal tracker for the user.',
        inputSchema: z.object({
          name: z.string().min(1),
          type: z.enum(['countdown', 'counter', 'tracker']),
          metadata: z.record(z.string(), z.unknown()).default({}),
        }),
        execute: async (input) => {
          const db = this.getDb()
          const id = crypto.randomUUID()

          await db.insert(Goals).values({
            id,
            userId,
            name: input.name,
            type: input.type,
            metadata: JSON.stringify(input.metadata),
            createdAt: new Date(),
            updatedAt: new Date(),
          })

          return { ok: true, id, name: input.name }
        },
      }),
      update_goal: tool({
        description: 'Update a goal metadata payload, optionally merging with existing metadata.',
        inputSchema: z.object({
          goalId: z.string().min(1),
          metadata: z.record(z.string(), z.unknown()),
          merge: z.boolean().default(true),
          name: z.string().optional(),
          type: z.enum(['countdown', 'counter', 'tracker']).optional(),
        }),
        execute: async (input) => {
          const db = this.getDb()

          const goal = await db.query.Goals.findFirst({
            where: and(eq(Goals.id, input.goalId), eq(Goals.userId, userId)),
          })

          if (!goal)
            return { ok: false, reason: 'Goal not found' }

          const nextMetadata = input.merge
            ? { ...parseMetadata(goal.metadata), ...input.metadata }
            : input.metadata

          await db
            .update(Goals)
            .set({
              name: input.name ?? goal.name,
              type: input.type ?? goal.type,
              metadata: JSON.stringify(nextMetadata),
              updatedAt: new Date(),
            })
            .where(eq(Goals.id, goal.id))

          return {
            ok: true,
            goalId: goal.id,
            metadata: nextMetadata,
          }
        },
      }),
      get_activity_summary: tool({
        description: 'Get activity totals by category for a given day.',
        inputSchema: z.object({
          date: z.string().optional(),
        }),
        execute: async ({ date }) => {
          const targetDate = date ?? getTodayIsoDate()
          const byCategory = await this.getActivityByCategory(userId, targetDate)
          return {
            date: targetDate,
            byCategory,
          }
        },
      }),
      get_contract_status: tool({
        description: 'Get contract status and per-block completion for a day.',
        inputSchema: z.object({
          date: z.string().optional(),
        }),
        execute: async ({ date }) => {
          const targetDate = date ?? getTodayIsoDate()
          const contract = await this.getContractSnapshot(userId, targetDate)
          return {
            date: targetDate,
            contract,
          }
        },
      }),
      create_rule: tool({
        description: 'Create a categorization rule for activity logs.',
        inputSchema: z.object({
          pattern: z.string().min(1),
          matchField: z.enum(['app_name', 'window_title', 'browser_url']),
          category: z.string().min(1),
          priority: z.number().int().default(0),
        }),
        execute: async (input) => {
          const db = this.getDb()
          const id = crypto.randomUUID()

          await db.insert(CategoryRules).values({
            id,
            userId,
            pattern: input.pattern,
            matchField: input.matchField,
            category: input.category,
            priority: input.priority,
            createdAt: new Date(),
          })

          return { ok: true, id }
        },
      }),
    }
  }

  async onChatMessage(onFinish: StreamTextOnFinishCallback<ToolSet>) {
    const conversationId = this.name
    const context = await this.getConversationContext(conversationId)

    const workersai = createWorkersAI({ binding: this.env.AI })
    const fallbackModel = workersai(FALLBACK_CF_MODEL)

    const model = context
      ? await this.resolveModel(context.providerId, context.modelId, context.userId)
      : fallbackModel

    const system = context
      ? await this.buildSystemContext(context.userId)
      : 'You are Oneday, a focused planning assistant.'

    const tools = context ? this.buildTools(context.userId) : undefined

    const stream = createUIMessageStream({
      execute: async ({ writer }) => {
        const result = streamText({
          messages: await convertToModelMessages(this.messages),
          model,
          system,
          tools,
          onFinish: async (event) => {
            await (onFinish as (payload: unknown) => Promise<void>)(event)

            if (!context)
              return

            const conversation = context.conversation
            if (!conversation)
              return

            const hasCustomTitle = conversation.title?.trim() && conversation.title !== 'New Chat'
            if (hasCustomTitle || conversation.id.startsWith('daily-'))
              return

            const latestUserText = extractLatestUserText(this.messages as Array<{ role?: string, parts?: Array<{ type?: string, text?: string }> }>)
            if (!latestUserText)
              return

            const nextTitle = latestUserText.slice(0, 72)
            await context.db
              .update(Conversations)
              .set({
                title: nextTitle,
                updatedAt: new Date(),
              })
              .where(eq(Conversations.id, conversation.id))
          },
        })

        writer.merge(result.toUIMessageStream())
      },
    })

    return createUIMessageStreamResponse({ stream })
  }
}
