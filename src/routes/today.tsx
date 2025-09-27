export default function Today() {
  return (
    <section class="flex flex-col gap-4">
      <header class="flex items-center justify-between">
        <h1 class="text-2xl tracking-tight font-semibold">Today</h1>
        <button class="text-sm text-primary-foreground px-3 py-2 rounded-md bg-primary inline-flex gap-2 items-center justify-center hover:bg-primary/90">
          <span class="i-ph-sparkle-duotone" />
          Generate quests
        </button>
      </header>
      <div class="text-muted-foreground">
        Coming soon: dailies, todos, live timeline, quick stats.
      </div>
    </section>
  )
}
