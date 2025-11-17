import type { Component } from 'solid-js'
import type { Path } from '~/router'
import { createMemo, Show } from 'solid-js'
import { Button } from '~/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover'
import { A } from '~/router'
import { cn } from '~/utils'

interface LevelPillProps {
  level: number
  currentXp: number
  nextLevelXp: number
  class?: string
  href?: Path
  forceIconMode?: boolean
}

export const LevelPill: Component<LevelPillProps> = (props) => {
  const clampedCurrent = createMemo(() => Math.max(0, props.currentXp))
  const clampedNext = createMemo(() => Math.max(1, props.nextLevelXp))
  const percent = createMemo(() => Math.min(100, Math.round((clampedCurrent() / clampedNext()) * 100)))

  const showIconMode = createMemo(() => props.forceIconMode || false)
  const containerClass = createMemo(() => cn(showIconMode() ? 'inline-flex items-center justify-center' : 'w-full', props.class))

  return (
    <div class={containerClass()}>
      <Show when={!showIconMode()}>
        <div class="w-full hidden lg:inline-flex">
          {props.href
            ? (
                <A href={props.href} aria-label={`Level ${props.level}, ${clampedCurrent()} of ${clampedNext()} XP`} class="w-full">
                  <div class={cn('inline-flex flex-col w-full gap-2 rounded-lg ring-1 ring-border/60 bg-background/70 px-2 py-1.5 backdrop-blur-md')}>
                    <div class="flex w-full justify-between">
                      <span class="text-xs font-semibold">Lvl {props.level}</span>
                      <Show when={Number.isFinite(props.currentXp) && Number.isFinite(props.nextLevelXp)}>
                        <span class="text-[11px] text-muted-foreground ml-1">{clampedCurrent()} / {clampedNext()} XP</span>
                      </Show>
                    </div>
                    <div class="rounded-full bg-muted h-2 w-full overflow-hidden">
                      <div class="rounded-full bg-primary h-2 transition-width duration-500" style={{ width: `${percent()}%` }} />
                    </div>
                  </div>
                </A>
              )
            : (
                <div aria-label={`Level ${props.level}, ${clampedCurrent()} of ${clampedNext()} XP`} class={cn('inline-flex flex-col w-full gap-2 rounded-lg ring-1 ring-border/60 bg-background/70 px-2 py-1.5 backdrop-blur-md')}>
                  <div class="flex w-full justify-between">
                    <span class="text-xs font-semibold">Lvl {props.level}</span>
                    <Show when={Number.isFinite(props.currentXp) && Number.isFinite(props.nextLevelXp)}>
                      <span class="text-[11px] text-muted-foreground ml-1">{clampedCurrent()} / {clampedNext()} XP</span>
                    </Show>
                  </div>
                  <div class="rounded-full bg-muted h-2 w-full overflow-hidden">
                    <div class="rounded-full bg-primary h-2 transition-width duration-500" style={{ width: `${percent()}%` }} />
                  </div>
                </div>
              )}
        </div>
      </Show>

      <div class={cn('flex items-center justify-center', showIconMode() ? 'inline-flex' : 'lg:hidden')}>
        <Popover>
          <PopoverTrigger
            as={Button}
            type="button"
            size="icon"
            variant="ghost"
            class="shrink-0 size-12"
          >
            <span class="i-ph-medal-duotone text-foreground/80 size-7 hover:text-foreground/100" />
          </PopoverTrigger>
          <PopoverContent class="p-3 w-64">
            <div class="flex flex-col gap-2">
              <div class="flex items-center justify-between">
                <span class="text-xs font-semibold">Level {props.level}</span>
                <Show when={Number.isFinite(props.currentXp) && Number.isFinite(props.nextLevelXp)}>
                  <span class="text-xs text-muted-foreground">{clampedCurrent()} / {clampedNext()} XP</span>
                </Show>
              </div>
              <div class="rounded-full bg-muted h-2 w-full overflow-hidden">
                <div class="rounded-full bg-primary h-2 transition-width duration-500" style={{ width: `${percent()}%` }} />
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}

export default LevelPill
