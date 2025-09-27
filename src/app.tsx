// @refresh reload
import { MetaProvider, Title } from '@solidjs/meta'
import { createAsync, Router } from '@solidjs/router'
import { FileRoutes } from '@solidjs/start/router'
import { Show, Suspense } from 'solid-js'
import { AppNavbar } from '~/components/nav/AppNavbar'
import { db } from './server/db'
import { RootStoreProvider } from './stores'
import 'virtual:uno.css'
import '@fontsource-variable/josefin-sans'

export default function App() {
  const connected = createAsync(async () => db.connect())

  return (
    <Router
      root={props => (
        <MetaProvider>
          <Title>Oneday</Title>
          <RootStoreProvider>
            <Suspense>
              <Show when={connected()}>
                <div class="bg-background min-h-100dvh">
                  <div class="flex min-h-100dvh">
                    <AppNavbar />
                    <div class="pb-16 flex-1">
                      <div class="mx-auto px-4 py-6 container max-w-6xl">
                        {props.children}
                      </div>
                    </div>
                  </div>
                </div>
              </Show>
            </Suspense>
          </RootStoreProvider>
        </MetaProvider>
      )}
    >
      <FileRoutes />
    </Router>
  )
}
