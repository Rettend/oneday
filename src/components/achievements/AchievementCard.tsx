import type { Component } from 'solid-js'
import { createMemo, Show } from 'solid-js'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { cn } from '~/utils'

export type Rarity
  = | 'placeholder'
    | 'iron'
    | 'bronze'
    | 'silver'
    | 'gold'
    | 'platinum'
    | 'emerald'
    | 'diamond'
    | 'rhodal'
    | 'nummite'
    | 'spessar'

export interface AchievementCardProps {
  name: string
  description: string
  icon: string
  rarity?: Rarity
  tier?: 1 | 2 | 3 | 4 | 5
  progress?: number // 0..100
  xp?: number
  class?: string
}

function toRoman(n?: number) {
  switch (n) {
    case 1: return 'I'
    case 2: return 'II'
    case 3: return 'III'
    case 4: return 'IV'
    case 5: return 'V'
    default: return ''
  }
}

function themeFor(rarity: Rarity | undefined) {
  const r = rarity ?? 'placeholder'
  switch (r) {
    case 'iron':
      return {
        icon: 'text-zinc-500',
        frameBg: 'bg-zinc-500/15',
        shadow: 'shadow-zinc-500/30',
        ring: 'ring-zinc-500/40',
        bar: 'bg-zinc-500',
        pillText: 'text-zinc-600',
        pillBg: 'bg-zinc-500/10',
      }
    case 'bronze':
      return {
        icon: 'text-orange-700',
        frameBg: 'bg-orange-700/15',
        shadow: 'shadow-orange-700/30',
        ring: 'ring-orange-700/40',
        bar: 'bg-orange-600',
        pillText: 'text-orange-700',
        pillBg: 'bg-orange-700/10',
      }
    case 'silver':
      return {
        icon: 'text-slate-500',
        frameBg: 'bg-slate-500/15',
        shadow: 'shadow-slate-500/30',
        ring: 'ring-slate-500/40',
        bar: 'bg-slate-500',
        pillText: 'text-slate-600',
        pillBg: 'bg-slate-500/10',
      }
    case 'gold':
      return {
        icon: 'text-amber-500',
        frameBg: 'bg-amber-500/15',
        shadow: 'shadow-amber-500/30',
        ring: 'ring-amber-500/40',
        bar: 'bg-amber-500',
        pillText: 'text-amber-600',
        pillBg: 'bg-amber-500/10',
      }
    case 'platinum':
      return {
        icon: 'text-cyan-500',
        frameBg: 'bg-cyan-500/15',
        shadow: 'shadow-cyan-500/30',
        ring: 'ring-cyan-500/40',
        bar: 'bg-cyan-500',
        pillText: 'text-cyan-600',
        pillBg: 'bg-cyan-500/10',
      }
    case 'emerald':
      return {
        icon: 'text-emerald-500',
        frameBg: 'bg-emerald-500/15',
        shadow: 'shadow-emerald-500/30',
        ring: 'ring-emerald-500/40',
        bar: 'bg-emerald-500',
        pillText: 'text-emerald-600',
        pillBg: 'bg-emerald-500/10',
      }
    case 'diamond':
      return {
        icon: 'text-indigo-500',
        frameBg: 'bg-indigo-500/15',
        shadow: 'shadow-indigo-500/30',
        ring: 'ring-indigo-500/40',
        bar: 'bg-indigo-500',
        pillText: 'text-indigo-600',
        pillBg: 'bg-indigo-500/10',
      }
    case 'rhodal':
      return {
        icon: 'text-rose-600',
        frameBg: 'bg-gradient-to-br from-rose-600/20 to-rose-600/30',
        shadow: 'shadow-rose-600/30',
        ring: 'ring-rose-600/40',
        bar: 'bg-rose-600',
        pillText: 'text-rose-700',
        pillBg: 'bg-gradient-to-r from-rose-600/10 to-fuchsia-600/10',
      }
    case 'nummite':
      return {
        icon: 'text-sky-700',
        frameBg: 'bg-gradient-to-br from-neutral-700/25 to-sky-700/15',
        shadow: 'shadow-sky-700/30',
        ring: 'ring-sky-700/35',
        bar: 'bg-sky-600',
        pillText: 'text-sky-700',
        pillBg: 'bg-gradient-to-r from-neutral-900/10 to-sky-700/10',
      }
    case 'spessar':
      return {
        icon: 'text-orange-600',
        frameBg: 'bg-gradient-to-bl from-rose-600/20 to-orange-600/20',
        shadow: 'shadow-orange-600/30',
        ring: 'ring-orange-600/40',
        bar: 'bg-gradient-to-r from-orange-600 to-rose-600',
        pillText: 'text-orange-700',
        pillBg: 'bg-gradient-to-r from-orange-600/10 to-rose-600/10',
      }
    case 'placeholder':
    default:
      return {
        icon: 'text-primary',
        frameBg: 'bg-primary/15',
        shadow: 'shadow-primary/30',
        ring: 'ring-primary/40',
        bar: 'bg-primary',
        pillText: 'text-primary',
        pillBg: 'bg-primary/10',
      }
  }
}

const DiamondTierBadge: Component<{ rarity: Rarity | undefined, tier?: 1 | 2 | 3 | 4 | 5 }> = (props) => {
  const t = createMemo(() => themeFor(props.rarity))
  const label = createMemo(() => toRoman(props.tier))
  return (
    <Show when={label()}>
      <div class={cn('absolute -top-1.5 -right-1.5 size-6 rotate-45 rounded-4px border backdrop-blur-sm', t().ring, t().pillBg)}>
        <div class="flex h-full w-full items-center justify-center">
          <span class={cn('block -rotate-45 text-10px h-3 font-semibold leading-none', t().pillText)}>
            {label()}
          </span>
        </div>
      </div>
    </Show>
  )
}

export const AchievementCard: Component<AchievementCardProps> = (props) => {
  const t = createMemo(() => themeFor(props.rarity))
  const progress = createMemo(() => Math.max(0, Math.min(100, props.progress ?? 0)))

  return (
    <Card class={cn('overflow-hidden', props.class)}>
      <CardHeader class="flex flex-row gap-4 items-start">
        <div class="relative">
          <div class={`text-primary rounded-full flex size-14 shadow-inner items-center justify-center ${t().frameBg}  ${t().shadow}`}>
            <span class={cn(props.icon, 'size-8', t().icon)} />
          </div>
          <DiamondTierBadge rarity={props.rarity} tier={props.tier} />
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex gap-2 items-center justify-between">
            <CardTitle class="text-base truncate md:text-lg">{props.name}</CardTitle>
            <Show when={props.xp !== undefined}>
              <span class={cn('shrink-0 text-xs px-2 py-0.5 rounded-full', t().pillText, t().pillBg)}>+{props.xp} XP</span>
            </Show>
          </div>
          <CardDescription class="mt-1 line-clamp-2">
            {props.description}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <div class="mt-1 rounded-full bg-muted h-2 w-full overflow-hidden">
          <div class={cn('h-2 rounded-full transition-width duration-500', t().bar)} style={{ width: `${progress()}%` }} />
        </div>
        <div class="text-xs text-muted-foreground mt-2 flex items-center justify-between">
          <span>{progress()}%</span>
          <span>99/99</span>
        </div>
      </CardContent>
    </Card>
  )
}

export default AchievementCard
