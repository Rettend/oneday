import { createKVRegistry } from '@rttnd/llm'
import { getRequestEvent } from 'solid-js/web'

export function getRegistry() {
  const event = getRequestEvent()
  const env = event?.nativeEvent?.context?.cloudflare?.env

  if (!env?.REGISTRY) {
    throw new Error(
      'REGISTRY KV binding not found.',
    )
  }

  return createKVRegistry({ kv: env.REGISTRY })
}
