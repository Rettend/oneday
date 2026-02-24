export const CHAT_SEND_EVENT = 'oneday:chat-send'

export interface ChatSendDetail {
  conversationId: string
  message: string
  messageId: string
}
