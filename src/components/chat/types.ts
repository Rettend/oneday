export type ChatMessageRole = 'user' | 'assistant'

export interface BaseChatMessage {
  id: string
  role: ChatMessageRole
  createdAt?: string
}

export interface ChatMessageStats {
  promptTokens?: number
  completionTokens?: number
  totalTokens?: number
  tokensPerSecond?: number
  durationMs?: number
  provider?: string
  model?: string
}

export interface ChatThinkingState {
  text: string
  state: 'streaming' | 'done'
}

export interface UserChatMessage extends BaseChatMessage {
  role: 'user'
  content: string
}

export interface AssistantChatMessage extends BaseChatMessage {
  role: 'assistant'
  content: string
  status: 'streaming' | 'ready' | 'error'
  stats?: ChatMessageStats
  thinking?: ChatThinkingState
  errorText?: string
  modelLabel?: string
}

export type ChatMessage = UserChatMessage | AssistantChatMessage

export interface PlainHistoryMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  createdAt?: string
}
