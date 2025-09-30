import type { Component, ComponentProps } from 'solid-js'
import { splitProps } from 'solid-js'
import { cn } from '~/utils'

export const IconChevronDown: Component<ComponentProps<'span'>> = (props) => {
  const [local, others] = splitProps(props, ['class'])

  return (
    <span
      aria-hidden="true"
      {...others}
      class={cn('inline-flex items-center justify-center i-ph-caret-down-duotone size-4 transition-transform duration-200', local.class)}
    />
  )
}
