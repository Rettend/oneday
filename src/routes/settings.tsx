import { Protected } from '@rttnd/gau/client/solid'
import { createAsync, useAction } from '@solidjs/router'
import { createSignal, For, Show } from 'solid-js'
import { ApiKeyInput } from '~/components/fields/ApiKeyInput'
import { Button } from '~/components/ui/button'
import { listApiKeys, upsertApiKey } from '~/server/remote/apiKeys'
import { getChatProviders } from '~/server/remote/llm'

export default Protected(SettingsPage, '/')

function SettingsPage() {
  const savedProviders = createAsync(() => listApiKeys())
  const providerList = createAsync(() => getChatProviders())
  const upsert = useAction(upsertApiKey)
  const [inputs, setInputs] = createSignal<Record<string, string>>({})

  async function handleSave(provider: string, apiKey: string) {
    await upsert({
      provider,
      apiKey: apiKey.trim() || undefined,
    })
    setInputs(prev => ({ ...prev, [provider]: '' }))
  }

  function hasKey(provider: string): boolean {
    const list = savedProviders()
    if (!list)
      return false
    return list.includes(provider)
  }

  return (
    <section class="flex flex-col gap-4">
      <header class="flex flex-col gap-2">
        <h1 class="text-3xl tracking-tight font-semibold">Settings</h1>
        <p class="text-sm text-muted-foreground">
          Bring your own API keys for model providers. Keys are encrypted and never displayed after saving.
        </p>
      </header>

      <div class="p-4 border border-border/70 rounded-xl bg-card/80 space-y-4">
        <div class="space-y-1">
          <h2 class="text-sm font-semibold">BYOK providers</h2>
          <p class="text-xs text-muted-foreground">
            Configure one key per provider. Clearing a key disables that provider for future chats.
          </p>
        </div>

        <Show
          when={providerList()}
          fallback={<p class="text-xs text-muted-foreground">Loading providers...</p>}
        >
          {providers => (
            <div class="space-y-3">
              <For each={providers() ?? []}>
                {provider => (
                  <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <div class="sm:w-48">
                      <p class="text-sm font-medium">{provider.name}</p>
                      <p class="text-11px text-muted-foreground mt-0.5">ID: {provider.id}</p>
                      <Show when={provider.website}>
                        <a
                          href={provider.website ?? undefined}
                          target="_blank"
                          rel="noreferrer"
                          class="text-11px text-primary hover:underline"
                        >
                          Open dashboard
                        </a>
                      </Show>
                    </div>
                    <div class="flex-1 min-w-0">
                      <Show
                        when={hasKey(provider.id)}
                        fallback={(
                          <ApiKeyInput
                            placeholder={provider.keyPlaceholder ?? 'API key'}
                            value={inputs()[provider.id] ?? ''}
                            onInput={v => setInputs(prev => ({ ...prev, [provider.id]: v }))}
                            onBlurSave={v => handleSave(provider.id, v)}
                          />
                        )}
                      >
                        <div class="px-3 rounded-md bg-muted/40 flex gap-3 h-9 items-center justify-between">
                          <p class="text-xs">API key saved</p>
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            class="size-7"
                            onClick={() => handleSave(provider.id, '')}
                          >
                            <span class="i-ph-trash-duotone size-4" />
                          </Button>
                        </div>
                      </Show>
                    </div>
                  </div>
                )}
              </For>
            </div>
          )}
        </Show>
      </div>
    </section>
  )
}
