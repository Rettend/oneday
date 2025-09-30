import type { AchievementCardProps } from '~/components/achievements/AchievementCard'
import { For } from 'solid-js'
import AchievementCard from '~/components/achievements/AchievementCard'
import LLMInput from '~/components/chat/LLMInput'

export default function Achievements() {
  const items: AchievementCardProps[] = [
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
  ]

  function handleSendLLMContext(message: string) {
    console.log('[LLM Context]', message)
  }

  return (
    <section class="flex flex-col gap-4 relative">
      <header class="flex items-center justify-between">
        <h1 class="text-2xl tracking-tight font-semibold">Achievements</h1>
        <div class="text-xs text-muted-foreground">Choose achievements to add • give the LLM more context below</div>
      </header>

      <div class="gap-4 grid lg:grid-cols-3 sm:grid-cols-2 xl:grid-cols-4">
        <For each={items}>
          {a => (
            <AchievementCard
              name={a.name}
              description={a.description}
              icon={a.icon}
              rarity={a.rarity}
              tier={a.tier}
              progress={a.progress}
              xp={a.xp}
            />
          )}
        </For>
      </div>

      <div class="h-28" />
      <LLMInput onSend={handleSendLLMContext} />
    </section>
  )
}
