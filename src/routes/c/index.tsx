import { Protected } from '@rttnd/gau/client/solid'
import { useNavigate } from '@solidjs/router'
import { LLMInput } from '~/components/chat/LLMInput'
import { uuidV7Base58 } from '~/utils/ids'

export default Protected(ChatLandingPage, '/')

function ChatLandingPage() {
  const navigate = useNavigate()

  async function handleSend(message: string) {
    const trimmed = message.trim()
    if (!trimmed)
      return
    const conversationId = uuidV7Base58()
    navigate(`/c/${conversationId}`, { state: { initialMessage: trimmed } })
  }

  return (
    <section class="flex flex-col gap-8 min-h-[70vh] items-center justify-center">
      <div class="text-center max-w-2xl w-full space-y-3">
        <h1 class="text-3xl tracking-tight font-semibold">Oneday Chat</h1>
      </div>
      <LLMInput
        placeholder="What should we think through together?"
        onSend={handleSend}
        position="inline"
      />
    </section>
  )
}
