import { Protected } from '@rttnd/gau/client/solid'

export default Protected(ChatPage, '/')

function ChatPage() {
  return (
    <section class="flex flex-col gap-4">
      <header class="flex gap-3 items-center justify-between">
        <h1 class="text-2xl tracking-tight font-semibold">Chat</h1>
        <span class="text-xs text-muted-foreground">Oneday Chat · WIP</span>
      </header>
      <div class="text-muted-foreground">
        This is the future home of the LLM chat experience. We&apos;ll add conversations, model picker, and settings here.
      </div>
    </section>
  )
}
