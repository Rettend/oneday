import { Button } from '~/components/ui/button'

export default function Today() {
  return (
    <section class="flex flex-col gap-4">
      <header class="flex items-center justify-between">
        <h1 class="text-2xl tracking-tight font-semibold">Today</h1>
        <div class="text-primary rounded-full bg-primary/15 flex size-14 shadow-inner shadow-primary/30 items-center justify-center">
          <span class="i-ph-sun-horizon-duotone size-8" />
        </div>
        <Button class="bg-primary" variant="default">
          Generate quests
        </Button>
      </header>
      <div class="text-muted-foreground">
        Coming soon: dailies, todos, live timeline, quick stats.
      </div>
    </section>
  )
}
