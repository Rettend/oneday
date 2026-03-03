import type { AppTimeEntry, CategoryGroup, DayBreakdown } from '~/lib/productivity'
import { Protected } from '@rttnd/gau/client/solid'
import { createAsync } from '@solidjs/router'
import { createMemo, createSignal, For, Show } from 'solid-js'
import { CategoryBar, CategoryChip } from '~/components/productivity/shared'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '~/components/ui/collapsible'
import { getCategoryColor, getCategoryStyle } from '~/lib/categories'
import { formatMinutes, getTodayDateIso } from '~/lib/productivity'
import { getActivityWeekGrouped } from '~/server/remote/productivity'

function ActivityPage() {
  const weekData = createAsync(() => getActivityWeekGrouped(getTodayDateIso()))

  const dateRange = createMemo(() => {
    const data = weekData()
    if (!data)
      return ''

    const start = new Date(`${data.startDate}T00:00:00.000Z`)
    const end = new Date(`${data.endDate}T00:00:00.000Z`)
    const fmt: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', timeZone: 'UTC' }
    return `${start.toLocaleDateString('en-US', fmt)} – ${end.toLocaleDateString('en-US', { ...fmt, year: 'numeric', timeZone: 'UTC' })}`
  })

  const maxDayMinutes = createMemo(() => {
    const days = weekData()?.days ?? []
    return Math.max(1, ...days.map(d => d.totalMinutes))
  })

  return (
    <section class="flex flex-col gap-6 max-w-4xl">
      {/* Header */}
      <header class="space-y-1">
        <h1 class="text-3xl tracking-tight font-semibold">Activity</h1>
        <p class="text-sm text-muted-foreground">{dateRange() || 'Loading...'}</p>
      </header>

      {/* Week Overview */}
      <div class="space-y-3">
        <h3 class="text-sm text-muted-foreground tracking-wider font-medium uppercase">Week overview</h3>
        <div class="space-y-1.5">
          <For each={weekData()?.days ?? []}>
            {day => (
              <DayBarRow
                date={day.date}
                categories={day.byCategory}
                totalMinutes={day.totalMinutes}
                maxMinutes={maxDayMinutes()}
              />
            )}
          </For>
        </div>
      </div>

      {/* Week Totals */}
      <Show when={(weekData()?.weekTotals.length ?? 0) > 0}>
        <div class="p-5 border border-border/60 rounded-2xl space-y-3">
          <div class="flex items-center justify-between">
            <h3 class="text-sm text-muted-foreground tracking-wider font-medium uppercase">Week totals</h3>
            <span class="text-xs text-muted-foreground">
              {formatMinutes(weekData()?.weekTotalMinutes ?? 0)} total
            </span>
          </div>
          <CategoryBar
            categories={weekData()?.weekTotals ?? []}
            totalMinutes={weekData()?.weekTotalMinutes ?? 0}
            height="h-4"
          />
        </div>
      </Show>

      {/* Daily Breakdown */}
      <div class="space-y-3">
        <h3 class="text-sm text-muted-foreground tracking-wider font-medium uppercase">Daily breakdown</h3>
        <div class="space-y-2">
          <For each={weekData()?.days ?? []}>
            {day => (
              <Show when={day.totalMinutes > 0}>
                <DayAccordion day={day} />
              </Show>
            )}
          </For>

          <Show when={weekData() && weekData()!.days.every(d => d.totalMinutes === 0)}>
            <p class="text-sm text-muted-foreground py-4">No activity tracked this week yet.</p>
          </Show>
        </div>
      </div>
    </section>
  )
}

export default Protected(ActivityPage, '/')

function DayBarRow(props: {
  date: string
  categories: { category: string, minutes: number }[]
  totalMinutes: number
  maxMinutes: number
}) {
  const label = () => {
    return new Date(`${props.date}T00:00:00.000Z`).toLocaleDateString('en-US', {
      weekday: 'short',
      timeZone: 'UTC',
    })
  }

  const isToday = () => props.date === getTodayDateIso()
  const barWidth = () => props.maxMinutes > 0
    ? Math.max(2, Math.round((props.totalMinutes / props.maxMinutes) * 100))
    : 0

  return (
    <div
      class="py-1.5 flex gap-3 items-center"
      classList={{ 'opacity-40': props.totalMinutes === 0 && !isToday() }}
    >
      <span
        class="text-xs font-medium shrink-0 w-10"
        classList={{ 'text-primary': isToday() }}
      >
        {label()}
      </span>

      <div class="rounded-full bg-muted/30 flex-1 h-3.5 overflow-hidden">
        <div
          class="rounded-full flex h-full transition-all duration-500 overflow-hidden"
          style={{ width: `${barWidth()}%` }}
        >
          <For each={props.categories}>
            {(item) => {
              const pct = () => props.totalMinutes > 0
                ? Math.max(1, Math.round((item.minutes / props.totalMinutes) * 100))
                : 0
              return (
                <div
                  class="h-full"
                  style={{
                    'width': `${pct()}%`,
                    'background-color': getCategoryColor(item.category),
                    'min-width': '2px',
                  }}
                />
              )
            }}
          </For>
        </div>
      </div>

      <span class="text-xs text-muted-foreground text-right shrink-0 w-12">
        {props.totalMinutes > 0 ? formatMinutes(props.totalMinutes) : '—'}
      </span>
    </div>
  )
}

function DayAccordion(props: { day: DayBreakdown }) {
  const label = () => {
    return new Date(`${props.day.date}T00:00:00.000Z`).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      timeZone: 'UTC',
    })
  }

  const isToday = () => props.day.date === getTodayDateIso()

  return (
    <Collapsible defaultOpen={isToday()}>
      <CollapsibleTrigger
        class="px-4 py-3 border border-border/60 rounded-xl flex gap-3 w-full transition-colors items-center justify-between hover:border-primary/30 data-[expanded]:border-b-transparent data-[expanded]:rounded-b-none hover:bg-primary/3"
      >
        <span class="flex gap-2 items-center">
          <span class="i-ph-caret-right-duotone text-muted-foreground size-4 transition-transform duration-200 [[data-expanded]_&]:rotate-90" />
          <span class="text-sm font-medium">{label()}</span>
          <Show when={isToday()}>
            <span class="text-10px text-primary font-medium px-1.5 py-0.5 rounded-full bg-primary/10">Today</span>
          </Show>
        </span>
        <span class="text-xs text-muted-foreground">{formatMinutes(props.day.totalMinutes)}</span>
      </CollapsibleTrigger>

      <CollapsibleContent class="px-4 pb-4 border border-t-0 border-border/60 rounded-b-xl space-y-4 !mt-0">
        <For each={props.day.groups}>
          {group => <CategoryGroupSection group={group} dayTotal={props.day.totalMinutes} />}
        </For>
      </CollapsibleContent>
    </Collapsible>
  )
}

function CategoryGroupSection(props: { group: CategoryGroup, dayTotal: number }) {
  const style = () => getCategoryStyle(props.group.category)

  return (
    <div class="space-y-2">
      {/* Category header */}
      <div class="pt-1 flex items-center justify-between">
        <div class="flex gap-2 items-center">
          <span
            class={`${style().icon} size-4.5`}
            style={{ color: getCategoryColor(props.group.category) }}
          />
          <span class="text-sm font-medium">{style().label}</span>
          <CategoryChip category={props.group.category} class="text-10px !px-2 !py-0.5" />
        </div>
        <span class="text-xs text-muted-foreground">{formatMinutes(props.group.totalMinutes)}</span>
      </div>

      {/* App list */}
      <div class="ml-6 pl-4 border-l border-border/60 space-y-1">
        <For each={props.group.apps}>
          {app => <AppRow app={app} />}
        </For>
      </div>
    </div>
  )
}

function AppRow(props: { app: AppTimeEntry }) {
  const [expanded, setExpanded] = createSignal(false)
  const hasMultipleTitles = () => props.app.windowTitles.length > 1

  return (
    <div>
      <button
        type="button"
        class="text-sm px-2 py-1.5 text-left rounded-md flex gap-2 w-full transition-colors items-center justify-between -mx-2 hover:bg-muted/30"
        classList={{ 'cursor-pointer': hasMultipleTitles(), 'cursor-default': !hasMultipleTitles() }}
        onClick={() => hasMultipleTitles() && setExpanded(prev => !prev)}
      >
        <span class="flex gap-2 min-w-0 items-center">
          <Show when={hasMultipleTitles()}>
            <span
              class="i-ph-caret-right-duotone text-muted-foreground shrink-0 size-3.5 transition-transform duration-200"
              classList={{ 'rotate-90': expanded() }}
            />
          </Show>
          <Show when={!hasMultipleTitles()}>
            <span class="shrink-0 size-3.5" />
          </Show>
          <span class="truncate">{props.app.appName}</span>
        </span>
        <span class="text-xs text-muted-foreground shrink-0">{formatMinutes(props.app.totalMinutes)}</span>
      </button>

      {/* Expanded window titles */}
      <Show when={expanded()}>
        <div class="ml-8 py-1 pl-3 border-l border-border/40 space-y-0.5">
          <For each={props.app.windowTitles}>
            {wt => (
              <div class="text-xs text-muted-foreground py-1 flex gap-3 items-start justify-between">
                <span class="min-w-0 break-words">
                  <span class="text-foreground/80">{wt.title}</span>
                  <Show when={wt.browserUrl}>
                    <span class="text-10px text-muted-foreground/60 ml-1.5 break-all">{wt.browserUrl}</span>
                  </Show>
                </span>
                <span class="shrink-0">{formatMinutes(wt.minutes)}</span>
              </div>
            )}
          </For>
        </div>
      </Show>
    </div>
  )
}
