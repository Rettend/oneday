import { Protected } from '@rttnd/gau/client/solid'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'

export default Protected(DashboardPage, '/')

function DashboardPage() {
  return (
    <section class="flex flex-col gap-6">
      <header class="space-y-2">
        <h1 class="text-3xl tracking-tight font-semibold">Dashboard</h1>
        <p class="text-sm text-muted-foreground">
          One view for your day: contract status, goals, and where your time is going.
        </p>
      </header>

      <Card class="border-primary/30 bg-primary/8">
        <CardHeader class="pb-3">
          <CardTitle class="text-xl flex gap-2 items-center">
            <span class="i-ph-circle-fill text-rose-500 size-3" />
            Contract incomplete
          </CardTitle>
          <CardDescription>
            1h 30m math left, 45m freelance left. Finish the contract and the rest of the day is free.
          </CardDescription>
        </CardHeader>
      </Card>

      <div class="gap-4 grid md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Today's contract</CardTitle>
            <CardDescription>Blocks and progress (placeholder until DB wiring).</CardDescription>
          </CardHeader>
          <CardContent class="space-y-3">
            <ContractRow label="Math study" progress="30 / 120 min" widthClass="w-1/4" />
            <ContractRow label="Freelance" progress="45 / 90 min" widthClass="w-1/2" />
            <ContractRow label="School project" progress="0 / 60 min" widthClass="w-0" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Live activity</CardTitle>
            <CardDescription>Current app/window from desktop tracker (Phase 2).</CardDescription>
          </CardHeader>
          <CardContent class="text-sm space-y-2">
            <p class="text-muted-foreground">Tracking not connected yet.</p>
            <p>
              Last seen:
              {' '}
              <span class="font-medium">VS Code - oneday/src/routes/dashboard.tsx</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Goals</CardTitle>
            <CardDescription>LLM-managed counters and countdowns.</CardDescription>
          </CardHeader>
          <CardContent class="text-sm space-y-2">
            <GoalRow label="Definitions" value="31 / 160" />
            <GoalRow label="Proofs reviewed" value="5 / 30" />
            <GoalRow label="Math exam" value="47 days left" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>This week</CardTitle>
            <CardDescription>Daily status snapshot.</CardDescription>
          </CardHeader>
          <CardContent>
            <div class="text-xs gap-2 grid grid-cols-7">
              <WeekDay label="Mon" complete />
              <WeekDay label="Tue" complete={false} />
              <WeekDay label="Wed" complete={false} />
              <WeekDay label="Thu" complete={false} />
              <WeekDay label="Fri" complete={false} />
              <WeekDay label="Sat" complete={false} />
              <WeekDay label="Sun" complete={false} />
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}

function ContractRow(props: { label: string, progress: string, widthClass: string }) {
  return (
    <div class="space-y-1.5">
      <div class="text-sm flex items-center justify-between">
        <span>{props.label}</span>
        <span class="text-xs text-muted-foreground">{props.progress}</span>
      </div>
      <div class="rounded-full bg-muted h-2 w-full overflow-hidden">
        <div class={`rounded-full bg-primary h-full ${props.widthClass}`} />
      </div>
    </div>
  )
}

function GoalRow(props: { label: string, value: string }) {
  return (
    <div class="text-sm flex items-center justify-between">
      <span class="text-muted-foreground">{props.label}</span>
      <span class="font-medium">{props.value}</span>
    </div>
  )
}

function WeekDay(props: { label: string, complete: boolean }) {
  return (
    <div class="p-2 border rounded-lg bg-card/70 flex flex-col gap-1 items-center">
      <span class={`rounded-full size-2.5 ${props.complete ? 'bg-emerald-500' : 'bg-rose-500'}`} />
      <span>{props.label}</span>
    </div>
  )
}
