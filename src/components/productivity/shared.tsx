import type { ActivityCategorySummary } from '~/lib/productivity'
import { For, Show } from 'solid-js'
import { getCategoryColor, getCategoryIcon, getCategoryStyle } from '~/lib/categories'
import { formatMinutes } from '~/lib/productivity'

export function CategoryBar(props: {
  categories: ActivityCategorySummary[]
  totalMinutes: number
  showLabels?: boolean
  height?: string
  class?: string
}) {
  const showLabels = () => props.showLabels !== false
  const height = () => props.height ?? 'h-3'

  return (
    <div class={`flex flex-col gap-2 ${props.class ?? ''}`}>
      {/* Stacked bar */}
      <div class={`${height()} rounded-full bg-muted/50 flex w-full overflow-hidden`}>
        <For each={props.categories}>
          {(item) => {
            const pct = () => props.totalMinutes > 0
              ? Math.max(1, Math.round((item.minutes / props.totalMinutes) * 100))
              : 0
            return (
              <div
                class="h-full transition-all duration-500 first:rounded-l-full last:rounded-r-full"
                style={{
                  'width': `${pct()}%`,
                  'background-color': getCategoryColor(item.category),
                  'min-width': pct() > 0 ? '4px' : '0',
                }}
                title={`${getCategoryStyle(item.category).label}: ${formatMinutes(item.minutes)}`}
              />
            )
          }}
        </For>
      </div>

      {/* Legend */}
      <Show when={showLabels()}>
        <div class="flex flex-wrap gap-x-4 gap-y-1">
          <For each={props.categories}>
            {item => (
              <span class="text-xs flex gap-1.5 items-center">
                <span
                  class={`${getCategoryIcon(item.category)} size-3.5`}
                  style={{ color: getCategoryColor(item.category) }}
                />
                <span class="text-muted-foreground">{getCategoryStyle(item.category).label}</span>
                <span class="font-medium">{formatMinutes(item.minutes)}</span>
              </span>
            )}
          </For>
        </div>
      </Show>
    </div>
  )
}

export function ProgressRow(props: {
  label: string
  value: string
  percentage?: number
  done?: boolean
  icon?: string
  iconColor?: string
  class?: string
}) {
  return (
    <div class={`space-y-1.5 ${props.class ?? ''}`}>
      <div class="text-sm flex items-center justify-between">
        <span class="flex gap-2 min-w-0 items-center">
          <Show when={props.icon}>
            <span
              class={`${props.icon} shrink-0 size-4`}
              style={props.iconColor ? { color: props.iconColor } : undefined}
            />
          </Show>
          <Show when={props.done !== undefined}>
            <span class={`rounded-full shrink-0 size-2 ${props.done ? 'bg-emerald-400' : 'bg-rose-400'}`} />
          </Show>
          <span class="truncate">{props.label}</span>
        </span>
        <span class="text-xs text-muted-foreground ml-2 shrink-0">{props.value}</span>
      </div>
      <Show when={props.percentage !== undefined}>
        <div class="rounded-full bg-muted/60 h-1.5 w-full overflow-hidden">
          <div
            class="rounded-full h-full transition-all duration-500"
            style={{
              'width': `${Math.max(0, Math.min(100, props.percentage ?? 0))}%`,
              'background-color': props.iconColor ?? (props.done ? '#34d399' : 'oklch(var(--primary))'),
            }}
          />
        </div>
      </Show>
    </div>
  )
}

export function CategoryChip(props: { category: string, class?: string }) {
  const style = () => getCategoryStyle(props.category)

  return (
    <span
      class={`text-xs px-2.5 py-1 rounded-full inline-flex gap-1.5 items-center ${props.class ?? ''}`}
      style={{
        'background-color': `${getCategoryColor(props.category)}18`,
        'color': getCategoryColor(props.category),
      }}
    >
      <span class={`${style().icon} size-3.5`} />
      {style().label}
    </span>
  )
}
