import type { Component } from 'solid-js'
import type { UserChatMessage } from './types'
import { Show } from 'solid-js'
import { Button } from '~/components/ui/button'

interface ChatBubbleProps {
  message: UserChatMessage
  onEdit?: (message: UserChatMessage) => void
}

export const ChatBubble: Component<ChatBubbleProps> = (props) => {
  async function copy() {
    if (navigator?.clipboard)
      await navigator.clipboard.writeText(props.message.content)
  }

  function handleEdit() {
    props.onEdit?.(props.message)
  }

  return (
    <div class="group flex flex-col gap-1 items-end">
      <div class="text-base text-white px-4 py-3 border border-primary/30 rounded-2xl bg-primary/10 max-w-[min(80vw,640px)] shadow-[0_8px_30px_rgba(0,0,0,0.25)] backdrop-blur">
        <p class="leading-relaxed text-left whitespace-pre-wrap">
          {props.message.content}
        </p>
      </div>
      <div class="opacity-0 flex gap-1 transition-opacity duration-150 group-hover:opacity-100">
        <Button
          size="icon"
          variant="ghost"
          class="size-7"
          title="Copy message"
          onClick={copy}
        >
          <span class="i-ph-copy-duotone size-4" />
        </Button>
        <Show when={props.onEdit}>
          <Button
            size="icon"
            variant="ghost"
            class="size-7"
            title="Edit message"
            onClick={handleEdit}
          >
            <span class="i-ph-pencil-line-duotone size-4" />
          </Button>
        </Show>
      </div>
    </div>
  )
}
