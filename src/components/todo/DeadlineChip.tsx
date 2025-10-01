import type { Component } from 'solid-js'
import { createMemo } from 'solid-js'
import { cn } from '~/utils'

type DeadlineType = 'hard' | 'soft'

export interface DeadlineChipProps {
  type: DeadlineType
  label: string
  date: string | Date
  class?: string
  onClick?: () => void
}

function parseDate(input: string | Date): Date {
  return input instanceof Date ? input : new Date(input)
}

function daysUntil(target: Date): number {
  const msPerDay = 1000 * 60 * 60 * 24
  const start = new Date()
  // normalize to midnight for a stable day diff
  start.setHours(0, 0, 0, 0)
  const end = new Date(target)
  end.setHours(0, 0, 0, 0)
  return Math.floor((end.getTime() - start.getTime()) / msPerDay)
}

export const DeadlineChip: Component<DeadlineChipProps> = (props) => {
  const dateObj = createMemo(() => parseDate(props.date))
  const dLeft = createMemo(() => daysUntil(dateObj()))
  const overdue = createMemo(() => dLeft() < 0)
  const theme = createMemo(() => props.type === 'hard'
    ? {
        icon: 'i-ph-calendar-x-duotone',
        pillText: 'text-red-600',
        pillBg: 'bg-red-600/10',
        ring: 'ring-red-600/35',
      }
    : {
        icon: 'i-ph-calendar-check-duotone',
        pillText: 'text-sky-600',
        pillBg: 'bg-sky-600/10',
        ring: 'ring-sky-600/35',
      },
  )
  const dueText = createMemo(() => {
    const n = dLeft()
    if (n === 0)
      return 'today'
    if (n === 1)
      return 'in 1 day'
    if (n > 1)
      return `in ${n} days`
    if (n === -1)
      return '1 day ago'
    return `${Math.abs(n)} days ago`
  })

  return (
    <button
      type="button"
      class={cn(
        'inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium ring-1 backdrop-blur-md transition-colors',
        theme().pillText,
        theme().pillBg,
        theme().ring,
        overdue() ? 'ring-2' : '',
        props.class,
      )}
      onClick={() => props.onClick?.()}
      title={`${props.label} • due ${dateObj().toLocaleDateString()}`}
    >
      <span class={cn(theme().icon, 'size-3.5')} />
      <span class="truncate">{props.label}</span>
      <span class="opacity-80">{dueText()}</span>
    </button>
  )
}

export default DeadlineChip
