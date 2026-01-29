import type { StreamTextOnFinishCallback, ToolSet } from 'ai'
import { AIChatAgent } from '@rttnd/ai-chat'
import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  streamText,
} from 'ai'
import { createWorkersAI } from 'workers-ai-provider'

export class ChatAgent extends AIChatAgent<Env> {
  async onChatMessage(onFinish: StreamTextOnFinishCallback<ToolSet>) {
    const workersai = createWorkersAI({ binding: this.env.AI })
    const model = workersai('@cf/meta/llama-2-7b-chat-int8')

    const stream = createUIMessageStream({
      execute: async ({ writer }) => {
        const result = streamText({
          messages: await convertToModelMessages(this.messages),
          model,
          onFinish,
        })

        writer.merge(result.toUIMessageStream())
      },
    })

    return createUIMessageStreamResponse({ stream })
  }
}
