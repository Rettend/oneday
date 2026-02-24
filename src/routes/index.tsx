import { createAsync } from '@solidjs/router'
import { createMemo, For, Show } from 'solid-js'
import { Button } from '~/components/ui/button'
import { useAuth } from '~/lib/auth'
import { Navigate } from '~/router'
import { getConnectionInfo } from '~/server/remote/requestInfo'

const providers = [
  {
    id: 'google' as const,
    label: 'Google',
    icon: 'i-ph-google-logo-duotone',
  },
  {
    id: 'github' as const,
    label: 'GitHub',
    icon: 'i-ph-github-logo-duotone',
  },
  {
    id: 'discord' as const,
    label: 'Discord',
    icon: 'i-ph-discord-logo-duotone',
  },
]

export default function Home() {
  const auth = useAuth()
  const connectionInfo = createAsync(() => getConnectionInfo())

  const connectionText = createMemo(() => {
    const info = connectionInfo()
    if (!info)
      return 'Not connected'

    const tls = info.tlsVersion ?? 'N/A'
    const protocol = info.httpProtocol ?? 'N/A'

    const location
      = info.city && info.country
        ? `${info.city}, ${info.country}`
        : info.colo
          ? info.colo
          : 'Unknown'

    return `Connection via ${tls} · ${protocol} · Edge: ${location}`
  })

  return (
    <main class="flex min-h-100dvh items-center justify-center">
      <Show
        when={auth.session().user}
        fallback={(
          <section class="mx-auto px-4 py-8 container max-w-sm">
            <header class="mb-6 text-center flex flex-col gap-2">
              <h1 class="text-3xl tracking-tight font-semibold">Sign in to Oneday</h1>
              <p class="text-sm text-muted-foreground">
                {connectionText()}
              </p>
            </header>
            <div class="space-y-3">
              <For each={providers}>
                {provider => (
                  <Button
                    class="w-full"
                    variant="outline"
                    onClick={() => auth.signIn(provider.id)}
                  >
                    <span class={`${provider.icon} mr-2 size-5`} />
                    Continue with
                    {' '}
                    {provider.label}
                  </Button>
                )}
              </For>
            </div>
          </section>
        )}
      >
        <Navigate href="/dashboard" />
      </Show>
    </main>
  )
}
