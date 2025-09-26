import { createSignal, Show } from 'solid-js'
import { ModeToggle } from '~/components/ModeToggle'
import { Button } from '~/components/ui/button'
import { TextField, TextFieldDescription, TextFieldErrorMessage, TextFieldLabel, TextFieldTextArea } from '~/components/ui/text-field'

export default function Home() {
  const [note, setNote] = createSignal('')
  const [touched, setTouched] = createSignal(false)

  return (
    <main class="min-h-[100dvh] from-background to-muted/30 bg-gradient-to-b">
      <section class="container mx-auto max-w-3xl flex flex-col gap-8 px-4 py-12">
        <header class="flex flex-col gap-2 text-center">
          <h1 class="text-4xl font-extrabold tracking-tight md:text-5xl">
            Build your day like a game
          </h1>
          <p class="text-muted-foreground">
            Turn todos into quests, earn XP, unlock achievements.
          </p>
          <ModeToggle />
        </header>

        <div class="border rounded-xl bg-card p-5 shadow-sm">
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
            <Button disabled={!note()}>
              <span class="i-ph-sparkle-duotone" />
              Generate quests
            </Button>
          </div>
        </div>

        <div class="grid gap-4 md:grid-cols-2">
          <div class="border rounded-xl bg-card p-4 shadow-sm">
            <div class="flex items-center gap-3">
              <span class="i-ph-trophy-duotone text-3xl text-amber-500" />
              <div>
                <p class="font-semibold">First Steps</p>
                <p class="text-xs text-muted-foreground">Rarity: Bronze • Tier I</p>
              </div>
            </div>
            <p class="mt-3 text-sm text-muted-foreground">
              Complete your first quest. Reward: 50 XP.
            </p>
            <div class="mt-4 h-2 w-full rounded-full bg-muted">
              <div class="h-2 w-1/5 rounded-full bg-primary" />
            </div>
          </div>

          <div class="border rounded-xl bg-card p-4 shadow-sm">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="i-ph-sword-duotone text-2xl text-primary" />
                <p class="font-semibold">Quest Preview</p>
              </div>
              <span class="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">+120 XP</span>
            </div>
            <ul class="mt-3 text-sm space-y-2">
              <li class="flex items-center gap-2">
                <span class="i-ph-check-circle-duotone text-green-500" />
                Outline onboarding checklist
              </li>
              <li class="flex items-center gap-2">
                <span class="i-ph-check-circle-duotone text-green-500" />
                Study TS utility types 30m
              </li>
              <li class="flex items-center gap-2">
                <span class="i-ph-check-circle-duotone text-green-500" />
                Inbox to zero (15m)
              </li>
            </ul>
          </div>
        </div>

        <footer class="text-center text-xs text-muted-foreground">
          v0 design preview — no navbar yet.
        </footer>
      </section>
    </main>
  )
}
