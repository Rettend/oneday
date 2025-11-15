import type { AchievementCardProps, Rarity } from '~/components/achievements/AchievementCard'
import { createMemo, createSignal, For } from 'solid-js'
import AchievementCard from '~/components/achievements/AchievementCard'
import { Button } from '~/components/ui/button'
import { AchievementsLayout } from './(achievements)'

type SortKey = 'rarity' | 'xp' | 'progress'
type SortDir = 'asc' | 'desc'

const RARITY_ORDER: Rarity[] = ['iron', 'bronze', 'silver', 'gold', 'platinum', 'emerald', 'diamond', 'rhodal', 'nummite', 'spessar']
function rarityRank(r?: Rarity) {
  if (!r)
    return 0
  const idx = RARITY_ORDER.indexOf(r)
  return idx === -1 ? 0 : idx
}

const SAMPLE: AchievementCardProps[] = [
  { name: 'Steel Resolve', description: 'Work through a slow day without breaking.', icon: 'i-ph-shield-check-duotone', rarity: 'iron', tier: 1, progress: 40, xp: 40 },
  { name: 'First Steps', description: 'Complete your first quest.', icon: 'i-ph-trophy-duotone', rarity: 'bronze', tier: 1, progress: 20, xp: 50 },
  { name: 'Inbox Zero', description: 'Clear your inbox to zero in a day.', icon: 'i-ph-envelope-open-duotone', rarity: 'silver', tier: 2, progress: 60, xp: 120 },
  { name: 'Deep Focus', description: 'Do a 90-minute uninterrupted focus block.', icon: 'i-ph-brain-duotone', rarity: 'gold', tier: 1, progress: 45, xp: 150 },
  { name: 'Precision Ship', description: 'Ship a feature with 0 regressions this week.', icon: 'i-ph-rocket-launch-duotone', rarity: 'platinum', tier: 3, progress: 10, xp: 220 },
  { name: 'Green Roots', description: 'Keep a 7-day streak of daily quests.', icon: 'i-ph-seal-check-duotone', rarity: 'emerald', tier: 2, progress: 70, xp: 260 },
  { name: 'Prism Break', description: 'Finish 3 hard quests in a single day.', icon: 'i-ph-diamonds-four-duotone', rarity: 'diamond', tier: 4, progress: 30, xp: 340 },
  { name: 'Roseglass', description: 'Finish with style and a tidy codebase.', icon: 'i-ph-palette-duotone', rarity: 'rhodal', tier: 2, progress: 25, xp: 400 },
  { name: 'Dark Matter', description: 'Crush a blocker you\'ve postponed for weeks.', icon: 'i-ph-moon-duotone', rarity: 'nummite', tier: 1, progress: 50, xp: 500 },
  { name: 'Hot Streak', description: 'Deliver wins four days in a row.', icon: 'i-ph-fire-duotone', rarity: 'spessar', tier: 6, progress: 85, xp: 640 },
]

export default function AchievementsProgress() {
  const [sort, setSort] = createSignal<SortKey>('progress')
  const [rarityFilter, setRarityFilter] = createSignal<Rarity | 'all'>('all')
  const [dir, setDir] = createSignal<SortDir>('desc')

  function toggleSortDir() {
    setDir(prev => (prev === 'asc' ? 'desc' : 'asc'))
  }

  function sortTuple(key: SortKey, item: AchievementCardProps): number[] {
    switch (key) {
      case 'rarity':
        return [rarityRank(item.rarity), item.tier ?? 0, item.xp ?? 0]
      case 'xp':
        return [item.xp ?? 0, rarityRank(item.rarity), item.tier ?? 0]
      case 'progress':
      default:
        return [item.progress ?? 0, rarityRank(item.rarity), item.tier ?? 0]
    }
  }

  function compareTuples(a: number[], b: number[]): number {
    const len = Math.max(a.length, b.length)
    for (let i = 0; i < len; i++) {
      const av = a[i] ?? 0
      const bv = b[i] ?? 0
      if (av !== bv)
        return av - bv
    }
    return 0
  }

  const data = createMemo(() => {
    const sortKey = sort()
    const direction = dir()
    const filter = rarityFilter()
    const items = SAMPLE.slice()
    const filtered = filter === 'all' ? items : items.filter(i => i.rarity === filter)
    const cmp = (a: AchievementCardProps, b: AchievementCardProps) => {
      const base = compareTuples(sortTuple(sortKey, a), sortTuple(sortKey, b))
      return direction === 'asc' ? base : -base
    }
    return filtered.sort(cmp)
  })

  return (
    <AchievementsLayout>
      <div class="flex flex-col gap-4">
        <div class="flex flex-wrap gap-2 min-h-12 items-center">
          <div class="rounded-full bg-background/50 inline-flex ring-1 ring-border/60 overflow-hidden backdrop-blur-md">
            <button class={`text-xs px-3 py-1.5 ${sort() === 'progress' ? 'text-primary bg-primary/10' : 'text-foreground/80 hover:text-foreground'}`} onClick={() => setSort('progress')}>Progress</button>
            <button class={`text-xs px-3 py-1.5 ${sort() === 'rarity' ? 'text-primary bg-primary/10' : 'text-foreground/80 hover:text-foreground'}`} onClick={() => setSort('rarity')}>Rarity</button>
            <button class={`text-xs px-3 py-1.5 ${sort() === 'xp' ? 'text-primary bg-primary/10' : 'text-foreground/80 hover:text-foreground'}`} onClick={() => setSort('xp')}>XP</button>
          </div>
          <Button
            type="button"
            size="icon"
            variant="muted"
            aria-label={`Toggle sort direction (${dir()})`}
            onClick={toggleSortDir}
            title={dir() === 'asc' ? 'Ascending' : 'Descending'}
          >
            <span class={`${dir() === 'asc' ? 'i-ph-arrow-up-duotone' : 'i-ph-arrow-down-duotone'} size-5`} />
          </Button>
          <div class="ml-auto inline-flex gap-1 items-center">
            <span class="text-xs text-muted-foreground">Rarity:</span>
            <select
              class="text-xs px-2 py-1 rounded-md bg-background/70 ring-1 ring-border/60"
              value={rarityFilter()}
              onChange={e => setRarityFilter(e.currentTarget.value as Rarity | 'all')}
            >
              <option value="all">All</option>
              <For each={RARITY_ORDER}>
                {r => (
                  <option value={r}>{r}</option>
                )}
              </For>
            </select>
          </div>
        </div>

        <div class="gap-4 grid grid-cols-[repeat(auto-fit,minmax(400px,1fr))] items-start">
          <For each={data()}>
            {a => (
              <AchievementCard
                name={a.name}
                description={a.description}
                icon={a.icon}
                rarity={a.rarity}
                tier={a.tier}
                progress={a.progress}
                xp={a.xp}
              >
                <AchievementCard.Header />
                <AchievementCard.Progress />
              </AchievementCard>
            )}
          </For>
        </div>
      </div>
    </AchievementsLayout>
  )
}
