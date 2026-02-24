import type { UIMessage } from 'ai'
import type { ChatSendDetail } from '~/components/chat/events'
import { Protected } from '@rttnd/gau/client/solid'
import { useLocation, useParams } from '@solidjs/router'
import { createEffect, For, onCleanup, onMount, Show } from 'solid-js'
import { CHAT_SEND_EVENT } from '~/components/chat/events'
import { createChatSession, DEFAULT_MODEL_LABEL } from '~/components/chat/useChatSession'

interface ChatRouteState {
  initialMessage?: string
  initialMessageId?: string
}

export default Protected(ChatConversationPage, '/')

function ChatConversationPage() {
  const params = useParams()
  const location = useLocation<ChatRouteState>()
  const conversationId = params.id

  const chat = createChatSession({ conversationId: conversationId ?? 'missing' })
  const sentInitialMessageIds = new Set<string>()
  let messagesEndRef: HTMLDivElement | undefined

  function queueMessage(message?: string, messageId?: string) {
    const trimmed = message?.trim()
    if (!conversationId || !trimmed)
      return

    const dedupeId = messageId ?? `${conversationId}:initial`
    if (sentInitialMessageIds.has(dedupeId))
      return

    sentInitialMessageIds.add(dedupeId)
    chat.onReady(() => {
      void chat.sendMessage(trimmed)
    })
  }

  onMount(() => {
    if (!conversationId)
      return

    function handleShellSend(event: Event) {
      const detail = (event as CustomEvent<ChatSendDetail>).detail
      if (!detail || detail.conversationId !== conversationId)
        return
      queueMessage(detail.message, detail.messageId)
    }

    window.addEventListener(CHAT_SEND_EVENT, handleShellSend as EventListener)
    onCleanup(() => {
      window.removeEventListener(CHAT_SEND_EVENT, handleShellSend as EventListener)
    })
  })

  createEffect(() => {
    queueMessage(location.state?.initialMessage, location.state?.initialMessageId)
  })

  createEffect(() => {
    if (chat.messages.length > 0)
      messagesEndRef?.scrollIntoView({ behavior: 'smooth' })
  })

  return (
    <Show when={conversationId} fallback={<MissingConversation />}>
      <section class="mb-16 flex flex-col gap-4 min-h-[70vh]">
        <header class="flex gap-3 items-center justify-between">
          <div>
            <h1 class="text-2xl tracking-tight font-semibold">Chat</h1>
            <p class="text-xs text-muted-foreground">
              Using {DEFAULT_MODEL_LABEL} · Conversation {conversationId}
            </p>
          </div>
          <button
            type="button"
            onClick={() => chat.clearHistory()}
            class="text-xs px-3 py-1.5 border border-border/70 rounded-lg transition-colors hover:bg-muted/50"
          >
            Clear history
          </button>
        </header>

        <div class="flex-1 overflow-y-auto">
          <div class="flex flex-col gap-4">
            <Show
              when={chat.messages.length > 0}
              fallback={<EmptyState />}
            >
              <For each={chat.messages}>
                {message => (
                  <ChatMessage message={message} />
                )}
              </For>
              <div ref={messagesEndRef} />
            </Show>
          </div>
        </div>
      </section>
    </Show>
  )
}

function ChatMessage(props: { message: UIMessage }) {
  const isUser = () => props.message.role === 'user'

  function getTextContent(parts?: UIMessage['parts']) {
    if (!parts)
      return ''
    return parts
      .filter((part): part is Extract<typeof part, { type: 'text' }> => part.type === 'text')
      .map(part => part.text)
      .join('\n')
  }

  return (
    <div class={`flex ${isUser() ? 'justify-end' : 'justify-start'}`}>
      <div
        class={`px-4 py-3 rounded-2xl max-w-[80%] ${
          isUser()
            ? 'bg-primary text-primary-foreground rounded-br-md'
            : 'bg-muted/60 border border-border/60 rounded-bl-md'
        }`}
      >
        <div class="text-sm whitespace-pre-wrap">
          {getTextContent(props.message.parts)}
        </div>
      </div>
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

function MissingConversation() {
  return (
    <section class="flex flex-col gap-4 min-h-[70vh]">
      <header class="flex gap-3 items-center justify-between">
        <div>
          <h1 class="text-2xl tracking-tight font-semibold">Chat</h1>
          <p class="text-xs text-muted-foreground">
            Missing conversation ID.
          </p>
        </div>
      </header>
    </section>
  )
}
