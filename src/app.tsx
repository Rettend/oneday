// @refresh reload
import { AuthProvider } from '@rttnd/gau/client/solid'
import { MetaProvider, Title } from '@solidjs/meta'
import { Router, useLocation } from '@solidjs/router'
import { FileRoutes } from '@solidjs/start/router'
import { createMemo, Show, Suspense } from 'solid-js'
import { AppNavbar } from '~/components/nav/AppNavbar'
import { ViewTransition } from '~/components/ViewTransition'
import { useAuth } from './lib/auth'
import { RootStoreProvider } from './stores'
import { useUIStore } from './stores/ui'
import 'virtual:uno.css'
import '@fontsource-variable/josefin-sans'

function AppShell(props: { children: any }) {
  const [ui] = useUIStore()
  const auth = useAuth()
  const location = useLocation()
  const hasSidebarLayout = createMemo(
    () => location.pathname.startsWith('/c') || location.pathname.startsWith('/q'),
  )

  return (
    <div class="bg-[radial-gradient(520px_520px_at_50%_-20%,oklch(var(--primary)_/_0.15)_9.29%,transparent_100%)] bg-background min-h-100dvh">
      <Show
        when={auth.session().user && hasSidebarLayout()}
        fallback={(
          <div class="mx-auto px-4 py-6 container max-w-3xl">
            {props.children}
          </div>
        )}
      >
        <AppNavbar />
        <div class={`pl-20 pt-6 ${ui.local.sidebarCollapsedLg ? 'lg:pl-20' : 'lg:pl-64'}`}>
          <div class="page-content mx-auto px-4 py-6 container max-w-7xl">
            {props.children}
          </div>
        </div>
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
