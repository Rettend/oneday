import { createKVRegistry, createRegistry } from '@rttnd/llm'
import { getRequestEvent } from 'solid-js/web'

export function getRegistry() {
  const event = getRequestEvent()
  const env = event?.nativeEvent?.context?.cloudflare?.env

  if (env?.REGISTRY)
    return createKVRegistry({ kv: env.REGISTRY })

  return createRegistry({
    baseUrl: 'https://llm.rettend.me',
    cache: 'auto',
  })
}
