/// <reference types="@solidjs/start/env" />

import type { GauSession, ProviderIds } from '@rttnd/gau'
import type { Auth } from './server/auth'

declare global {
  namespace App {
    interface RequestEventLocals {
      getSession: () => Promise<GauSession<ProviderIds<Auth>>>
    }
  }
}

interface CloudflareEnv {
  REGISTRY: KVNamespace
}

declare module 'vinxi/http' {
  interface H3EventContext {
    cloudflare?: {
      env?: CloudflareEnv
    }
  }
}

export {}
