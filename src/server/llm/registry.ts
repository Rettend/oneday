import { createRegistry } from '@rttnd/llm'

// Registry client for llm.rettend.me.
// For now this uses HTTP; once the shared Cloudflare KV binding is wired,
// we can swap this to use createKVRegistry({ kv: env.REGISTRY }).

const BASE_URL = 'https://llm.rettend.me'

export function getRegistry() {
  return createRegistry({
    baseUrl: BASE_URL,
    cache: 'auto',
  })
}
