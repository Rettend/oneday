import type { Component } from 'solid-js'
import { createMemo, Show } from 'solid-js'
import { cn } from '~/utils'

interface LevelPillProps {
  level: number
  currentXp: number
  nextLevelXp: number
  class?: string
}

export const LevelPill: Component<LevelPillProps> = (props) => {
  const clampedCurrent = createMemo(() => Math.max(0, props.currentXp))
  const clampedNext = createMemo(() => Math.max(1, props.nextLevelXp))
  const percent = createMemo(() => Math.min(100, Math.round((clampedCurrent() / clampedNext()) * 100)))

  return (
    <div
      class={cn(
        'inline-flex items-center gap-2 rounded-full ring-1 ring-border/60 bg-background/70 px-3 py-1.5 backdrop-blur-md',
        props.class,
      )}
      aria-label={`Level ${props.level}, ${clampedCurrent()} of ${clampedNext()} XP`}
    >
      <span class="i-ph-seal-check-duotone text-primary size-4" />
      <span class="text-xs font-semibold">Lvl {props.level}</span>
      <div class="ml-1 rounded-full bg-muted h-2 w-20 overflow-hidden">
        <div class="rounded-full bg-primary h-2 transition-width duration-500" style={{ width: `${percent()}%` }} />
      </div>
      <Show when={Number.isFinite(props.currentXp) && Number.isFinite(props.nextLevelXp)}>
        <span class="text-[11px] text-muted-foreground ml-1">{clampedCurrent()} / {clampedNext()} XP</span>
      </Show>
    </div>
  )
}

export default LevelPill
