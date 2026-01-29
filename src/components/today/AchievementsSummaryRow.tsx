import type { Component } from 'solid-js'
import type { AchievementCardProps } from '~/components/achievements/AchievementCard'
import { createMemo, For } from 'solid-js'
import AchievementCard from '~/components/achievements/AchievementCard'
import { A } from '~/router'

interface AchievementsSummaryRowProps {
  items: AchievementCardProps[]
  limit?: number
  class?: string
}

export const AchievementsSummaryRow: Component<AchievementsSummaryRowProps> = (props) => {
  const sorted = createMemo(() => {
    const arr = (props.items || []).slice()
    return arr.sort((a, b) => (b.progress ?? 0) - (a.progress ?? 0))
  })
  const limited = createMemo(() => sorted().slice(0, props.limit ?? 6))

  return (
    <section class={props.class} aria-label="Achievements in progress">
      <header class="flex min-h-10 items-center justify-between">
        <h2 class="text-sm tracking-tight font-semibold">In-progress achievements</h2>
        <A href="/q/achievements/progress" class="text-xs text-primary hover:text-primary/80">View all</A>
      </header>
      <div class="mt-1 pr-1 flex flex-col gap-3 max-h-96 overflow-y-auto">
        <For each={limited()}>
          {a => (
            <AchievementCard
              name={a.name}
              description={a.description}
              icon={a.icon}
              rarity={a.rarity}
              tier={a.tier}
              progress={a.progress}
              xp={a.xp}
              class="min-h-fit w-full"
            >
              <AchievementCard.Header />
              <AchievementCard.Progress />
            </AchievementCard>
          )}
        </For>
      </div>
    </section>
  )
}

export default AchievementsSummaryRow
