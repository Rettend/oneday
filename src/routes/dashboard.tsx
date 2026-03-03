import { Protected } from '@rttnd/gau/client/solid'
import { createMemo, createResource, For, Show } from 'solid-js'
import { CategoryBar, ProgressRow } from '~/components/productivity/shared'
import { getCategoryColor, getCategoryIcon } from '~/lib/categories'
import { clampPercentage, formatMinutes, getTodayDateIso } from '~/lib/productivity'
import { A } from '~/router'
import { getDashboard } from '~/server/remote/productivity'

export default Protected(DashboardPage, '/')

function DashboardPage() {
  const [dashboard] = createResource(() => getTodayDateIso(), date => getDashboard(date))

  const statusMessage = createMemo(() => {
    const data = dashboard()
    if (!data)
      return 'Loading contract status...'

    if (data.statusLight === 'green') {
      if (!data.contract)
        return 'No contract scheduled today. You are free from the start.'

      return 'Contract complete. The rest of the day is yours.'
    }

    return data.remaining
      .map(item => `${formatMinutes(item.minutes)} ${item.label.toLowerCase()}`)
      .join(' · ')
  })

  const overallProgress = createMemo(() => {
    const blocks = dashboard()?.contract?.blocks ?? []
    if (!blocks.length)
      return 100

    const totalTarget = blocks.reduce((sum, b) => sum + b.targetMinutes, 0)
    const totalDone = blocks.reduce((sum, b) => sum + b.completedMinutes, 0)
    if (totalTarget <= 0)
      return 100
    return clampPercentage(Math.round((totalDone / totalTarget) * 100))
  })

  const todayLabel = () => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })
  }

  return (
    <section class="flex flex-col gap-6 max-w-4xl">
      {/* Header */}
      <header class="flex flex-wrap gap-3 items-end justify-between">
        <h1 class="text-3xl tracking-tight font-semibold">Dashboard</h1>
        <span class="text-sm text-muted-foreground">{todayLabel()}</span>
      </header>

      {/* Status Hero */}
      <div
        class="p-6 border rounded-2xl space-y-4"
        classList={{
          'border-emerald-500/30 bg-emerald-500/5': dashboard()?.statusLight === 'green',
          'border-rose-500/30 bg-rose-500/5': dashboard()?.statusLight !== 'green',
        }}
      >
        <div class="flex gap-4 items-center">
          <div
            class="rounded-full shrink-0 size-8"
            classList={{
              'bg-emerald-400 shadow-[0_0_28px_rgba(52,211,153,0.5)]': dashboard()?.statusLight === 'green',
              'bg-rose-400 shadow-[0_0_28px_rgba(251,113,133,0.5)]': dashboard()?.statusLight !== 'green',
            }}
          />
          <div class="min-w-0">
            <h2 class="text-xl font-semibold">
              {dashboard()?.statusLight === 'green' ? 'You are free' : 'Contract incomplete'}
            </h2>
            <p class="text-sm text-muted-foreground">{statusMessage()}</p>
          </div>
        </div>

        {/* Overall progress bar */}
        <Show when={dashboard()?.contract}>
          <div class="space-y-1.5">
            <div class="rounded-full bg-muted/50 h-3 w-full overflow-hidden">
              <div
                class="rounded-full h-full transition-all duration-700"
                classList={{
                  'bg-emerald-400': dashboard()?.statusLight === 'green',
                  'bg-rose-400': dashboard()?.statusLight !== 'green',
                }}
                style={{ width: `${overallProgress()}%` }}
              />
            </div>
            <p class="text-xs text-muted-foreground text-right">{overallProgress()}% complete</p>
          </div>
        </Show>
      </div>

      {/* Contract Blocks */}
      <Show when={dashboard()?.contract}>
        <div class="space-y-3">
          <h3 class="text-sm text-muted-foreground tracking-wider font-medium uppercase">Contract</h3>
          <div class="space-y-2.5">
            <For each={dashboard()?.contract?.blocks ?? []}>
              {block => (
                <ProgressRow
                  label={block.label}
                  value={`${formatMinutes(block.completedMinutes)} / ${formatMinutes(block.targetMinutes)}`}
                  percentage={clampPercentage(block.progressPercent)}
                  done={block.done}
                  icon={getCategoryIcon(block.category)}
                  iconColor={getCategoryColor(block.category)}
                />
              )}
            </For>
          </div>
        </div>
      </Show>

      {/* Today's Time */}
      <A href="/activity" class="group block">
        <div class="p-5 border border-border/60 rounded-2xl transition-colors space-y-3 group-hover:border-primary/30">
          <div class="flex items-center justify-between">
            <h3 class="text-sm text-muted-foreground tracking-wider font-medium uppercase">Today's time</h3>
            <span class="text-xs text-muted-foreground">
              {formatMinutes(dashboard()?.totalMinutes ?? 0)}
              {' '}
              tracked
              <span class="i-ph-arrow-right-duotone text-primary ml-1 opacity-0 size-3.5 transition-opacity group-hover:opacity-100" />
            </span>
          </div>
          <Show
            when={(dashboard()?.byCategory.length ?? 0) > 0}
            fallback={<p class="text-sm text-muted-foreground">No activity tracked yet today.</p>}
          >
            <CategoryBar
              categories={dashboard()?.byCategory ?? []}
              totalMinutes={dashboard()?.totalMinutes ?? 0}
            />
          </Show>
        </div>
      </A>

      {/* This Week */}
      <div class="space-y-3">
        <h3 class="text-sm text-muted-foreground tracking-wider font-medium uppercase">This week</h3>
        <div class="gap-2 grid grid-cols-7">
          <For each={dashboard()?.week ?? []}>
            {day => <WeekDayCell date={day.date} status={day.status} minutes={day.totalMinutes} />}
          </For>
        </div>
      </div>

      {/* Goals */}
      <Show when={(dashboard()?.goals.length ?? 0) > 0}>
        <div class="space-y-3">
          <h3 class="text-sm text-muted-foreground tracking-wider font-medium uppercase">Goals</h3>
          <div class="space-y-2.5">
            <For each={dashboard()?.goals ?? []}>
              {goal => (
                <ProgressRow
                  label={goal.name}
                  value={goalValue(goal.type, goal.metadata)}
                  percentage={goalProgress(goal.type, goal.metadata) ?? undefined}
                  icon="i-ph-target-duotone"
                  iconColor="oklch(var(--primary))"
                />
              )}
            </For>
          </div>
        </div>
      </Show>
    </section>
  )
}

function WeekDayCell(props: { date: string, status: 'free' | 'complete' | 'incomplete', minutes: number }) {
  const label = () => {
    return new Date(`${props.date}T00:00:00.000Z`).toLocaleDateString([], {
      weekday: 'short',
      timeZone: 'UTC',
    })
  }

  const isToday = () => props.date === getTodayDateIso()

  const ringClass = () => {
    if (props.status === 'complete')
      return 'bg-emerald-500/15 border-emerald-500/40'
    if (props.status === 'incomplete')
      return 'bg-rose-500/10 border-rose-500/30'
    return 'bg-muted/30 border-border/60'
  }

  const dotClass = () => {
    if (props.status === 'complete')
      return 'bg-emerald-400'
    if (props.status === 'incomplete')
      return 'bg-rose-400'
    return 'bg-muted-foreground/30'
  }

  return (
    <div
      class={`p-2.5 border rounded-xl flex flex-col gap-1 transition-colors items-center ${ringClass()}`}
      classList={{ 'ring-1 ring-primary/30': isToday() }}
    >
      <span class={`rounded-full size-2.5 ${dotClass()}`} />
      <span class="text-xs font-medium">{label()}</span>
      <span class="text-10px text-muted-foreground">{formatMinutes(props.minutes)}</span>
    </div>
  )
}

function goalValue(type: 'countdown' | 'counter' | 'tracker', metadata: Record<string, unknown>): string {
  if (type === 'countdown') {
    const targetDate = typeof metadata.targetDate === 'string' ? metadata.targetDate : null
    if (!targetDate)
      return 'No target date'

    const now = new Date()
    const target = new Date(targetDate)
    const days = Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return days <= 0 ? 'Due now' : `${days} days left`
  }

  if (type === 'counter') {
    const current = typeof metadata.current === 'number' ? metadata.current : 0
    const total = typeof metadata.total === 'number' ? metadata.total : null
    return total ? `${current} / ${total}` : `${current}`
  }

  const value = metadata.value
  if (typeof value === 'string' && value.trim())
    return value

  return 'Tracking'
}

function goalProgress(type: 'countdown' | 'counter' | 'tracker', metadata: Record<string, unknown>): number | null {
  if (type === 'counter') {
    const current = typeof metadata.current === 'number' ? metadata.current : 0
    const total = typeof metadata.total === 'number' ? metadata.total : 0
    if (total <= 0)
      return null
    return (current / total) * 100
  }

  if (type === 'countdown') {
    const startDate = typeof metadata.startDate === 'string' ? metadata.startDate : null
    const targetDate = typeof metadata.targetDate === 'string' ? metadata.targetDate : null
    if (!startDate || !targetDate)
      return null

    const start = new Date(startDate).getTime()
    const end = new Date(targetDate).getTime()
    const now = Date.now()
    const total = end - start
    if (!Number.isFinite(total) || total <= 0)
      return null
    return ((now - start) / total) * 100
  }

  return null
}
