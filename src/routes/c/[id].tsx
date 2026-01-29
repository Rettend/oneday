import type { UIMessage } from 'ai'
import { Protected } from '@rttnd/gau/client/solid'
import { useLocation, useParams } from '@solidjs/router'
import { createEffect, createSignal, For, onMount, Show } from 'solid-js'
import { LLMInput } from '~/components/chat/LLMInput'
import { createChatSession, DEFAULT_MODEL_LABEL } from '~/components/chat/useChatSession'

// export default Protected(ChatConversationPage, '/')

export default function ChatConversationPage() {
  const params = useParams()
  const location = useLocation<{ initialMessage?: string }>()
  const conversationId = params.id

  const chat = createChatSession({ conversationId: conversationId ?? 'missing' })
  const [prefill, setPrefill] = createSignal<string | undefined>()
  let messagesEndRef: HTMLDivElement | undefined

  // Handle initial message from navigation state (only once)
  onMount(() => {
    const initialMessage = location.state?.initialMessage
    if (!initialMessage || !conversationId)
      return

    // Use sessionStorage to track sent initial messages (persists across HMR)
    const sentKey = `chat-initial-sent:${conversationId}`
    if (sessionStorage.getItem(sentKey))
      return

    // Mark as sent immediately to prevent double-sends
    sessionStorage.setItem(sentKey, '1')

    // Wait for WebSocket connection to be ready before sending
    chat.onReady(() => {
      void chat.sendMessage(initialMessage)
    })
  })

  createEffect(() => {
    if (chat.messages.length > 0)
      messagesEndRef?.scrollIntoView({ behavior: 'smooth' })
  })

  async function handleSend(message: string) {
    await chat.sendMessage(message)
  }

  return (
    <Show when={conversationId} fallback={<MissingConversation />}>
      <section class="mb-40 flex flex-col gap-4 min-h-[70vh] relative">
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
            Clear History
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
                  <ChatMessage message={message} onEditUser={setPrefill} />
                )}
              </For>
              <div ref={messagesEndRef} />
            </Show>
          </div>
        </div>

        <LLMInput
          placeholder="Type a message..."
          onSend={handleSend}
          position="overlay"
          prefill={prefill()}
          onPrefillApplied={() => setPrefill(undefined)}
        />
      </section>
    </Show>
  )
}

function ChatMessage(props: { message: UIMessage, onEditUser?: (text: string) => void }) {
  const isUser = () => props.message.role === 'user'

  function getTextContent(parts?: UIMessage['parts']) {
    if (!parts)
      return ''
    return parts
      .filter((p): p is Extract<typeof p, { type: 'text' }> => p.type === 'text')
      .map(p => p.text)
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
        <Show when={isUser() && props.onEditUser}>
          <button
            type="button"
            onClick={() => props.onEditUser?.(getTextContent(props.message.parts))}
            class="text-xs mb-1 opacity-60 hover:opacity-100"
          >
            Edit
          </button>
        </Show>
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
    <section class="mb-40 flex flex-col gap-4 min-h-[70vh] relative">
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
