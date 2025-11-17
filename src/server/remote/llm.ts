import type { Model } from '@rttnd/llm'
import { query } from '@solidjs/router'
import { getRegistry } from '../llm/registry'

const getChatModelsId = 'llm:getChatModels'

const SUPPORTED_PROVIDERS = new Set(['openai', 'groq', 'google', 'azure'])

export interface ChatModelSummary {
  id: string
  provider: string
  value: string
  name: string
  alias?: string | null
  iq?: number | null
  speed?: number | null
  capabilities?: Model['capabilities']
}

export const getChatModels = query(async () => {
  'use server'

  const registry = getRegistry()
  const { data: models } = await registry.searchModels({
    capability: 'text',
    status: 'latest',
    minIq: 0,
    minSpeed: 0,
  })

  if (!models)
    return [] as ChatModelSummary[]

  const filtered = models.filter(model => SUPPORTED_PROVIDERS.has(model.provider))

  return filtered.map<ChatModelSummary>(model => ({
    id: model.id,
    provider: model.provider,
    value: model.value,
    name: model.name,
    alias: model.alias ?? null,
    iq: model.iq ?? null,
    speed: model.speed ?? null,
    capabilities: model.capabilities,
  }))
}, getChatModelsId)
