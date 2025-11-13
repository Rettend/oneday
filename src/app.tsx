// @refresh reload
import { MetaProvider, Title } from '@solidjs/meta'
import { createAsync, Router } from '@solidjs/router'
import { FileRoutes } from '@solidjs/start/router'
import { Show, Suspense } from 'solid-js'
import { AppNavbar } from '~/components/nav/AppNavbar'
import { ViewTransition } from '~/components/ViewTransition'
import { db } from './server/db'
import { RootStoreProvider } from './stores'
import { useUIStore } from './stores/ui'
import 'virtual:uno.css'
import '@fontsource-variable/josefin-sans'

function AppShell(props: { children: any }) {
  const [ui] = useUIStore()
  return (
    <div class="bg-[radial-gradient(520px_520px_at_50%_-20%,oklch(var(--primary)_/_0.15)_9.29%,transparent_100%)] bg-background min-h-100dvh">
      <AppNavbar />
      <div class={`pl-20 pt-6 ${ui.local.sidebarCollapsedLg ? 'lg:pl-20' : 'lg:pl-64'}`}>
        <div class="page-content mx-auto px-4 py-6 container max-w-7xl">
          {props.children}
        </div>
      </div>
    </div>
  )
}

export default function App() {
  const connected = createAsync(async () => db.connect())

  return (
    <Router
      root={props => (
        <MetaProvider>
          <Title>Oneday</Title>
          <RootStoreProvider>
            <ViewTransition>
              <Suspense>
                <Show when={connected()}>
                  <AppShell>{props.children}</AppShell>
                </Show>
              </Suspense>
            </ViewTransition>
          </RootStoreProvider>
        </MetaProvider>
      )}
    >
      <FileRoutes />
    </Router>
  )
}
