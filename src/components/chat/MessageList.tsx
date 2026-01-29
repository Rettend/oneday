import type { Component } from 'solid-js'
import type { AssistantChatMessage, ChatMessage, UserChatMessage } from './types'
import { createEffect, For, Show } from 'solid-js'
import { AssistantMessage } from './AssistantMessage'
import { ChatBubble } from './ChatBubble'

interface MessageListProps {
  messages: ChatMessage[]
  streamingId?: string | null
  onEditUser?: (message: UserChatMessage) => void
  onRegenerate?: (message: AssistantChatMessage) => void
}

export const MessageList: Component<MessageListProps> = (props) => {
  let endRef: HTMLDivElement | undefined

  createEffect(() => {
    void props.messages.length
    requestAnimationFrame(() => {
      endRef?.scrollIntoView({ behavior: 'smooth', block: 'end' })
    })
  })

  return (
    <div class="flex flex-col gap-6">
      <Show
        when={props.messages.length > 0}
        fallback={<EmptyState />}
      >
        <For each={props.messages}>
          {message => (
            <Show
              when={message.role === 'assistant' ? message as AssistantChatMessage : null}
              fallback={(
                <div class="flex justify-end">
                  <ChatBubble
                    message={message as UserChatMessage}
                    onEdit={props.onEditUser}
                  />
                </div>
              )}
            >
              {assistant => (
                <div class="flex justify-start">
                  <AssistantMessage
                    message={assistant()}
                    isStreaming={props.streamingId === assistant().id && assistant().status === 'streaming'}
                    onRegenerate={props.onRegenerate}
                  />
                </div>
              )}
            </Show>
          )}
        </For>
        <div ref={endRef} />
      </Show>
    </div>
  )
}

function EmptyState() {
  return (
    <div class="px-4 py-10 text-center border border-border/60 rounded-2xl border-dashed bg-card/30">
      <p class="text-base text-muted-foreground">
        Start the conversation with a prompt. Responses will stream in here.
      </p>
    </div>
  )
}
