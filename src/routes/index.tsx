import { createSignal, Show } from 'solid-js'
import { Button } from '~/components/ui/button'
import { TextField, TextFieldDescription, TextFieldErrorMessage, TextFieldLabel, TextFieldTextArea } from '~/components/ui/text-field'

export default function Home() {
  const [note, setNote] = createSignal('')
  const [touched, setTouched] = createSignal(false)

  return (
    <main class="bg-[radial-gradient(520px_520px_at_0_0,oklch(var(--primary)_/_0.15)_9.29%,transparent_100%)] bg-background min-h-100dvh">
      <section class="mx-auto px-4 py-12 container flex flex-col gap-8 max-w-3xl">
        <header class="text-center flex flex-col gap-2">
          <h1 class="text-4xl tracking-tight font-extrabold md:text-5xl">
            Build your day like a game
          </h1>
          <p class="text-muted-foreground">
            Turn todos into quests, earn XP, unlock achievements.
          </p>
        </header>

        <div class="p-5 border rounded-xl bg-card shadow-sm">
          <TextField class="w-full">
            <TextFieldLabel>What should we turn into quests?</TextFieldLabel>
            <TextFieldDescription>
              Paste thoughts freely — it saves on blur to minimize clicks.
            </TextFieldDescription>
            <TextFieldTextArea
              rows={5}
              placeholder="e.g., Ship onboarding, study TypeScript, gym 45m, clean inbox…"
              onBlur={(e) => {
                setTouched(true)
                setNote(e.currentTarget.value.trim())
              }}
            />
            <Show when={touched() && !note()}>
              <TextFieldErrorMessage>Please add a short note.</TextFieldErrorMessage>
            </Show>
          </TextField>

          <div class="mt-4 flex items-center justify-between">
            <span class="text-xs text-muted-foreground">
              {note() ? `${note().length} characters` : 'No input yet'}
            </span>
            <Button class="bg-primary" variant="default">
              Generate quests
            </Button>
          </div>
        </div>

        <div class="gap-4 grid md:grid-cols-2">
          <div class="p-4 border rounded-xl bg-card shadow-sm">
            <div class="flex gap-3 items-center">
              <span class="i-ph-trophy-duotone text-3xl text-amber-500" />
              <div>
                <p class="font-semibold">First Steps</p>
                <p class="text-xs text-muted-foreground">Rarity: Bronze • Tier I</p>
              </div>
            </div>
            <p class="text-sm text-muted-foreground mt-3">
              Complete your first quest. Reward: 50 XP.
            </p>
            <div class="mt-4 rounded-full bg-muted h-2 w-full">
              <div class="rounded-full bg-primary h-2 w-1/5" />
            </div>
          </div>

          <div class="p-4 border rounded-xl bg-card shadow-sm">
            <div class="flex items-center justify-between">
              <div class="flex gap-2 items-center">
                <span class="i-ph-sword-duotone text-2xl text-primary" />
                <p class="font-semibold">Quest Preview</p>
              </div>
              <span class="text-xs text-primary px-2 py-0.5 rounded-full bg-primary/10">+120 XP</span>
            </div>
            <ul class="text-sm mt-3 space-y-2">
              <li class="flex gap-2 items-center">
                <span class="i-ph-check-circle-duotone text-green-500" />
                Outline onboarding checklist
              </li>
              <li class="flex gap-2 items-center">
                <span class="i-ph-check-circle-duotone text-green-500" />
                Study TS utility types 30m
              </li>
              <li class="flex gap-2 items-center">
                <span class="i-ph-check-circle-duotone text-green-500" />
                Inbox to zero (15m)
              </li>
            </ul>
          </div>
        </div>

        <footer class="text-xs text-muted-foreground text-center">
          v0 design preview — no navbar yet.
        </footer>
      </section>
    </main>
  )
}
