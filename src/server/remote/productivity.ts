import type { z } from 'zod'
import type { ActivityCategorySummary, ActivityDaySummary, activityEntrySchema, ActivitySession, ActivityWeekSummary, AppTimeEntry, CategoryGroup, ContractSnapshot, DashboardSnapshot, DayBreakdown, GoalSnapshot, RuleMatchField, WeekGroupedSummary, WindowTitleEntry } from '~/lib/productivity'
import type { SelectActivityLog } from '~/server/db/schema'
import { action, query } from '@solidjs/router'
import { and, asc, desc, eq, gte, inArray, lt } from 'drizzle-orm'
import { createGoalSchema, createRuleSchema, getDayBounds, getWeekBounds, ingestActivitySchema, MAX_SESSION_GAP_MS, normalizeCategoryKey, normalizeDateIso, parseGoalMetadata, POLL_INTERVAL_SECONDS, toIsoDate, updateActivityCategorySchema, updateContractBlockSchema, updateGoalSchema, upsertContractSchema } from '~/lib/productivity'
import { db } from '~/server/db'
import { ActivityLogs, CategoryRules, ContractBlocks, Contracts, Goals } from '~/server/db/schema'
import { requireUserId } from '~/server/session'
import { uuidV7Base58 } from '~/utils/ids'

interface ActivitySessionDraft {
  ids: string[]
  startTimestamp: Date
  endTimestamp: Date
  appName: string
  windowTitle: string
  browserUrl: string | null
  category: string | null
  isIdle: boolean
}

function isSameActivitySignature(a: SelectActivityLog, b: ActivitySessionDraft): boolean {
  return a.appName === b.appName
    && a.windowTitle === b.windowTitle
    && (a.browserUrl ?? null) === b.browserUrl
    && (a.category ?? null) === b.category
    && a.isIdle === b.isIdle
}

function finalizeSession(session: ActivitySessionDraft): ActivitySession {
  const startMs = session.startTimestamp.getTime()
  const endMs = session.endTimestamp.getTime()
  const inferredSeconds = Math.floor((endMs - startMs) / 1000) + POLL_INTERVAL_SECONDS
  const durationMinutes = Math.max(1, Math.round(Math.max(POLL_INTERVAL_SECONDS, inferredSeconds) / 60))

  return {
    id: session.ids[0],
    logIds: session.ids,
    start: session.startTimestamp.toISOString(),
    end: session.endTimestamp.toISOString(),
    appName: session.appName,
    windowTitle: session.windowTitle,
    browserUrl: session.browserUrl,
    category: session.category,
    isIdle: session.isIdle,
    durationMinutes,
  }
}

function buildActivitySessions(logs: SelectActivityLog[]): ActivitySession[] {
  if (!logs.length)
    return []

  const sessions: ActivitySession[] = []
  let current: ActivitySessionDraft | null = null

  for (const row of logs) {
    if (!current) {
      current = {
        ids: [row.id],
        startTimestamp: row.timestamp,
        endTimestamp: row.timestamp,
        appName: row.appName,
        windowTitle: row.windowTitle,
        browserUrl: row.browserUrl ?? null,
        category: row.category ?? null,
        isIdle: row.isIdle,
      }
      continue
    }

    const gap = row.timestamp.getTime() - current.endTimestamp.getTime()
    const canMerge = gap <= MAX_SESSION_GAP_MS && isSameActivitySignature(row, current)

    if (canMerge) {
      current.ids.push(row.id)
      current.endTimestamp = row.timestamp
      continue
    }

    sessions.push(finalizeSession(current))
    current = {
      ids: [row.id],
      startTimestamp: row.timestamp,
      endTimestamp: row.timestamp,
      appName: row.appName,
      windowTitle: row.windowTitle,
      browserUrl: row.browserUrl ?? null,
      category: row.category ?? null,
      isIdle: row.isIdle,
    }
  }

  if (current)
    sessions.push(finalizeSession(current))

  return sessions
}

function toCategorySummary(sessions: ActivitySession[]): ActivityCategorySummary[] {
  const totals = new Map<string, number>()

  for (const session of sessions) {
    const category = normalizeCategoryKey(session.category)
    totals.set(category, (totals.get(category) ?? 0) + session.durationMinutes)
  }

  return [...totals.entries()]
    .map(([category, minutes]) => ({ category, minutes }))
    .sort((a, b) => b.minutes - a.minutes)
}

function valueForMatchField(entry: z.infer<typeof activityEntrySchema>, field: RuleMatchField): string {
  if (field === 'app_name')
    return entry.appName
  if (field === 'window_title')
    return entry.windowTitle
  return entry.browserUrl ?? ''
}

function isRuleMatch(pattern: string, value: string): boolean {
  const trimmedPattern = pattern.trim()
  if (!trimmedPattern)
    return false

  const regexMatch = /^\/(.*)\/([dgimsuvy]*)$/.exec(trimmedPattern)
  if (regexMatch) {
    try {
      const [, source, flags] = regexMatch
      return new RegExp(source, flags).test(value)
    }
    catch {
      return false
    }
  }

  return value.toLowerCase().includes(trimmedPattern.toLowerCase())
}

function resolveCategoryFromRules(
  entry: z.infer<typeof activityEntrySchema>,
  rules: Array<{
    pattern: string
    matchField: RuleMatchField
    category: string
  }>,
): string | null {
  for (const rule of rules) {
    const value = valueForMatchField(entry, rule.matchField)
    if (isRuleMatch(rule.pattern, value))
      return rule.category
  }
  return null
}

function toResponseGoal(goal: {
  id: string
  name: string
  type: 'countdown' | 'counter' | 'tracker'
  metadata: string
  createdAt: Date | null
  updatedAt: Date | null
}): GoalSnapshot {
  const createdAt = goal.createdAt ?? new Date(0)
  const updatedAt = goal.updatedAt ?? createdAt

  return {
    id: goal.id,
    name: goal.name,
    type: goal.type,
    metadata: parseGoalMetadata(goal.metadata),
    createdAt: createdAt.toISOString(),
    updatedAt: updatedAt.toISOString(),
  }
}

function buildContractProgress(
  contract: {
    id: string
    date: string
    status: 'draft' | 'active' | 'complete'
    blocks: Array<{
      id: string
      label: string
      category: string
      targetMinutes: number
      completedMinutes: number
    }>
  },
  byCategory: ActivityCategorySummary[],
): ContractSnapshot {
  const categoryMap = new Map(byCategory.map(item => [normalizeCategoryKey(item.category), item.minutes]))

  const blocks = contract.blocks.map((block) => {
    const trackedMinutes = categoryMap.get(normalizeCategoryKey(block.category)) ?? 0
    const completedMinutes = Math.max(block.completedMinutes, trackedMinutes)
    const remainingMinutes = Math.max(0, block.targetMinutes - completedMinutes)
    const done = block.targetMinutes === 0 || remainingMinutes === 0
    const progressPercent = block.targetMinutes === 0
      ? 100
      : Math.max(0, Math.min(100, Math.round((completedMinutes / block.targetMinutes) * 100)))

    return {
      id: block.id,
      label: block.label,
      category: block.category,
      targetMinutes: block.targetMinutes,
      completedMinutes,
      remainingMinutes,
      done,
      progressPercent,
    }
  })

  return {
    id: contract.id,
    date: contract.date,
    status: contract.status,
    blocks,
  }
}

async function ingestActivityForUser(
  userId: string,
  input: z.infer<typeof ingestActivitySchema>,
): Promise<{ inserted: number }> {
  const rules = await db.query.CategoryRules.findMany({
    where: eq(CategoryRules.userId, userId),
    orderBy: [desc(CategoryRules.priority), asc(CategoryRules.createdAt)],
  })

  const values = input.entries.map((entry) => {
    const ruleCategory = resolveCategoryFromRules(entry, rules)

    return {
      userId,
      timestamp: entry.timestamp,
      appName: entry.appName,
      windowTitle: entry.windowTitle,
      browserUrl: entry.browserUrl ?? null,
      category: entry.category ?? ruleCategory ?? null,
      isIdle: entry.isIdle ?? false,
    }
  })

  await db.insert(ActivityLogs).values(values)

  return { inserted: values.length }
}

async function getActivityDayForUser(userId: string, rawDate?: string): Promise<ActivityDaySummary> {
  const date = normalizeDateIso(rawDate)
  const { start, end } = getDayBounds(date)

  const logs = await db.query.ActivityLogs.findMany({
    where: and(
      eq(ActivityLogs.userId, userId),
      gte(ActivityLogs.timestamp, start),
      lt(ActivityLogs.timestamp, end),
    ),
    orderBy: asc(ActivityLogs.timestamp),
  })

  const sessions = buildActivitySessions(logs)
  const byCategory = toCategorySummary(sessions)
  const totalMinutes = byCategory.reduce((total, item) => total + item.minutes, 0)
  const latestLog = logs.at(-1) ?? null

  return {
    date,
    totalMinutes,
    byCategory,
    sessions,
    latest: latestLog
      ? {
          timestamp: latestLog.timestamp.toISOString(),
          appName: latestLog.appName,
          windowTitle: latestLog.windowTitle,
          browserUrl: latestLog.browserUrl ?? null,
          category: latestLog.category ?? null,
          isIdle: latestLog.isIdle,
        }
      : null,
  }
}

async function getActivityWeekForUser(userId: string, referenceDate?: string): Promise<ActivityWeekSummary> {
  const week = getWeekBounds(referenceDate)
  const rangeStart = new Date(`${week.startDate}T00:00:00.000Z`)
  const rangeEnd = new Date(`${week.endExclusiveDate}T00:00:00.000Z`)

  const logs = await db.query.ActivityLogs.findMany({
    where: and(
      eq(ActivityLogs.userId, userId),
      gte(ActivityLogs.timestamp, rangeStart),
      lt(ActivityLogs.timestamp, rangeEnd),
    ),
    orderBy: asc(ActivityLogs.timestamp),
  })

  const byDay = new Map<string, SelectActivityLog[]>()
  for (const log of logs) {
    const key = toIsoDate(log.timestamp)
    const list = byDay.get(key)
    if (list)
      list.push(log)
    else
      byDay.set(key, [log])
  }

  const days = week.days.map((date) => {
    const dayLogs = byDay.get(date) ?? []
    const sessions = buildActivitySessions(dayLogs)
    const byCategory = toCategorySummary(sessions)
    const totalMinutes = byCategory.reduce((total, item) => total + item.minutes, 0)

    return {
      date,
      totalMinutes,
      byCategory,
      sessionsCount: sessions.length,
    }
  })

  return {
    startDate: week.startDate,
    endDate: week.endDate,
    days,
  }
}

function buildGroupedDay(sessions: ActivitySession[]): CategoryGroup[] {
  const categoryMap = new Map<string, Map<string, Map<string, { browserUrl: string | null, minutes: number }>>>()

  for (const session of sessions) {
    const catKey = normalizeCategoryKey(session.category)
    if (!categoryMap.has(catKey))
      categoryMap.set(catKey, new Map())

    const appMap = categoryMap.get(catKey)!
    if (!appMap.has(session.appName))
      appMap.set(session.appName, new Map())

    const titleMap = appMap.get(session.appName)!
    const titleKey = session.windowTitle
    const existing = titleMap.get(titleKey)
    if (existing) {
      existing.minutes += session.durationMinutes
    }
    else {
      titleMap.set(titleKey, {
        browserUrl: session.browserUrl,
        minutes: session.durationMinutes,
      })
    }
  }

  const groups: CategoryGroup[] = []

  for (const [category, appMap] of categoryMap) {
    const apps: AppTimeEntry[] = []

    for (const [appName, titleMap] of appMap) {
      const windowTitles: WindowTitleEntry[] = []
      let appTotal = 0

      for (const [title, info] of titleMap) {
        windowTitles.push({
          title,
          browserUrl: info.browserUrl,
          minutes: info.minutes,
        })
        appTotal += info.minutes
      }

      windowTitles.sort((a, b) => b.minutes - a.minutes)
      apps.push({ appName, totalMinutes: appTotal, windowTitles })
    }

    apps.sort((a, b) => b.totalMinutes - a.totalMinutes)
    const totalMinutes = apps.reduce((sum, app) => sum + app.totalMinutes, 0)
    groups.push({ category, totalMinutes, apps })
  }

  groups.sort((a, b) => b.totalMinutes - a.totalMinutes)
  return groups
}

async function getActivityWeekGroupedForUser(userId: string, referenceDate?: string): Promise<WeekGroupedSummary> {
  const week = getWeekBounds(referenceDate)
  const rangeStart = new Date(`${week.startDate}T00:00:00.000Z`)
  const rangeEnd = new Date(`${week.endExclusiveDate}T00:00:00.000Z`)

  const logs = await db.query.ActivityLogs.findMany({
    where: and(
      eq(ActivityLogs.userId, userId),
      gte(ActivityLogs.timestamp, rangeStart),
      lt(ActivityLogs.timestamp, rangeEnd),
    ),
    orderBy: asc(ActivityLogs.timestamp),
  })

  const byDay = new Map<string, SelectActivityLog[]>()
  for (const log of logs) {
    const key = toIsoDate(log.timestamp)
    const list = byDay.get(key)
    if (list)
      list.push(log)
    else
      byDay.set(key, [log])
  }

  const weekTotalsMap = new Map<string, number>()
  let weekTotalMinutes = 0

  const days: DayBreakdown[] = week.days.map((date) => {
    const dayLogs = byDay.get(date) ?? []
    const sessions = buildActivitySessions(dayLogs)
    const byCategory = toCategorySummary(sessions)
    const groups = buildGroupedDay(sessions)
    const totalMinutes = byCategory.reduce((total, item) => total + item.minutes, 0)

    for (const item of byCategory)
      weekTotalsMap.set(item.category, (weekTotalsMap.get(item.category) ?? 0) + item.minutes)

    weekTotalMinutes += totalMinutes

    return { date, totalMinutes, byCategory, groups }
  })

  const weekTotals: ActivityCategorySummary[] = [...weekTotalsMap.entries()]
    .map(([category, minutes]) => ({ category, minutes }))
    .sort((a, b) => b.minutes - a.minutes)

  return {
    startDate: week.startDate,
    endDate: week.endDate,
    days,
    weekTotals,
    weekTotalMinutes,
  }
}

async function listRulesForUser(userId: string) {
  const rows = await db.query.CategoryRules.findMany({
    where: eq(CategoryRules.userId, userId),
    orderBy: [desc(CategoryRules.priority), asc(CategoryRules.createdAt)],
  })

  return rows.map(rule => ({
    id: rule.id,
    pattern: rule.pattern,
    matchField: rule.matchField,
    category: rule.category,
    priority: rule.priority,
    createdAt: (rule.createdAt ?? new Date(0)).toISOString(),
  }))
}

async function createRuleForUser(userId: string, input: z.infer<typeof createRuleSchema>) {
  const id = uuidV7Base58()

  await db.insert(CategoryRules).values({
    id,
    userId,
    pattern: input.pattern,
    matchField: input.matchField,
    category: input.category,
    priority: input.priority,
  })

  return {
    id,
    pattern: input.pattern,
    matchField: input.matchField,
    category: input.category,
    priority: input.priority,
  }
}

async function updateActivityCategoryForUser(userId: string, input: z.infer<typeof updateActivityCategorySchema>) {
  await db
    .update(ActivityLogs)
    .set({
      category: input.category,
    })
    .where(
      and(
        eq(ActivityLogs.userId, userId),
        inArray(ActivityLogs.id, input.logIds),
      ),
    )

  return {
    updated: input.logIds.length,
  }
}

async function getContractRecordForDate(userId: string, date: string) {
  return db.query.Contracts.findFirst({
    where: and(eq(Contracts.userId, userId), eq(Contracts.date, date)),
    with: {
      blocks: {
        orderBy: asc(ContractBlocks.order),
      },
    },
  })
}

async function getContractForUser(userId: string, rawDate?: string): Promise<ContractSnapshot | null> {
  const date = normalizeDateIso(rawDate)
  const contract = await getContractRecordForDate(userId, date)

  if (!contract)
    return null

  const activity = await getActivityDayForUser(userId, date)

  return buildContractProgress(contract, activity.byCategory)
}

async function upsertContractForUser(userId: string, input: z.infer<typeof upsertContractSchema>): Promise<ContractSnapshot> {
  const date = normalizeDateIso(input.date)

  await db.transaction(async (tx) => {
    const existing = await tx.query.Contracts.findFirst({
      where: and(eq(Contracts.userId, userId), eq(Contracts.date, date)),
    })

    const contractId = existing?.id ?? uuidV7Base58()

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
      })
    }

    if (input.blocks.length) {
      await tx.insert(ContractBlocks).values(input.blocks.map((block, index) => ({
        id: uuidV7Base58(),
        contractId,
        label: block.label,
        category: block.category,
        targetMinutes: block.targetMinutes,
        completedMinutes: block.completedMinutes,
        order: index,
      })))
    }
  })

  const snapshot = await getContractForUser(userId, date)
  if (!snapshot)
    throw new Error('Failed to save contract.')
  return snapshot
}

async function updateContractBlockForUser(userId: string, input: z.infer<typeof updateContractBlockSchema>) {
  const block = await db
    .select({
      blockId: ContractBlocks.id,
      contractId: ContractBlocks.contractId,
    })
    .from(ContractBlocks)
    .innerJoin(Contracts, eq(ContractBlocks.contractId, Contracts.id))
    .where(and(eq(ContractBlocks.id, input.id), eq(Contracts.userId, userId)))
    .limit(1)

  const target = block[0]
  if (!target)
    throw new Error('Contract block not found.')

  await db.transaction(async (tx) => {
    await tx
      .update(ContractBlocks)
      .set({
        completedMinutes: input.completedMinutes,
      })
      .where(eq(ContractBlocks.id, target.blockId))

    await tx
      .update(Contracts)
      .set({
        updatedAt: new Date(),
      })
      .where(eq(Contracts.id, target.contractId))
  })

  return {
    id: input.id,
    completedMinutes: input.completedMinutes,
  }
}

async function listGoalsForUser(userId: string): Promise<GoalSnapshot[]> {
  const rows = await db.query.Goals.findMany({
    where: eq(Goals.userId, userId),
    orderBy: desc(Goals.updatedAt),
  })

  return rows.map(toResponseGoal)
}

async function createGoalForUser(userId: string, input: z.infer<typeof createGoalSchema>) {
  const id = uuidV7Base58()

  await db.insert(Goals).values({
    id,
    userId,
    name: input.name,
    type: input.type,
    metadata: JSON.stringify(input.metadata),
  })

  const goal = await db.query.Goals.findFirst({
    where: and(eq(Goals.userId, userId), eq(Goals.id, id)),
  })

  if (!goal)
    throw new Error('Goal creation failed.')

  return toResponseGoal(goal)
}

async function updateGoalForUser(userId: string, input: z.infer<typeof updateGoalSchema>) {
  const existing = await db.query.Goals.findFirst({
    where: and(eq(Goals.userId, userId), eq(Goals.id, input.id)),
  })

  if (!existing)
    throw new Error('Goal not found.')

  const existingMetadata = parseGoalMetadata(existing.metadata)
  const nextMetadata = input.merge
    ? { ...existingMetadata, ...input.metadata }
    : input.metadata

  await db
    .update(Goals)
    .set({
      name: input.name ?? existing.name,
      type: input.type ?? existing.type,
      metadata: JSON.stringify(nextMetadata),
      updatedAt: new Date(),
    })
    .where(and(eq(Goals.userId, userId), eq(Goals.id, input.id)))

  const updated = await db.query.Goals.findFirst({
    where: and(eq(Goals.userId, userId), eq(Goals.id, input.id)),
  })

  if (!updated)
    throw new Error('Goal update failed.')

  return toResponseGoal(updated)
}

async function getDashboardForUser(userId: string, rawDate?: string): Promise<DashboardSnapshot> {
  const date = normalizeDateIso(rawDate)

  const [activity, goals, contract, weekActivity] = await Promise.all([
    getActivityDayForUser(userId, date),
    listGoalsForUser(userId),
    getContractForUser(userId, date),
    getActivityWeekForUser(userId, date),
  ])

  const remaining = (contract?.blocks ?? [])
    .filter(block => !block.done)
    .map(block => ({
      id: block.id,
      label: block.label,
      minutes: block.remainingMinutes,
    }))

  const statusLight: DashboardSnapshot['statusLight'] = remaining.length > 0 ? 'red' : 'green'

  const weekBounds = getWeekBounds(date)
  const contracts = await db.query.Contracts.findMany({
    where: and(
      eq(Contracts.userId, userId),
      gte(Contracts.date, weekBounds.startDate),
      lt(Contracts.date, weekBounds.endExclusiveDate),
    ),
    with: {
      blocks: {
        orderBy: asc(ContractBlocks.order),
      },
    },
  })

  const contractsByDate = new Map(contracts.map(item => [item.date, item]))

  const week = weekActivity.days.map((day) => {
    const contractForDay = contractsByDate.get(day.date)
    if (!contractForDay) {
      return {
        date: day.date,
        status: 'free' as const,
        totalMinutes: day.totalMinutes,
      }
    }

    if (contractForDay.status === 'complete') {
      return {
        date: day.date,
        status: 'complete' as const,
        totalMinutes: day.totalMinutes,
      }
    }

    const progress = buildContractProgress(contractForDay, day.byCategory)
    const allDone = progress.blocks.every(block => block.done)

    return {
      date: day.date,
      status: allDone ? 'complete' as const : 'incomplete' as const,
      totalMinutes: day.totalMinutes,
    }
  })

  return {
    date,
    statusLight,
    remaining,
    contract,
    goals,
    byCategory: activity.byCategory,
    totalMinutes: activity.totalMinutes,
    week,
  }
}

export const ingestActivity = action(async (raw: z.infer<typeof ingestActivitySchema>) => {
  'use server'

  const userId = await requireUserId()
  const input = ingestActivitySchema.parse(raw)
  return ingestActivityForUser(userId, input)
}, 'productivity:activity:ingest')

export const getActivityDay = query(async (date?: string) => {
  'use server'

  const userId = await requireUserId()
  return getActivityDayForUser(userId, date)
}, 'productivity:activity:day')

export const getActivityWeek = query(async (date?: string) => {
  'use server'

  const userId = await requireUserId()
  return getActivityWeekForUser(userId, date)
}, 'productivity:activity:week')

export const listCategoryRules = query(async () => {
  'use server'

  const userId = await requireUserId()
  return listRulesForUser(userId)
}, 'productivity:rules:list')

export const createCategoryRule = action(async (raw: z.infer<typeof createRuleSchema>) => {
  'use server'

  const userId = await requireUserId()
  const input = createRuleSchema.parse(raw)
  return createRuleForUser(userId, input)
}, 'productivity:rules:create')

export const updateActivityCategory = action(async (raw: z.infer<typeof updateActivityCategorySchema>) => {
  'use server'

  const userId = await requireUserId()
  const input = updateActivityCategorySchema.parse(raw)
  return updateActivityCategoryForUser(userId, input)
}, 'productivity:activity:updateCategory')

export const getTodayContract = query(async (date?: string) => {
  'use server'

  const userId = await requireUserId()
  return getContractForUser(userId, date)
}, 'productivity:contract:today')

export const upsertContract = action(async (raw: z.infer<typeof upsertContractSchema>) => {
  'use server'

  const userId = await requireUserId()
  const input = upsertContractSchema.parse(raw)
  return upsertContractForUser(userId, input)
}, 'productivity:contract:upsert')

export const updateContractBlock = action(async (raw: z.infer<typeof updateContractBlockSchema>) => {
  'use server'

  const userId = await requireUserId()
  const input = updateContractBlockSchema.parse(raw)
  return updateContractBlockForUser(userId, input)
}, 'productivity:contract:block:update')

export const listGoals = query(async () => {
  'use server'

  const userId = await requireUserId()
  return listGoalsForUser(userId)
}, 'productivity:goals:list')

export const createGoal = action(async (raw: z.infer<typeof createGoalSchema>) => {
  'use server'

  const userId = await requireUserId()
  const input = createGoalSchema.parse(raw)
  return createGoalForUser(userId, input)
}, 'productivity:goals:create')

export const updateGoal = action(async (raw: z.infer<typeof updateGoalSchema>) => {
  'use server'

  const userId = await requireUserId()
  const input = updateGoalSchema.parse(raw)
  return updateGoalForUser(userId, input)
}, 'productivity:goals:update')

export const getDashboard = query(async (date?: string) => {
  'use server'

  const userId = await requireUserId()
  return getDashboardForUser(userId, date)
}, 'productivity:dashboard')

export const getActivityWeekGrouped = query(async (date?: string) => {
  'use server'

  const userId = await requireUserId()
  return getActivityWeekGroupedForUser(userId, date)
}, 'productivity:activity:week:grouped')
