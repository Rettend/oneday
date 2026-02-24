// @refresh reload
import { AuthProvider } from '@rttnd/gau/client/solid'
import { MetaProvider, Title } from '@solidjs/meta'
import { Router, useLocation, useNavigate } from '@solidjs/router'
import { FileRoutes } from '@solidjs/start/router'
import { createEffect, createMemo, Show, Suspense } from 'solid-js'
import { CHAT_SEND_EVENT } from '~/components/chat/events'
import { LLMInput } from '~/components/chat/LLMInput'
import { AppNavbar } from '~/components/nav/AppNavbar'
import { ViewTransition } from '~/components/ViewTransition'
import { useAuth } from './lib/auth'
import { RootStoreProvider } from './stores'
import { useUIStore } from './stores/ui'
import { uuidV7Base58 } from './utils/ids'
import 'virtual:uno.css'
import '@fontsource-variable/josefin-sans'

const LAST_CHAT_ID_STORAGE_KEY = 'oneday:last-chat-id'

interface ChatSendDetail {
  conversationId: string
  message: string
  messageId: string
}

interface ChatNavigationState {
  initialMessage: string
  initialMessageId: string
}

function AppShell(props: { children: any }) {
  const [ui] = useUIStore()
  const auth = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const activeConversationId = createMemo(() => {
    const match = /^\/chat\/([^/]+)$/.exec(location.pathname)
    return match?.[1]
  })

  createEffect(() => {
    const conversationId = activeConversationId()
    if (!conversationId || typeof window === 'undefined')
      return
    window.localStorage.setItem(LAST_CHAT_ID_STORAGE_KEY, conversationId)
  })

  function dailyConversationId() {
    const isoDate = new Date().toISOString().slice(0, 10)
    return `daily-${isoDate}`
  }

  function resolveConversationId() {
    const activeId = activeConversationId()
    if (activeId)
      return activeId

    if (typeof window !== 'undefined') {
      const recentId = window.localStorage.getItem(LAST_CHAT_ID_STORAGE_KEY)
      if (recentId)
        return recentId
    }

    return dailyConversationId()
  }

  async function handleOverlaySend(message: string) {
    const trimmed = message.trim()
    if (!trimmed)
      return

    const conversationId = resolveConversationId()
    const messageId = uuidV7Base58()

    if (activeConversationId() === conversationId && typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent<ChatSendDetail>(CHAT_SEND_EVENT, {
        detail: {
          conversationId,
          message: trimmed,
          messageId,
        },
      }))
      return
    }

    navigate(`/chat/${conversationId}`, {
      state: {
        initialMessage: trimmed,
        initialMessageId: messageId,
      } satisfies ChatNavigationState,
    })
  }

  return (
    <div class="bg-[radial-gradient(520px_520px_at_50%_-20%,oklch(var(--primary)_/_0.15)_9.29%,transparent_100%)] bg-background min-h-100dvh">
      <Show
        when={auth.session().user}
        fallback={(
          <div class="mx-auto px-4 py-6 container max-w-3xl">
            {props.children}
          </div>
        )}
      >
        <>
          <AppNavbar />
          <div class={`pb-28 pl-20 pt-6 ${ui.local.sidebarCollapsedLg ? 'lg:pl-20' : 'lg:pl-64'}`}>
            <div class="page-content mx-auto px-4 py-6 container max-w-7xl">
              {props.children}
            </div>
          </div>
          <LLMInput
            onSend={handleOverlaySend}
            position="overlay"
            settingsMode="active"
            placeholder="Negotiate today's contract or ask for a nudge."
          />
        </>
      </Show>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <Router
        root={props => (
          <MetaProvider>
            <Title>Oneday</Title>
            <RootStoreProvider>
              <ViewTransition>
                <Suspense>
                  <AppShell>{props.children}</AppShell>
                </Suspense>
              </ViewTransition>
            </RootStoreProvider>
          </MetaProvider>
        )}
      >
        <FileRoutes />
      </Router>
    </AuthProvider>
  )
}
