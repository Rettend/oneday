import type { AchievementCardProps } from '~/components/achievements/AchievementCard'
import type { DeadlineChipProps } from '~/components/todo/DeadlineChip'
import { Protected } from '@rttnd/gau/client/solid'
import { createMemo, For } from 'solid-js'
import AchievementsSummaryRow from '~/components/today/AchievementsSummaryRow'
import DeadlineChip from '~/components/todo/DeadlineChip'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'

export default Protected(TodayPage, '/')

function TodayPage() {
  const achievements = createMemo<AchievementCardProps[]>(() => ([
    { name: 'Steel Resolve', description: 'Work through a slow day without breaking.', icon: 'i-ph-shield-check-duotone', rarity: 'iron', tier: 1, progress: 40, xp: 40 },
    { name: 'First Steps', description: 'Complete your first quest.', icon: 'i-ph-trophy-duotone', rarity: 'bronze', tier: 1, progress: 20, xp: 50 },
    { name: 'Inbox Zero', description: 'Clear your inbox to zero in a day.', icon: 'i-ph-envelope-open-duotone', rarity: 'silver', tier: 2, progress: 60, xp: 120 },
    { name: 'Deep Focus', description: 'Do a 90-minute uninterrupted focus block.', icon: 'i-ph-brain-duotone', rarity: 'gold', tier: 1, progress: 45, xp: 150 },
    { name: 'Precision Ship', description: 'Ship a feature with 0 regressions this week.', icon: 'i-ph-rocket-launch-duotone', rarity: 'platinum', tier: 3, progress: 10, xp: 220 },
    { name: 'Green Roots', description: 'Keep a 7-day streak of daily quests.', icon: 'i-ph-seal-check-duotone', rarity: 'emerald', tier: 2, progress: 70, xp: 260 },
    { name: 'Prism Break', description: 'Finish 3 hard quests in a single day.', icon: 'i-ph-diamonds-four-duotone', rarity: 'diamond', tier: 4, progress: 30, xp: 340 },
    { name: 'Roseglass', description: 'Finish with style and a tidy codebase.', icon: 'i-ph-palette-duotone', rarity: 'rhodal', tier: 2, progress: 25, xp: 400 },
    { name: 'Dark Matter', description: 'Crush a blocker you\'ve postponed for weeks.', icon: 'i-ph-moon-duotone', rarity: 'nummite', tier: 1, progress: 50, xp: 500 },
    { name: 'Hot Streak', description: 'Deliver wins four days in a row.', icon: 'i-ph-fire-duotone', rarity: 'spessar', tier: 5, progress: 85, xp: 640 },
    { name: 'Placeholder', description: 'Preview card with default rarity.', icon: 'i-ph-sparkle-duotone', progress: 55, xp: 90 },
  ]))

  const deadlines = createMemo<DeadlineChipProps[]>(() => ([
    { type: 'hard', label: 'Release v0.1', date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000) },
    { type: 'soft', label: 'Refactor auth', date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) },
    { type: 'soft', label: 'Design review', date: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000) },
    { type: 'hard', label: 'Tax filing', date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) },
  ]))

  return (
    <section class="flex flex-col gap-4">
      <header class="flex gap-3 items-center justify-between">
        <h1 class="text-2xl tracking-tight font-semibold">Today</h1>
        <Button class="bg-primary" variant="default">
          Generate quests
        </Button>
      </header>
      <div class="py-1 flex gap-2 items-center overflow-x-auto">
        <For each={deadlines()}>
          {d => (
            <DeadlineChip type={d.type} label={d.label} date={d.date} />
          )}
        </For>
      </div>

      <div class="gap-4 grid md:grid-cols-2">
        <div class="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle class="text-base">Dailies</CardTitle>
            </CardHeader>
            <CardContent>
              <div class="text-sm text-muted-foreground">Checklist placeholder</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle class="text-base">Todo Outline</CardTitle>
            </CardHeader>
            <CardContent>
              <div class="text-sm text-muted-foreground">Outline/Tree placeholder</div>
            </CardContent>
          </Card>
        </div>

        <div class="space-y-4">
          <AchievementsSummaryRow items={achievements()} limit={6} />
          <Card>
            <CardHeader>
              <CardTitle class="text-base">Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div class="text-sm text-muted-foreground">Live timeline placeholder</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle class="text-base">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div class="text-sm text-muted-foreground">Charts placeholder</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle class="text-base">Budgets</CardTitle>
            </CardHeader>
            <CardContent>
              <div class="text-sm text-muted-foreground">Leisure meters placeholder</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
