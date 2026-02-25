import { Protected } from '@rttnd/gau/client/solid'
import { createMemo, createResource, createSignal, For, Show } from 'solid-js'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { clampPercentage, formatMinutes, getTodayDateIso } from '~/lib/productivity'
import { getDashboard } from '~/server/remote/productivity'

export default Protected(DashboardPage, '/')

function DashboardPage() {
  const [selectedDate, setSelectedDate] = createSignal(getTodayDateIso())
  const [dashboard] = createResource(selectedDate, date => getDashboard(date))

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
      .map(item => `${formatMinutes(item.minutes)} ${item.label.toLowerCase()} left`)
      .join(', ')
  })

  return (
    <section class="flex flex-col gap-6">
      <header class="flex flex-wrap gap-3 items-center justify-between">
        <div class="space-y-2">
          <h1 class="text-3xl tracking-tight font-semibold">Dashboard</h1>
          <p class="text-sm text-muted-foreground">
            One view for your day: contract status, goals, and where your time is going.
          </p>
        </div>

        <label class="text-xs text-muted-foreground flex gap-2 items-center">
          Date
          <input
            type="date"
            value={selectedDate()}
            class="text-sm px-3 py-1.5 border border-border/70 rounded-full bg-background"
            onInput={event => setSelectedDate(event.currentTarget.value || getTodayDateIso())}
          />
        </label>
      </header>

      <Card class="border-primary/30 bg-primary/8">
        <CardHeader class="pb-3">
          <CardTitle class="text-xl flex gap-3 items-center">
            <span
              class={`rounded-full size-6 shadow-[0_0_24px_rgba(0,0,0,0.35)] ${dashboard()?.statusLight === 'green' ? 'bg-emerald-400 shadow-emerald-400/60' : 'bg-rose-400 shadow-rose-400/60'}`}
            />
            {dashboard()?.statusLight === 'green' ? 'You are free' : 'Contract incomplete'}
          </CardTitle>
          <CardDescription>
            {statusMessage()}
          </CardDescription>
        </CardHeader>
      </Card>

      <div class="gap-4 grid md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Today's contract</CardTitle>
            <CardDescription>Blocks with auto-progress from activity categories.</CardDescription>
          </CardHeader>
          <CardContent class="space-y-3">
            <Show
              when={(dashboard()?.contract?.blocks.length ?? 0) > 0}
              fallback={<p class="text-sm text-muted-foreground">No contract blocks yet for this day.</p>}
            >
              <For each={dashboard()?.contract?.blocks ?? []}>
                {block => (
                  <ContractRow
                    label={block.label}
                    progress={`${formatMinutes(block.completedMinutes)} / ${formatMinutes(block.targetMinutes)}`}
                    percentage={clampPercentage(block.progressPercent)}
                    done={block.done}
                  />
                )}
              </For>
            </Show>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Live activity</CardTitle>
            <CardDescription>Current app/window from the latest tracker event.</CardDescription>
          </CardHeader>
          <CardContent class="text-sm space-y-2">
            <Show
              when={dashboard()?.liveActivity}
              fallback={<p class="text-muted-foreground">No live activity yet for this day.</p>}
            >
              {live => (
                <>
                  <p class="text-muted-foreground">Latest activity</p>
                  <p>
                    <span class="font-medium">{live().appName}</span>
                    {' - '}
                    {live().windowTitle}
                  </p>
                  <Show when={live().browserUrl}>
                    <p class="text-xs text-muted-foreground break-all">{live().browserUrl}</p>
                  </Show>
                </>
              )}
            </Show>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Goal trackers</CardTitle>
            <CardDescription>LLM-managed counters and countdowns.</CardDescription>
          </CardHeader>
          <CardContent class="text-sm space-y-2">
            <Show
              when={(dashboard()?.goals.length ?? 0) > 0}
              fallback={<p class="text-muted-foreground">No active goals yet.</p>}
            >
              <For each={dashboard()?.goals ?? []}>
                {goal => (
                  <GoalRow
                    label={goal.name}
                    value={goalValue(goal.type, goal.metadata)}
                    progress={goalProgress(goal.type, goal.metadata)}
                  />
                )}
              </For>
            </Show>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>This week</CardTitle>
            <CardDescription>Daily status snapshot.</CardDescription>
          </CardHeader>
          <CardContent>
            <div class="text-xs gap-2 grid grid-cols-7">
              <For each={dashboard()?.week ?? []}>
                {day => (
                  <WeekDay label={dayLabel(day.date)} status={day.status} minutes={day.totalMinutes} />
                )}
              </For>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}

function ContractRow(props: { label: string, progress: string, percentage: number, done: boolean }) {
  return (
    <div class="space-y-1.5">
      <div class="text-sm flex items-center justify-between">
        <span class="flex gap-1.5 items-center">
          <span class={`rounded-full size-2.5 ${props.done ? 'bg-emerald-400' : 'bg-rose-400'}`} />
          {props.label}
        </span>
        <span class="text-xs text-muted-foreground">{props.progress}</span>
      </div>
      <div class="rounded-full bg-muted h-2 w-full overflow-hidden">
        <div class="rounded-full bg-primary h-full" style={{ width: `${props.percentage}%` }} />
      </div>
    </div>
  )
}

function GoalRow(props: { label: string, value: string, progress: number | null }) {
  return (
    <div class="space-y-1">
      <div class="text-sm flex items-center justify-between">
        <span class="text-muted-foreground">{props.label}</span>
        <span class="font-medium">{props.value}</span>
      </div>
      <Show when={props.progress !== null}>
        <div class="rounded-full bg-muted h-1.5 w-full overflow-hidden">
          <div
            class="rounded-full bg-primary/80 h-full"
            style={{ width: `${clampPercentage(props.progress ?? 0)}%` }}
          />
        </div>
      </Show>
    </div>
  )
}

function WeekDay(props: { label: string, status: 'free' | 'complete' | 'incomplete', minutes: number }) {
  const dotClass = () => {
    if (props.status === 'complete')
      return 'bg-emerald-500'
    if (props.status === 'incomplete')
      return 'bg-rose-500'
    return 'bg-sky-400'
  }

  return (
    <div class="p-2 border rounded-lg bg-card/70 flex flex-col gap-1 items-center">
      <span class={`rounded-full size-2.5 ${dotClass()}`} />
      <span>{props.label}</span>
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

function dayLabel(date: string): string {
  return new Date(`${date}T00:00:00.000Z`).toLocaleDateString([], {
    weekday: 'short',
    timeZone: 'UTC',
  })
}
