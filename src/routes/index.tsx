import { createAsync } from '@solidjs/router'
import { createMemo, For, Show } from 'solid-js'
import { Button } from '~/components/ui/button'
import { useAuth } from '~/lib/auth'
import { A } from '~/router'
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
                    onClick={() => auth.signIn(provider.id, { redirectTo: '/q/today' })}
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
        <section class="mx-auto px-4 py-12 text-center container flex flex-col gap-8 max-w-2xl items-center">
          <div class="flex flex-col gap-4 items-center">
            <span class="i-ph-sun-horizon-duotone text-primary size-16 md:size-20" />
            <div class="space-y-2">
              <h1 class="text-4xl tracking-tight font-semibold md:text-5xl">Oneday</h1>
              <p class="text-sm text-muted-foreground mx-auto max-w-md md:text-base">
                {connectionText()}
              </p>
            </div>
          </div>
          <div class="mt-2 gap-4 grid max-w-md w-full md:grid-cols-2">
            <A
              href="/c"
              class="group px-6 py-5 text-left border border-border/80 rounded-2xl bg-background/70 flex gap-3 transition-colors items-center hover:border-primary/40 hover:bg-primary/6"
            >
              <span class="text-primary rounded-full bg-primary/10 inline-flex size-9 items-center justify-center">
                <span class="i-ph-chat-circle-dots-duotone size-5" />
              </span>
              <div class="text-lg font-semibold">Chat</div>
            </A>
            <A
              href="/q/today"
              class="group px-6 py-5 text-left border border-border/80 rounded-2xl bg-background/70 flex gap-3 transition-colors items-center hover:border-primary/40 hover:bg-primary/6"
            >
              <span class="text-primary rounded-full bg-primary/10 inline-flex size-9 items-center justify-center">
                <span class="i-ph-sword-duotone size-5" />
              </span>
              <div class="text-lg font-semibold">Quest</div>
            </A>
          </div>
        </section>
      </Show>
    </main>
  )
}
