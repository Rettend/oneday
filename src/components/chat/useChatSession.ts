import type { UIMessage } from 'ai'
import { createAgent } from '@rttnd/agents/solid'
import { createAgentChat } from '@rttnd/ai-chat/solid'

export const DEFAULT_MODEL_LABEL = 'Llama 2 7B'

const AGENT_URL = import.meta.env.DEV
  ? 'http://localhost:8787'
  : (import.meta.env.VITE_AGENT_URL ?? '')

export interface ChatSession {
  messages: UIMessage[]
  sendMessage: (text: string) => Promise<void>
  clearHistory: () => void
  setMessages: (messages: UIMessage[]) => void
  onReady: (callback: () => void) => void
}

export interface ChatSessionOptions {
  conversationId: string
}

export function createChatSession(options: ChatSessionOptions): ChatSession {
  const readyCallbacks: Array<() => void> = []
  let isReady = false

  const agent = createAgent(() => ({
    agent: 'ChatAgent',
    name: options.conversationId,
    host: AGENT_URL,
    onOpen: () => {
      isReady = true
      readyCallbacks.forEach(cb => cb())
      readyCallbacks.length = 0
    },
  }))

  const { messages, setMessages, sendMessage, clearHistory } = createAgentChat({
    agent,
  })

  function onReady(callback: () => void) {
    if (isReady)
      callback()
    else
      readyCallbacks.push(callback)
  }

  async function handleSendMessage(text: string) {
    const trimmed = text.trim()
    if (!trimmed)
      return

    await sendMessage({
      role: 'user',
      parts: [{ type: 'text', text: trimmed }],
    })
  }

  return {
    messages,
    sendMessage: handleSendMessage,
    clearHistory,
    setMessages,
    onReady,
  }
}
