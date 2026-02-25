import { z } from 'zod'

export const CATEGORY_OPTIONS = ['study', 'project', 'freelance', 'entertainment', 'other', 'uncategorized'] as const

export type ActivityCategory = typeof CATEGORY_OPTIONS[number]

export const RULE_MATCH_FIELDS = ['app_name', 'window_title', 'browser_url'] as const

export type RuleMatchField = typeof RULE_MATCH_FIELDS[number]

export const CONTRACT_STATUSES = ['draft', 'active', 'complete'] as const

export type ContractStatus = typeof CONTRACT_STATUSES[number]

export const GOAL_TYPES = ['countdown', 'counter', 'tracker'] as const

export type GoalType = typeof GOAL_TYPES[number]

export const POLL_INTERVAL_SECONDS = 5
export const MAX_SESSION_GAP_MS = 90_000
export const DATE_ISO_RE = /^\d{4}-\d{2}-\d{2}$/

export const activityEntrySchema = z.object({
  timestamp: z
    .union([z.date(), z.string(), z.number()])
    .transform((value) => {
      if (value instanceof Date)
        return value
      return new Date(value)
    })
    .refine(value => !Number.isNaN(value.getTime()), 'Invalid timestamp.'),
  appName: z.string().trim().min(1),
  windowTitle: z.string().trim().min(1),
  browserUrl: z.string().url().nullable().optional(),
  category: z.string().trim().min(1).nullable().optional(),
  isIdle: z.boolean().optional(),
})

export const ingestActivitySchema = z.object({
  entries: z.array(activityEntrySchema).min(1),
})

export const createRuleSchema = z.object({
  pattern: z.string().trim().min(1),
  matchField: z.enum(RULE_MATCH_FIELDS),
  category: z.string().trim().min(1),
  priority: z.number().int().min(-9999).max(9999).default(0),
})

export const updateActivityCategorySchema = z.object({
  logIds: z.array(z.string().trim().min(1)).min(1),
  category: z.string().trim().min(1).nullable(),
})

export const contractBlockInputSchema = z.object({
  label: z.string().trim().min(1),
  category: z.string().trim().min(1),
  targetMinutes: z.number().int().min(0),
  completedMinutes: z.number().int().min(0).default(0),
})

export const upsertContractSchema = z.object({
  date: z.string().regex(DATE_ISO_RE).optional(),
  status: z.enum(CONTRACT_STATUSES).default('active'),
  blocks: z.array(contractBlockInputSchema).default([]),
})

export const updateContractBlockSchema = z.object({
  id: z.string().trim().min(1),
  completedMinutes: z.number().int().min(0),
})

export const createGoalSchema = z.object({
  name: z.string().trim().min(1),
  type: z.enum(GOAL_TYPES),
  metadata: z.record(z.string(), z.unknown()).default({}),
})

export const updateGoalSchema = z.object({
  id: z.string().trim().min(1),
  name: z.string().trim().min(1).optional(),
  type: z.enum(GOAL_TYPES).optional(),
  metadata: z.record(z.string(), z.unknown()),
  merge: z.boolean().default(true),
})

export interface ActivitySession {
  id: string
  logIds: string[]
  start: string
  end: string
  appName: string
  windowTitle: string
  browserUrl: string | null
  category: string | null
  isIdle: boolean
  durationMinutes: number
}

export interface ActivityCategorySummary {
  category: string
  minutes: number
}

export interface ActivityDaySummary {
  date: string
  totalMinutes: number
  byCategory: ActivityCategorySummary[]
  sessions: ActivitySession[]
  latest: {
    timestamp: string
    appName: string
    windowTitle: string
    browserUrl: string | null
    category: string | null
    isIdle: boolean
  } | null
}

export interface ActivityWeekSummary {
  startDate: string
  endDate: string
  days: Array<{
    date: string
    totalMinutes: number
    byCategory: ActivityCategorySummary[]
    sessionsCount: number
  }>
}

export interface ContractBlockProgress {
  id: string
  label: string
  category: string
  targetMinutes: number
  completedMinutes: number
  remainingMinutes: number
  done: boolean
  progressPercent: number
}

export interface ContractSnapshot {
  id: string
  date: string
  status: 'draft' | 'active' | 'complete'
  blocks: ContractBlockProgress[]
}

export interface GoalSnapshot {
  id: string
  name: string
  type: 'countdown' | 'counter' | 'tracker'
  metadata: Record<string, unknown>
  createdAt: string
  updatedAt: string
}

export interface DashboardSnapshot {
  date: string
  statusLight: 'green' | 'red'
  remaining: Array<{
    id: string
    label: string
    minutes: number
  }>
  contract: ContractSnapshot | null
  goals: GoalSnapshot[]
  week: Array<{
    date: string
    status: 'free' | 'complete' | 'incomplete'
    totalMinutes: number
  }>
  liveActivity: ActivityDaySummary['latest']
}

export function getTodayDateIso(): string {
  return new Date().toISOString().slice(0, 10)
}

export function formatMinutes(minutes: number): string {
  if (!Number.isFinite(minutes) || minutes <= 0)
    return '0m'

  if (minutes < 60)
    return `${Math.round(minutes)}m`

  const hours = Math.floor(minutes / 60)
  const remainder = Math.round(minutes % 60)

  if (remainder === 0)
    return `${hours}h`

  return `${hours}h ${remainder}m`
}

export function clampPercentage(value: number): number {
  if (!Number.isFinite(value))
    return 0
  return Math.max(0, Math.min(100, value))
}

export function normalizeDateIso(value?: string): string {
  if (!value)
    return getTodayDateIso()

  if (!DATE_ISO_RE.test(value))
    throw new Error('Invalid date. Expected YYYY-MM-DD.')

  return value
}

export function getDayBounds(dateIso: string): { start: Date, end: Date } {
  const start = new Date(`${dateIso}T00:00:00.000Z`)
  const end = new Date(start)
  end.setUTCDate(end.getUTCDate() + 1)
  return { start, end }
}

export function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10)
}

export function getWeekBounds(referenceDateIso?: string): {
  startDate: string
  endDate: string
  endExclusiveDate: string
  days: string[]
} {
  const normalized = normalizeDateIso(referenceDateIso)
  const reference = new Date(`${normalized}T00:00:00.000Z`)
  const day = reference.getUTCDay()
  const diffToMonday = (day + 6) % 7

  const start = new Date(reference)
  start.setUTCDate(start.getUTCDate() - diffToMonday)

  const end = new Date(start)
  end.setUTCDate(end.getUTCDate() + 6)

  const endExclusive = new Date(end)
  endExclusive.setUTCDate(endExclusive.getUTCDate() + 1)

  const days: string[] = []
  for (let index = 0; index < 7; index += 1) {
    const current = new Date(start)
    current.setUTCDate(start.getUTCDate() + index)
    days.push(toIsoDate(current))
  }

  return {
    startDate: toIsoDate(start),
    endDate: toIsoDate(end),
    endExclusiveDate: toIsoDate(endExclusive),
    days,
  }
}

export function normalizeCategoryKey(value: string | null | undefined): string {
  return (value ?? 'uncategorized').trim().toLowerCase()
}

export function parseGoalMetadata(raw: string): Record<string, unknown> {
  try {
    const parsed = JSON.parse(raw)
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed))
      return parsed as Record<string, unknown>
  }
  catch {
  }

  return {}
}
