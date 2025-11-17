import { Protected } from '@rttnd/gau/client/solid'
import { createAsync } from '@solidjs/router'
import { For, Show } from 'solid-js'
import { LLMInput } from '~/components/chat/LLMInput'
import { getChatModels } from '~/server/remote/llm'

export default Protected(ChatConversationPage, '/')

function ChatConversationPage() {
  const models = createAsync(() => getChatModels())

  function handleSend(message: string) {
    // eslint-disable-next-line no-console
    console.log('[chat] send', message)
  }

  return (
    <section class="flex flex-col gap-4 min-h-[60vh] relative">
      <header class="flex gap-3 items-center justify-between">
        <div>
          <h1 class="text-2xl tracking-tight font-semibold">Chat</h1>
          <p class="text-xs text-muted-foreground">Conversation in progress</p>
        </div>
      </header>
      <section class="text-xs px-3 py-2 border border-border/70 rounded-xl bg-card/80">
        <Show
          when={models()}
          fallback={<p class="text-xs text-muted-foreground">Loading models from registry…</p>}
        >
          {list => (
            <div class="space-y-1">
              <p class="text-xs text-muted-foreground">
                {list().length ? `Configured models (${list().length})` : 'No models available yet.'}
              </p>
              <div class="flex flex-wrap gap-1">
                <For each={list()}>
                  {model => (
                    <span class="text-11px text-muted-foreground px-2 py-1 border border-border/60 rounded-full bg-background/60">
                      <span class="font-medium">{model.provider}</span>
                      <span class="text-foreground/30 mx-1">/</span>
                      <span class="font-mono">{model.value}</span>
                    </span>
                  )}
                </For>
              </div>
            </div>
          )}
        </Show>
      </section>
      <div class="flex-1" />
      <LLMInput
        placeholder="Continue the conversation"
        onSend={handleSend}
        position="overlay"
      />
    </section>
  )
}
