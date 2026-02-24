import { Protected } from '@rttnd/gau/client/solid'
import { For } from 'solid-js'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'

export default Protected(ActivityPage, '/')

const timelineRows = [
  {
    time: '10:10 - 10:42',
    app: 'VS Code',
    title: 'oneday/src/routes/dashboard.tsx',
    duration: '32 min',
    category: 'project',
  },
  {
    time: '10:43 - 10:58',
    app: 'YouTube',
    title: 'Calm piano playlist',
    duration: '15 min',
    category: 'entertainment',
  },
  {
    time: '11:00 - 11:35',
    app: 'Notion',
    title: 'Math definitions review',
    duration: '35 min',
    category: 'study',
  },
] as const

export function ActivityPage() {
  return (
    <section class="flex flex-col gap-6">
      <header class="space-y-2">
        <h1 class="text-3xl tracking-tight font-semibold">Activity</h1>
        <p class="text-sm text-muted-foreground">
          Timeline and category breakdown for what you actually did.
        </p>
      </header>

      <div class="gap-4 grid lg:grid-cols-[2fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Timeline</CardTitle>
            <CardDescription>Contiguous sessions grouped by app/window (mock data for now).</CardDescription>
          </CardHeader>
          <CardContent class="space-y-2">
            <For each={timelineRows}>
              {row => (
                <article class="p-3 border border-border/70 rounded-xl bg-card/70">
                  <div class="text-xs text-muted-foreground mb-1 flex items-center justify-between">
                    <span>{row.time}</span>
                    <span>{row.duration}</span>
                  </div>
                  <p class="text-sm font-medium">{row.app}</p>
                  <p class="text-xs text-muted-foreground truncate">{row.title}</p>
                </article>
              )}
            </For>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Today by category</CardTitle>
            <CardDescription>Quick stats card. API wiring lands in Phase 3.</CardDescription>
          </CardHeader>
          <CardContent class="text-sm space-y-3">
            <CategoryBar label="project" value="1h 50m" widthClass="w-2/3" />
            <CategoryBar label="study" value="35m" widthClass="w-1/4" />
            <CategoryBar label="entertainment" value="15m" widthClass="w-1/8" />
          </CardContent>
        </Card>
      </div>
    </section>
  )
}

function CategoryBar(props: { label: string, value: string, widthClass: string }) {
  return (
    <div class="space-y-1">
      <div class="flex items-center justify-between">
        <span class="text-xs text-muted-foreground tracking-wide uppercase">{props.label}</span>
        <span>{props.value}</span>
      </div>
      <div class="rounded-full bg-muted h-2 w-full overflow-hidden">
        <div class={`rounded-full bg-primary/80 h-full ${props.widthClass}`} />
      </div>
    </div>
  )
}
