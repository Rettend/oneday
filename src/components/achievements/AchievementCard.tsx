import type { Accessor, Component, JSX, ParentComponent } from 'solid-js'
import { createContext, createMemo, For, Show, useContext } from 'solid-js'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '~/components/ui/card'
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
  children?: JSX.Element
}

export interface AchievementVariant {
  rarity: Rarity
  title: string
  requirement: string
  xp?: number
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

function formatRarity(rarity: Rarity | undefined): string {
  if (!rarity || rarity === 'placeholder')
    return ''
  return rarity.charAt(0).toUpperCase() + rarity.slice(1)
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
        pillText: 'text-zinc-400',
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
        pillText: 'text-slate-400',
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
        pillText: 'text-indigo-500',
        pillBg: 'bg-indigo-500/10',
      }
    case 'rhodal':
      return {
        icon: 'text-rose-600',
        frameBg: 'bg-gradient-to-br from-rose-600/20 to-rose-600/30',
        shadow: 'shadow-rose-600/30',
        ring: 'ring-rose-600/40',
        bar: 'bg-rose-600',
        pillText: 'text-rose-600',
        pillBg: 'bg-gradient-to-r from-rose-600/10 to-fuchsia-600/10',
      }
    case 'nummite':
      return {
        icon: 'text-sky-700',
        frameBg: 'bg-gradient-to-br from-neutral-700/25 to-sky-700/15',
        shadow: 'shadow-sky-700/30',
        ring: 'ring-sky-700/35',
        bar: 'bg-sky-600',
        pillText: 'text-sky-600',
        pillBg: 'bg-gradient-to-r from-neutral-900/10 to-sky-700/10',
      }
    case 'spessar':
      return {
        icon: 'text-orange-600',
        frameBg: 'bg-gradient-to-bl from-rose-600/20 to-orange-600/20',
        shadow: 'shadow-orange-600/30',
        ring: 'ring-orange-600/40',
        bar: 'bg-gradient-to-r from-orange-600 to-rose-600',
        pillText: 'text-orange-600',
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

const AchievementCardContext = createContext<{
  name: Accessor<string>
  description: Accessor<string>
  icon: Accessor<string>
  rarity: Accessor<Rarity | undefined>
  tier: Accessor<1 | 2 | 3 | 4 | 5 | undefined>
  xp: Accessor<number | undefined>
  progress: Accessor<number | undefined>
  theme: Accessor<ReturnType<typeof themeFor>>
} | null>(null)

function useAchievementCardContext() {
  const ctx = useContext(AchievementCardContext)
  if (!ctx)
    throw new Error('AchievementCard subcomponents must be used within <AchievementCard>')
  return ctx
}

const DiamondTierBadge: Component<{ rarity: Rarity | undefined, tier?: 1 | 2 | 3 | 4 | 5 }> = (props) => {
  const t = createMemo(() => themeFor(props.rarity))
  const label = createMemo(() => toRoman(props.tier))
  return (
    <Show when={label()}>
      <div class={cn('absolute -top-1.5 -right-1.5 size-6 rotate-45 rounded-4px border backdrop-blur-sm', t().ring, t().pillBg)}>
        <div class="flex h-full w-full items-center justify-center">
          <span class={cn('block -rotate-45 text-sm h-3 font-semibold leading-none', t().pillText)}>
            {label()}
          </span>
        </div>
      </div>
    </Show>
  )
}

const AchievementCardRoot: ParentComponent<AchievementCardProps> = (props) => {
  const theme = createMemo(() => themeFor(props.rarity))
  const progress = createMemo(() => props.progress)
  const context = {
    name: () => props.name,
    description: () => props.description,
    icon: () => props.icon,
    rarity: () => props.rarity,
    tier: () => props.tier,
    xp: () => props.xp,
    progress,
    theme,
  }

  return (
    <AchievementCardContext.Provider value={context}>
      <Card class={cn('overflow-hidden min-w-100 bg-card/60', props.class)}>
        {props.children}
      </Card>
    </AchievementCardContext.Provider>
  )
}

interface AchievementCardHeaderProps {
  description?: string
  aside?: JSX.Element
  class?: string
  children?: JSX.Element
}

const AchievementCardHeader: Component<AchievementCardHeaderProps> = (props) => {
  const ctx = useAchievementCardContext()
  const t = ctx.theme
  const rarity = createMemo(() => formatRarity(ctx.rarity()))
  const description = createMemo(() => props.children ?? props.description ?? ctx.description())

  return (
    <CardHeader class={cn('flex flex-row gap-4 items-start', props.class)}>
      <div class="relative">
        <div class={cn('rounded-full flex size-14 shadow-inner items-center justify-center', t().frameBg, t().shadow)}>
          <span class={cn(ctx.icon(), 'size-8', t().icon)} />
        </div>
        <DiamondTierBadge rarity={ctx.rarity()} tier={ctx.tier()} />
      </div>
      <div class="flex-1 min-w-0">
        <div class="flex gap-2 items-center justify-between">
          <CardTitle class="text-base truncate md:text-lg">{ctx.name()}</CardTitle>
          <Show
            when={props.aside}
            fallback={(
              <div class="flex shrink-0 gap-1.5 items-center">
                <Show when={rarity()}>
                  <span class={cn('text-xs px-2 py-0.5 rounded-full font-medium', t().pillText, t().pillBg)}>
                    {rarity()}
                  </span>
                </Show>
                <Show when={ctx.xp() !== undefined}>
                  <span class={cn('text-xs px-2 py-0.5 rounded-full', t().pillText, t().pillBg)}>+{ctx.xp()} XP</span>
                </Show>
              </div>
            )}
          >
            {props.aside}
          </Show>
        </div>
        <Show when={description()}>
          <CardDescription class="mt-1">
            {description()}
          </CardDescription>
        </Show>
      </div>
    </CardHeader>
  )
}

interface AchievementCardProgressProps {
  value?: number
  label?: JSX.Element | string
  hint?: JSX.Element | string
  class?: string
}

const AchievementCardProgress: Component<AchievementCardProgressProps> = (props) => {
  const ctx = useAchievementCardContext()
  const t = ctx.theme
  const percent = createMemo(() => {
    const raw = props.value ?? ctx.progress()
    if (raw === undefined || raw === null)
      return undefined
    const value = Number(raw)
    if (Number.isNaN(value))
      return undefined
    return Math.max(0, Math.min(100, value))
  })
  const hasPercent = createMemo(() => percent() !== undefined)

  return (
    <Show when={hasPercent()}>
      <CardContent class={cn('pt-0', props.class)}>
        <div class="mt-1 rounded-full bg-muted h-2 w-full overflow-hidden">
          <div class={cn('h-2 rounded-full transition-width duration-500', t().bar)} style={{ width: `${percent() ?? 0}%` }} />
        </div>
        <div class="text-xs text-muted-foreground mt-2 flex items-center justify-between">
          <span>{props.label ?? `${percent() ?? 0}%`}</span>
          <Show
            when={props.hint}
            fallback={(
              <Show when={ctx.xp() !== undefined}>
                <span>+{ctx.xp()} XP</span>
              </Show>
            )}
          >
            {props.hint}
          </Show>
        </div>
      </CardContent>
    </Show>
  )
}

interface AchievementCardDetailsProps {
  variants: AchievementVariant[]
  class?: string
}

const AchievementCardDetails: Component<AchievementCardDetailsProps> = (props) => {
  return (
    <CardContent class={cn('flex flex-col gap-4', props.class)}>
      <div class="text-xs text-muted-foreground tracking-wide font-semibold uppercase">
        Variants
      </div>
      <div class="flex flex-col gap-2">
        <For each={props.variants}>
          {(variant) => {
            const variantTheme = themeFor(variant.rarity)
            return (
              <div
                class={cn(
                  'rounded-xl border border-border/70 bg-background/80 px-4 py-3 backdrop-blur-sm',
                )}
              >
                <div class="flex flex-col gap-1">
                  <div class="flex gap-2 items-center">
                    <span class="text-base text-primary font-bold">{variant.title}</span>
                    <div class="ml-auto inline-flex gap-1.5 items-center">
                      <span class={cn('text-xs px-2 py-0.5 rounded-full font-medium', variantTheme.pillText, variantTheme.pillBg)}>
                        {formatRarity(variant.rarity) || 'Variant'}
                      </span>
                      <Show when={variant.xp !== undefined}>
                        <span class={cn('text-xs px-2 py-0.5 rounded-full font-medium', variantTheme.pillText, variantTheme.pillBg)}>+{variant.xp}% XP</span>
                      </Show>
                    </div>
                  </div>
                  <p class="text-sm text-muted-foreground leading-relaxed">
                    {variant.requirement}
                  </p>
                </div>
              </div>
            )
          }}
        </For>
      </div>
    </CardContent>
  )
}

interface AchievementCardActionsProps {
  onAccept?: () => void
  onReject?: () => void
  onToggleDetails?: () => void
  detailsOpen?: boolean
  acceptLabel?: string
  rejectLabel?: string
  detailsLabel?: string
  detailsId?: string
  class?: string
}

const AchievementCardActions: Component<AchievementCardActionsProps> = (props) => {
  return (
    <CardFooter class={cn('flex flex-wrap items-center gap-2 p-3 pt-0', props.class)}>
      <div class="rounded-full bg-background/50 inline-flex ring-1 ring-border/60 overflow-hidden backdrop-blur-md">
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={props.onAccept}
          disabled={!props.onAccept}
          class="text-xs text-primary font-medium px-3 rounded-none bg-background/40 h-8 hover:bg-primary/10"
        >
          <span class="i-ph-check-bold size-4" />
          {props.acceptLabel ?? 'Accept'}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={props.onReject}
          disabled={!props.onReject}
          class="text-xs text-primary font-medium px-3 rounded-none bg-background/40 h-8 hover:bg-primary/10"
        >
          <span class="i-ph-x-bold size-4" />
          {props.rejectLabel ?? 'Reject'}
        </Button>
      </div>

      <Show when={props.onToggleDetails}>
        <Button
          type="button"
          size="sm"
          variant="invisible"
          onClick={props.onToggleDetails}
          aria-expanded={props.detailsOpen ?? false}
          aria-controls={props.detailsId}
          class={cn(
            'ml-auto inline-flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80',
            props.detailsOpen ? 'data-[open]:text-primary' : '',
          )}
        >
          <span>Details</span>
          <span
            aria-hidden="true"
            class={cn('inline-flex items-center justify-center i-ph-caret-down-duotone size-3.5 transition-transform duration-200', props.detailsOpen ? 'rotate-180' : '')}
          />
        </Button>
      </Show>
    </CardFooter>
  )
}

const AchievementCard = Object.assign(AchievementCardRoot, {
  Header: AchievementCardHeader,
  Progress: AchievementCardProgress,
  Details: AchievementCardDetails,
  Actions: AchievementCardActions,
})

export { AchievementCard, AchievementCardActions, AchievementCardDetails, AchievementCardHeader, AchievementCardProgress }
export default AchievementCard
