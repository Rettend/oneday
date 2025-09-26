// @refresh reload
import { MetaProvider, Title } from '@solidjs/meta'
import { createAsync, Router } from '@solidjs/router'
import { FileRoutes } from '@solidjs/start/router'
import { Show, Suspense } from 'solid-js'
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
                {props.children}
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
