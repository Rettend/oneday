/// <reference types="@solidjs/start/env" />
/// <reference types="@cloudflare/workers-types" />

import type { GauSession, ProviderIds } from '@rttnd/gau'
import type { ChatAgent } from './agents/chat'
import type { Auth } from './server/auth'

declare global {
  namespace App {
    interface RequestEventLocals {
      getSession: () => Promise<GauSession<ProviderIds<Auth>>>
    }
  }

  interface Env {
    AI: Ai
    ASSETS: Fetcher
    REGISTRY: KVNamespace
    ChatAgent: DurableObjectNamespace<ChatAgent>
    TURSO_DB_URL: string
    TURSO_AUTH_TOKEN: string
    AUTH_SECRET: string
  }
}

declare module 'vinxi/http' {
  interface H3EventContext {
    cloudflare?: {
      env?: Env
      request?: Request
    }
  }
}

export {}
