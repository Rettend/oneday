import type { UIMessage } from 'ai'
import type { ChatSendDetail } from '~/components/chat/events'
import { Protected } from '@rttnd/gau/client/solid'
import { createAsync, revalidate, useAction, useLocation, useParams } from '@solidjs/router'
import { createEffect, createMemo, For, onCleanup, onMount, Show } from 'solid-js'
import { CHAT_SEND_EVENT } from '~/components/chat/events'
import { createChatSession } from '~/components/chat/useChatSession'
import { ensureConversation, getConversation, updateConversationModel } from '~/server/remote/chat'
import { getChatModels } from '~/server/remote/llm'

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
  const ensureConversationAction = useAction(ensureConversation)
  const updateConversationModelAction = useAction(updateConversationModel)

  const conversation = createAsync(async () => {
    if (!conversationId)
      return undefined
    return getConversation(conversationId)
  })

  const models = createAsync(() => getChatModels())

  const selectedModelValue = createMemo(() => {
    const convo = conversation()
    if (!convo?.modelProviderId || !convo?.modelId)
      return ''
    return `${convo.modelProviderId}:${convo.modelId}`
  })

  const selectedModelLabel = createMemo(() => {
    const selected = selectedModelValue()
    const allModels = models() ?? []
    const match = allModels.find(item => `${item.provider}:${item.id}` === selected)

    if (match)
      return `${match.name} (${match.provider})`

    if (selected)
      return selected

    return 'Default model'
  })

  const sentInitialMessageIds = new Set<string>()
  let messagesEndRef: HTMLDivElement | undefined

  createEffect(() => {
    if (!conversationId)
      return

    void ensureConversationAction({
      id: conversationId,
      title: conversationId.startsWith('daily-') ? `Daily contract ${conversationId.slice('daily-'.length)}` : undefined,
    })
  })

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

  async function handleModelChange(value: string) {
    if (!conversationId || !value)
      return

    const separator = value.indexOf(':')
    if (separator <= 0)
      return

    const providerId = value.slice(0, separator)
    const modelId = value.slice(separator + 1)

    await updateConversationModelAction({
      conversationId,
      providerId,
      modelId,
    })

    await revalidate(getConversation.keyFor(conversationId))
  }

  return (
    <Show when={conversationId} fallback={<MissingConversation />}>
      <section class="mb-16 flex flex-col gap-4 min-h-[70vh]">
        <header class="flex flex-wrap gap-3 items-center justify-between">
          <div>
            <h1 class="text-2xl tracking-tight font-semibold">Chat</h1>
            <p class="text-xs text-muted-foreground">
              Using {selectedModelLabel()} · Conversation {conversationId}
            </p>
          </div>
          <Show when={(models()?.length ?? 0) > 0}>
            <label class="text-xs text-muted-foreground flex gap-2 items-center">
              Model
              <select
                class="text-xs px-2.5 py-1.5 border border-border/70 rounded-full bg-background"
                value={selectedModelValue()}
                onChange={(event) => {
                  void handleModelChange(event.currentTarget.value)
                }}
              >
                <option value="">Default</option>
                <For each={models() ?? []}>
                  {model => (
                    <option value={`${model.provider}:${model.id}`}>
                      {model.name} ({model.provider})
                    </option>
                  )}
                </For>
              </select>
            </label>
          </Show>
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

  function getToolParts(parts?: UIMessage['parts']) {
    const normalized = (parts ?? []) as Array<Record<string, unknown>>
    return normalized.filter((part) => {
      const type = part.type
      return typeof type === 'string' && type.includes('tool')
    })
  }

  function toolLabel(part: Record<string, unknown>) {
    const rawName = part.toolName ?? part.name
    if (typeof rawName === 'string' && rawName.trim())
      return rawName

    const type = part.type
    return typeof type === 'string' ? type : 'tool'
  }

  function toolPayload(part: Record<string, unknown>) {
    return part.result
      ?? part.output
      ?? part.args
      ?? part.input
      ?? part.data
      ?? null
  }

  const textContent = createMemo(() => getTextContent(props.message.parts))
  const toolParts = createMemo(() => getToolParts(props.message.parts))

  return (
    <div class={`flex ${isUser() ? 'justify-end' : 'justify-start'}`}>
      <div
        class={`px-4 py-3 rounded-2xl max-w-[80%] ${
          isUser()
            ? 'bg-primary text-primary-foreground rounded-br-md'
            : 'bg-muted/60 border border-border/60 rounded-bl-md'
        }`}
      >
        <Show when={toolParts().length > 0 && !isUser()}>
          <div class="mb-3 flex flex-col gap-2">
            <For each={toolParts()}>
              {part => (
                <div class="text-xs px-3 py-2 border border-border/70 rounded-xl bg-background/40 space-y-1">
                  <p class="text-11px text-muted-foreground tracking-wide uppercase">Tool · {toolLabel(part)}</p>
                  <pre class="text-11px leading-relaxed whitespace-pre-wrap break-words">
                    {JSON.stringify(toolPayload(part), null, 2)}
                  </pre>
                </div>
              )}
            </For>
          </div>
        </Show>

        <Show when={textContent().trim().length > 0}>
          <div class="text-sm whitespace-pre-wrap">{textContent()}</div>
        </Show>
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
