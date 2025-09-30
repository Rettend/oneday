import type { ComponentProps } from 'solid-js'
import * as CollapsiblePrimitive from '@kobalte/core/collapsible'
import { splitProps } from 'solid-js'
import { cn } from '~/utils'

const Collapsible = CollapsiblePrimitive.Root

const CollapsibleTrigger = CollapsiblePrimitive.Trigger

function CollapsibleContent(props: ComponentProps<typeof CollapsiblePrimitive.Content>) {
  const [local, others] = splitProps(props, ['class', 'children', 'forceMount'])
  return (
    <CollapsiblePrimitive.Content
      forceMount={local.forceMount ?? true}
      class={cn(
        'overflow-hidden transition-[margin,opacity] duration-200 ease-out data-[closed]:pointer-events-none data-[closed]:opacity-0 data-[closed]:mt-0 data-[expanded]:mt-3 data-[expanded]:opacity-100 data-[expanded]:animate-[collapsible-down_260ms_cubic-bezier(0.16,1,0.3,1)] data-[closed]:animate-[collapsible-up_220ms_cubic-bezier(0.4,0,0.2,1)_forwards] data-[state=open]:mt-3 data-[state=open]:opacity-100 data-[state=open]:animate-[collapsible-down_260ms_cubic-bezier(0.16,1,0.3,1)] data-[state=closed]:pointer-events-none data-[state=closed]:opacity-0 data-[state=closed]:mt-0 data-[state=closed]:animate-[collapsible-up_220ms_cubic-bezier(0.4,0,0.2,1)_forwards]',
        local.class,
      )}
      {...others}
    >
      <div class="min-w-0">
        {local.children}
      </div>
    </CollapsiblePrimitive.Content>
  )
}

export { Collapsible, CollapsibleContent, CollapsibleTrigger }
