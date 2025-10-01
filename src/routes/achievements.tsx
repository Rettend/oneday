import type { AchievementCardProps, AchievementVariant } from '~/components/achievements/AchievementCard'
import { createSignal, For } from 'solid-js'
import AchievementCard from '~/components/achievements/AchievementCard'
import LLMInput from '~/components/chat/LLMInput'
import { Collapsible, CollapsibleContent } from '~/components/ui/collapsible'

interface AchievementDefinition extends AchievementCardProps {
  id: string
  variants: AchievementVariant[]
}

const ACHIEVEMENTS: AchievementDefinition[] = [
  {
    id: 'steel-resolve',
    name: 'Steel Resolve',
    description: 'Work through a slow day without breaking.',
    icon: 'i-ph-shield-check-duotone',
    rarity: 'iron',
    tier: 1,
    xp: 40,
    variants: [
      { rarity: 'iron', title: 'Bastion Shift', requirement: 'Complete a full day on plan without snoozing timers or skipping check-ins.', xp: 4 },
      { rarity: 'bronze', title: 'Tempo Keeper', requirement: 'Chain three deep-focus blocks across two days with fewer than three context switches.', xp: 9 },
      { rarity: 'silver', title: 'Endurance Anchor', requirement: 'Keep the weekly plan intact through two surprise interrupts while logging reflections.', xp: 16 },
    ],
  },
  {
    id: 'first-steps',
    name: 'First Steps',
    description: 'Complete your first quest.',
    icon: 'i-ph-trophy-duotone',
    rarity: 'bronze',
    tier: 1,
    xp: 50,
    variants: [
      { rarity: 'iron', title: 'Boot Sequence', requirement: 'Finish your very first tracked quest run from start to finish.', xp: 3 },
      { rarity: 'bronze', title: 'Momentum Maker', requirement: 'Complete three starter quests in a single week and reflect on the wins.', xp: 5},
      { rarity: 'silver', title: 'Stride Lock', requirement: 'Maintain a five-day streak of daily quest completions.', xp: 12 },
    ],
  },
  {
    id: 'inbox-zero',
    name: 'Inbox Zero',
    description: 'Clear your inbox to zero in a day.',
    icon: 'i-ph-envelope-open-duotone',
    rarity: 'silver',
    tier: 2,
    xp: 120,
    variants: [
      { rarity: 'bronze', title: 'Inbox Warmup', requirement: 'Sweep your inbox to under twenty messages twice in one week.', xp: 8 },
      { rarity: 'silver', title: 'Zero Hour', requirement: 'Reach zero inbox and DM counts for five consecutive days.', xp: 12 },
      { rarity: 'gold', title: 'Signal Whisperer', requirement: 'Keep the inbox under ten messages for an entire workweek.', xp: 20 },
    ],
  },
  {
    id: 'deep-focus',
    name: 'Deep Focus',
    description: 'Do a 90-minute uninterrupted focus block.',
    icon: 'i-ph-brain-duotone',
    rarity: 'gold',
    tier: 1,
    xp: 150,
    variants: [
      { rarity: 'silver', title: 'Dialed In', requirement: 'Log a sixty minute deep-work block with zero context switches.', xp: 11 },
      { rarity: 'gold', title: 'Quantum Lock', requirement: 'Complete a ninety minute focus block with a written output summary.', xp: 15 },
      { rarity: 'platinum', title: 'Zen Reactor', requirement: 'Stack three deep-work blocks in a single day and capture nightly review notes.', xp: 26 },
    ],
  },
  {
    id: 'precision-ship',
    name: 'Precision Ship',
    description: 'Ship a feature with 0 regressions this week.',
    icon: 'i-ph-rocket-launch-duotone',
    rarity: 'platinum',
    tier: 3,
    xp: 220,
    variants: [
      { rarity: 'gold', title: 'Ship Shape', requirement: 'Deliver a release with at most one follow-up bug and a rollout note.', xp: 16 },
      { rarity: 'platinum', title: 'Faultless Launch', requirement: 'Launch a feature with zero regressions and an automated smoke checklist.', xp: 22 },
      { rarity: 'emerald', title: 'Meticulous Captain', requirement: 'Lead a launch retro where learnings are applied within forty-eight hours.', xp: 32 },
    ],
  },
  {
    id: 'green-roots',
    name: 'Green Roots',
    description: 'Keep a 7-day streak of daily quests.',
    icon: 'i-ph-seal-check-duotone',
    rarity: 'emerald',
    tier: 2,
    xp: 260,
    variants: [
      { rarity: 'platinum', title: 'Seedling', requirement: 'Complete daily quests for five days straight while logging energy notes.', xp: 18 },
      { rarity: 'emerald', title: 'Growth Keeper', requirement: 'Maintain a seven-day streak without missing cooldown rituals.', xp: 26 },
      { rarity: 'diamond', title: 'Evergreen', requirement: 'Extend the streak to twenty-one days with balanced rest days scheduled.', xp: 36 },
    ],
  },
  {
    id: 'prism-break',
    name: 'Prism Break',
    description: 'Finish 3 hard quests in a single day.',
    icon: 'i-ph-diamonds-four-duotone',
    rarity: 'diamond',
    tier: 4,
    xp: 340,
    variants: [
      { rarity: 'emerald', title: 'Shard Runner', requirement: 'Clear two hard quests in a day without skipping retros.', xp: 26 },
      { rarity: 'diamond', title: 'Spectrum Surge', requirement: 'Finish three hard quests in a single day and post a victory write-up.', xp: 34 },
      { rarity: 'spessar', title: 'Spectrum Master', requirement: 'Complete a full questline of hard quests in one sprint with team notes.', xp: 64 },
    ],
  },
  {
    id: 'roseglass',
    name: 'Roseglass',
    description: 'Finish with style and a tidy codebase.',
    icon: 'i-ph-palette-duotone',
    rarity: 'rhodal',
    tier: 2,
    xp: 400,
    variants: [
      { rarity: 'diamond', title: 'Clean Lines', requirement: 'Ship a feature with tidy code and linked design decisions.', xp: 32 },
      { rarity: 'rhodal', title: 'Glass Bloom', requirement: 'Wrap a project with refactors plus a brag doc entry.', xp: 40 },
      { rarity: 'nummite', title: 'Prismatic Artisan', requirement: 'Mentor another teammate through the same polish cycle successfully.', xp: 52 },
    ],
  },
  {
    id: 'dark-matter',
    name: 'Dark Matter',
    description: 'Crush a blocker you\'ve postponed for weeks.',
    icon: 'i-ph-moon-duotone',
    rarity: 'nummite',
    tier: 1,
    xp: 500,
    variants: [
      { rarity: 'platinum', title: 'Gravity Assist', requirement: 'Resolve a blocker that lingered for more than a week and document the fix.', xp: 28 },
      { rarity: 'nummite', title: 'Void Breaker', requirement: 'Crush a blocker that delayed a launch for a full month.', xp: 50 },
      { rarity: 'spessar', title: 'Singularity Runner', requirement: 'Teach the team how to prevent the blocker from returning.', xp: 72 },
    ],
  },
  {
    id: 'hot-streak',
    name: 'Hot Streak',
    description: 'Deliver wins four days in a row.',
    icon: 'i-ph-fire-duotone',
    rarity: 'spessar',
    tier: 64,
    xp: 640,
    variants: [
      { rarity: 'rhodal', title: 'Warm Up', requirement: 'Deliver wins three days in a row across two quest categories.', xp: 42 },
      { rarity: 'nummite', title: 'In The Zone', requirement: 'Maintain the streak for a full workweek while logging sleep stats.', xp: 56 },
      { rarity: 'spessar', title: 'Combustion Rail', requirement: 'Keep wins rolling for ten days without missing retros or recovery.', xp: 64 },
    ],
  },
  {
    id: 'placeholder',
    name: 'Placeholder',
    description: 'Preview card with default rarity.',
    icon: 'i-ph-sparkle-duotone',
    xp: 90,
    variants: [
      { rarity: 'placeholder', title: 'Concept Mode', requirement: 'Draft an achievement idea with an LLM prompt and jot acceptance criteria.', xp: 3 },
      { rarity: 'iron', title: 'Prototype', requirement: 'Test the prototype behaviour for three consecutive days.', xp: 6 },
      { rarity: 'bronze', title: 'Lock It In', requirement: 'Convert the prototype into a tracked questline with metrics.', xp: 11 },
    ],
  },
]

export default function Achievements() {
  const [openId, setOpenId] = createSignal<string | null>(null)

  function handleSendLLMContext(message: string) {
    console.log('[LLM Context]', message)
  }

  function handleAccept(name: string) {
    console.log('[Achievement] accepted', name)
  }

  function handleReject(name: string) {
    console.log('[Achievement] rejected', name)
  }

  function setOpen(id: string, value: boolean) {
    setOpenId(value ? id : null)
  }

  function toggleOpen(id: string) {
    setOpenId(prev => prev === id ? null : id)
  }

  function isOpen(id: string) {
    return openId() === id
  }

  return (
    <section class="flex flex-col gap-4 relative">
      <header class="flex items-center justify-between">
        <h1 class="text-2xl tracking-tight font-semibold">Achievements</h1>
        <div class="text-xs text-muted-foreground">Choose achievements to add</div>
      </header>
      <div class="gap-4 grid grid-cols-[repeat(auto-fit,minmax(400px,1fr))] items-start">
        <For each={ACHIEVEMENTS}>
          {(item) => {
            const detailsId = `${item.id}-details`
            const open = () => isOpen(detailsId)
            return (
              <Collapsible
                open={open()}
                onOpenChange={value => setOpen(detailsId, value)}
                class="self-start"
              >
                <AchievementCard
                  name={item.name}
                  description={item.description}
                  icon={item.icon}
                  rarity={item.rarity}
                  tier={item.tier}
                  xp={item.xp}
                  class="flex flex-col self-start"
                >
                  <AchievementCard.Header />
                  <AchievementCard.Actions
                    onAccept={() => handleAccept(item.name)}
                    onReject={() => handleReject(item.name)}
                    onToggleDetails={() => toggleOpen(detailsId)}
                    detailsOpen={open()}
                    detailsId={detailsId}
                  />
                  <CollapsibleContent id={detailsId} class="mt-0">
                    <AchievementCard.Details variants={item.variants} class="pt-0" />
                  </CollapsibleContent>
                </AchievementCard>
              </Collapsible>
            )
          }}
        </For>
      </div>

      <div class="h-28" />
      <LLMInput onSend={handleSendLLMContext} />
    </section>
  )
}
